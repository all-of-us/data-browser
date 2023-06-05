# Calls to common.run_inline in this file may use a quoted string purposefully
# to cause system() or spawn() to run the command in a shell. Calls with arrays
# are not run in a shell, which can break usage of the CloudSQL proxy.

require_relative "../../aou-utils/serviceaccounts"
require_relative "../../aou-utils/utils/common"
require_relative "../../aou-utils/workbench"
require_relative "cloudsqlproxycontext"
require_relative "environments"
require_relative "gcloudcontext"
require_relative "wboptionsparser"
require "benchmark"
require "fileutils"
require "io/console"
require "json"
require "optparse"
require "ostruct"
require "tempfile"
require "net/http"
require "json"

INSTANCE_NAME = "databrowsermaindb"
FAILOVER_INSTANCE_NAME = "databrowserbackupdb"
SERVICES = %W{servicemanagement.googleapis.com storage-component.googleapis.com iam.googleapis.com
              compute.googleapis.com admin.googleapis.com appengine.googleapis.com
              cloudbilling.googleapis.com sqladmin.googleapis.com sql-component.googleapis.com
              clouderrorreporting.googleapis.com bigquery-json.googleapis.com}
DRY_RUN_CMD = %W{echo [DRY_RUN]}

def run_inline_or_log(dry_run, args)
  cmd_prefix = dry_run ? DRY_RUN_CMD : []
  Common.new.run_inline(cmd_prefix + args)
end

def get_cdr_sql_project(project)
  return must_get_env_value(project, :cdr_sql_instance).split(":")[0]
end

def init_new_cdr_db(args)
  Dir.chdir('db-cdr') do
    Common.new.run_inline %W{./generate-cdr/init-new-cdr-db.sh} + args
  end
end

def gcs_vars_path(project)
  return "gs://#{project}-credentials/vars.env"
end

def read_db_vars(gcc)
  vars = Workbench.read_vars(Common.new.capture_stdout(%W{
    gsutil cat #{gcs_vars_path(gcc.project)}
  }))
  if vars.empty?
    Common.new.error "Failed to read #{gcs_vars_path(gcc.project)}"
    exit 1
  end
  # Note: CDR project and target project may be the same.
  cdr_project = get_cdr_sql_project(gcc.project)
  cdr_vars_path = gcs_vars_path(cdr_project)
  cdr_vars = Workbench.read_vars(Common.new.capture_stdout(%W{
    gsutil cat #{cdr_vars_path}
  }))
  if cdr_vars.empty?
    Common.new.error "Failed to read #{cdr_vars_path}"
    exit 1
  end
  return vars.merge({
    'PUBLIC_DB_CONNECTION_STRING' => cdr_vars['PUBLIC_DB_CONNECTION_STRING'],
    'PUBLIC_DB_USER' => cdr_vars['PUBLIC_DB_USER'],
    'PUBLIC_DB_PASSWORD' => cdr_vars['PUBLIC_DB_PASSWORD']
  })
end

def format_benchmark(bm)
  "%ds" % [bm.real]
end

def start_local_db_service()
  common = Common.new
  deadlineSec = 40

  bm = Benchmark.measure {
    common.run_inline %W{docker-compose up -d db}

    common.status "waiting up to #{deadlineSec}s for mysql service to start..."
    start = Time.now
    until (common.run %W{docker-compose exec -T db mysqladmin ping --silent}).success?
      if Time.now - start >= deadlineSec
        raise("mysql docker service did not become available after #{deadlineSec}s")
      end
      sleep 1
    end
  }
  common.status "Database startup complete (#{format_benchmark(bm)})"
end

def dev_up(cmd_name, args)
  op = WbOptionsParser.new(cmd_name, args)
  op.opts.start_db = true
  op.add_option(
      "--nostart-db",
      ->(opts, _) { opts.start_db = false },
      "If specified, don't start the DB service. This is useful when running " +
      "within docker, i.e. on CircleCI, as the DB service runs via docker-compose")
  op.parse.validate

  common = Common.new

  account = get_auth_login_account()
  if account.nil?
    raise("Please run 'gcloud auth login' before starting the server.")
  end

  at_exit do
    common.run_inline %W{docker-compose down} if op.opts.start_db
  end

  setup_local_environment()

  overall_bm = Benchmark.measure {
    start_local_db_service() if op.opts.start_db

    common.status "Database init & migrations..."
    bm = Benchmark.measure {
      Dir.chdir('db') do
        common.run_inline %W{./run-migrations.sh main}
      end
      init_new_cdr_db %W{--cdr-db-name public}
    }
    common.status "Database init & migrations complete (#{format_benchmark(bm)})"

    common.status "Loading configs & data..."
    bm = Benchmark.measure {
      common.run_inline %W{./libproject/load_local_data_and_configs.sh}
    }
    common.status "Loading configs complete (#{format_benchmark(bm)})"
  }
  common.status "Total dev-env setup time: #{format_benchmark(overall_bm)}"

  run_api_incremental()
end

Common.register_command({
  :invocation => "dev-up",
  :description => "Brings up the development environment, including db migrations and config " \
     "update. (You can use run-api instead if database and config are up-to-date.)",
  :fn => ->(*args) { dev_up("dev-up", args) }
})

def run_api_incremental()
  common = Common.new

  # The GAE gradle configuration depends on the existence of an sa-key.json file for auth.
  get_test_service_account()

  begin
    common.status "Starting API server..."
    # appengineStart must be run with the Gradle daemon or it will stop outputting logs as soon as
    # the application has finished starting.
    common.run_inline "./gradlew --daemon appengineRun &"

    # incrementalHotSwap must be run without the Gradle daemon or stdout and stderr will not appear
    # in the output.
    common.run_inline %W{./gradlew --continuous incrementalHotSwap}
  rescue Interrupt
    # Do nothing
  ensure
    common.run_inline %W{./gradlew --stop}
  end
end

def setup_local_environment()
  ENV.update(Workbench.read_vars_file("db/vars.env"))
  ENV.update(must_get_env_value("local", :gae_vars))
  ENV["DB_HOST"] = "127.0.0.1"
  ENV["PUBLIC_DB_HOST"] = "127.0.0.1"
  ENV["DB_CONNECTION_STRING"] = "jdbc:mysql://127.0.0.1/databrowser?useSSL=false"
  ENV["PUBLIC_DB_CONNECTION_STRING"] = "jdbc:mysql://127.0.0.1/public?useSSL=false"
end

# TODO(RW-605): This command doesn't actually execute locally as it assumes a docker context.
#
# This command is only ever meant to be run via CircleCI; see .circleci/config.yml
def run_local_migrations()
  setup_local_environment()
  # Runs migrations against the local database.
  common = Common.new
  Dir.chdir('db') do
    common.run_inline %W{./run-migrations.sh main}
  end
  Dir.chdir('db-cdr/generate-cdr') do
    common.run_inline %W{./init-new-cdr-db.sh --cdr-db-name cdr}
  end
  common.run_inline %W{gradle :loadConfig -Pconfig_key=main -Pconfig_file=config/config_local.json}
  common.run_inline %W{gradle :loadConfig -Pconfig_key=cdrBigQuerySchema -Pconfig_file=config/cdm/cdm_5_2.json}
  common.run_inline %W{gradle :updateCdrConfig -PappArgs=['config/cdr_config_local.json',false]}
end

Common.register_command({
  :invocation => "run-local-migrations",
  :description => "Runs DB migrations with the local MySQL instance. You must set MYSQL_ROOT_PASSWORD before running this.",
  :fn => ->() { run_local_migrations() }
})

def start_local_public_api()
  setup_local_environment()
  common = Common.new
  Dir.chdir('../public-api') do
    common.status "Starting public API server..."
    common.run_inline %W{./gradlew appengineStart}
  end
end

Common.register_command({
  :invocation => "start-local-public-api",
  :description => "Starts public-api using the local MySQL instance. You must set MYSQL_ROOT_PASSWORD before running this.",
  :fn => ->() { start_local_public_api() }
})

def stop_local_public_api()
  setup_local_environment()
  common = Common.new
  Dir.chdir('../public-api') do
    common.status "Stopping public API server..."
    common.run_inline %W{./gradlew appengineStop}
  end
end

Common.register_command({
  :invocation => "stop-local-public-api",
  :description => "Stops locally running public api.",
  :fn => ->() { stop_local_public_api() }
})

def run_local_public_api_tests()
  common = Common.new
  status = common.capture_stdout %W{curl --silent --fail http://localhost:8083/}
  if status != 'AllOfUs Public API'
    common.error "Error probing public-api; received: #{status}"
    common.error "Server logs:"
    common.run_inline %W{cat ../public-api/build/dev-appserver-out/dev_appserver.out}
    exit 1
  end
  common.status "public-api started up."
end

Common.register_command({
  :invocation => "run-local-public-api-tests",
  :description => "Runs smoke tests against public-api server",
  :fn => ->() { run_local_public_api_tests() }
})

def run_public_api()
  common = Common.new
  ServiceAccountContext.new(TEST_PROJECT).run do
    common.status "Starting API. This can take a while. Thoughts on reducing development cycle time"
    common.status "are here:"
    common.status "  https://github.com/all-of-us/workbench/blob/master/api/doc/2017/dev-cycle.md"
    at_exit { common.run_inline %W{docker-compose down} }
    common.run_inline_swallowing_interrupt %W{docker-compose up public-api}
  end
end

def run_public_api_and_db()
  setup_local_environment()

  common = Common.new
  at_exit { common.run_inline %W{docker-compose down} }
  start_local_db_service()

  run_api_incremental()
end

Common.register_command({
  :invocation => "run-public-api",
  :description => "Runs the api server (assumes database and config are already up-to-date.)",
  :fn => ->() { run_public_api_and_db() }
})

def validate_swagger(cmd_name, args)
  Common.new.run_inline %W{./gradlew validateSwagger} + args
end

Common.register_command({
  :invocation => "validate-swagger",
  :description => "Validate swagger definition files",
  :fn => ->(*args) { validate_swagger("validate-swagger", args) }
})

def run_public_api_tests(cmd_name, args)
  Dir.chdir('../public-api') do
    Common.new.run_inline %W{./gradlew :test} + args
  end
end

Common.register_command({
  :invocation => "test-public-api",
  :description => "Runs public API tests. To run a single test, add (for example) " \
      "--tests org.pmiops.workbench.cdr.dao.AchillesAnalysisDaoTest",
  :fn => ->(*args) { run_public_api_tests("test-public-api", args) }
})

def run_all_tests(cmd_name, args)
  run_public_api_tests(cmd_name, args)
end

Common.register_command({
  :invocation => "test",
  :description => "Runs all tests (api and public-api). To run a single test, add (for example) " \
      "--tests org.pmiops.workbench.interceptors.AuthInterceptorTest",
  :fn => ->(*args) { run_all_tests("test", args) }
})


def run_integration_tests(cmd_name, *args)
  common = Common.new
  ServiceAccountContext.new(TEST_PROJECT).run do
    common.run_inline %W{./gradlew integrationTest} + args
  end
end

Common.register_command({
  :invocation => "integration",
  :description => "Runs integration tests. Excludes nightly-only tests.",
  :fn => ->(*args) { run_integration_tests("integration", *args) }
})

def run_bigquery_tests(cmd_name, *args)
  common = Common.new
  ServiceAccountContext.new(TEST_PROJECT).run do
    common.run_inline %W{./gradlew bigquerytest} + args
  end
end

Common.register_command({
  :invocation => "bigquerytest",
  :description => "Runs bigquerytest tests.",
  :fn => ->(*args) { run_bigquery_tests("bigquerytest", *args) }
})

def run_gradle(cmd_name, args)
  begin
    Common.new.run_inline %W{./gradlew} + args
  ensure
    if $! && $!.status != 0
      Common.new.error "Command exited with non-zero status"
      exit 1
    end
  end
end

Common.register_command({
  :invocation => "gradle",
  :description => "Runs gradle inside the API docker container with the given arguments.",
  :fn => ->(*args) { run_gradle("gradle", args) }
})

def connect_to_db()
  common = Common.new
  common.status "Starting database if necessary..."
  common.run_inline %W{docker-compose up -d db}
  cmd = "MYSQL_PWD=root-notasecret mysql --database=databrowser"
  common.run_inline %W{docker-compose exec db sh -c #{cmd}}
end

Common.register_command({
  :invocation => "connect-to-db",
  :description => "Connect to the running database via mysql.",
  :fn => ->() { connect_to_db() }
})

def docker_clean()
  common = Common.new

  # --volumes clears out any cached data between runs, e.g. the MySQL database
  # --rmi local forces a rebuild of any local dev images on the next run - usually the pieces will
  #   still be cached and this is fast.
  common.run_inline %W{docker-compose down --volumes --rmi local}

  # This keyfile gets created and cached locally on dev-up. Though it's not
  # specific to Docker, it is mounted locally for docker runs. For lack of a
  # better "dev teardown" hook, purge that file here; e.g. in case we decide to
  # invalidate a dev key or change the service account.
  common.run_inline %W{rm -f #{ServiceAccountContext::SERVICE_ACCOUNT_KEY_PATH}}

  # See https://github.com/docker/compose/issues/3447
  common.status "Cleaning complete. docker-compose 'not found' errors can be safely ignored"
end

Common.register_command({
  :invocation => "docker-clean",
  :description => \
    "Removes docker containers and volumes, allowing the next `dev-up` to" \
    " start from scratch (e.g., the database will be re-created). Includes ALL" \
    " docker images, not just for the API.",
  :fn => ->() { docker_clean() }
})

def rebuild_image()
  common = Common.new

  common.run_inline %W{docker-compose build}
end

Common.register_command({
  :invocation => "rebuild-image",
  :description => "Re-builds the dev docker image (necessary when Dockerfile is updated).",
  :fn => ->() { rebuild_image() }
})

def copy_file_to_gcs(source_path, bucket, filename)
  common = Common.new
  common.run_inline %W{gsutil cp #{source_path} gs://#{bucket}/#{filename}}
end

# Common.run_inline uses spawn() which doesn't handle pipes/redirects.
def run_with_redirects(command_string, to_redact = "")
  common = Common.new
  command_to_echo = command_string.clone
  if to_redact
    command_to_echo.sub! to_redact, "*" * to_redact.length
  end
  common.put_command(command_to_echo)
  unless system(command_string)
    raise("Error running: " + command_to_echo)
  end
end

def get_auth_login_account()
  return `gcloud config get-value account`.strip()
end

def drop_cloud_db(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate
  CloudSqlProxyContext.new(gcc.project).run do
    puts "Dropping database..."
    pw = ENV["MYSQL_ROOT_PASSWORD"]
    run_with_redirects(
        "cat db/drop_db.sql | envsubst | " \
        "mysql -u \"root\" -p\"#{pw}\" --host 127.0.0.1 --port 3307",
        pw)
  end
end

Common.register_command({
  :invocation => "drop-cloud-db",
  :description => "Drops the Cloud SQL database for the specified project",
  :fn => ->(*args) { drop_cloud_db("drop-cloud-db", *args) }
})

def drop_cloud_cdr(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate
  CloudSqlProxyContext.new(gcc.project).run do
    puts "Dropping cdr database..."
    pw = ENV["MYSQL_ROOT_PASSWORD"]
    run_with_redirects(
        "cat db-cdr/drop_db.sql | envsubst | " \
        "mysql -u \"root\" -p\"#{pw}\" --host 127.0.0.1 --port 3307",
        pw)
  end
end

Common.register_command({
  :invocation => "drop-cloud-cdr",
  :description => "Drops the cdr schema of Cloud SQL database for the specified project",
  :fn => ->(*args) { drop_cloud_cdr("drop-cloud-cdr", *args) }
})

def run_local_all_migrations()
  setup_local_environment()
  start_local_db_service()

  common = Common.new
  Dir.chdir('db') do
    common.run_inline %W{./run-migrations.sh main}
  end

  init_new_cdr_db %W{--cdr-db-name public}
  init_new_cdr_db %W{--cdr-db-name public --run-list data --context local}
end

Common.register_command({
  :invocation => "run-local-all-migrations",
  :description => "Runs local data/schema migrations for the cdr and workbench schemas.",
  :fn => ->() { run_local_all_migrations() }
})


def generate_public_cdr_counts(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  op.add_option(
      "--bq-project [bq-project]",
      ->(opts, v) { opts.bq_project = v},
      "BQ Project required."
    )
    op.add_option(
      "--bq-dataset [bq-dataset]",
      ->(opts, v) { opts.bq_dataset = v},
      "BQ dataset required."
    )
    op.add_option(
      "--project [--project]",
      ->(opts, v) { opts.project = v},
      "Project required."
    )
    op.add_option(
      "--cdr-version [cdr-version]",
      ->(opts, v) { opts.cdr_version = v},
      "CDR version required."
    )
    op.add_option(
      "--bucket [bucket]",
      ->(opts, v) { opts.bucket = v},
      "GCS bucket required."
    )
    op.add_option(
      "--search-vat [search-vat]",
      ->(opts, v) { opts.search_vat = v ? v : false},
      "Flag to generate search table from VAT. Optional."
    )
    op.add_validator ->(opts) { raise ArgumentError unless opts.bq_project and opts.bq_dataset and opts.project and opts.cdr_version and opts.bucket}
    gcc = GcloudContextV2.new(op)
    op.parse.validate
    gcc.validate()

    with_cloud_proxy_and_db(gcc) do
        common = Common.new
        Dir.chdir('db-cdr') do
          common.run_inline %W{./generate-cdr/generate-public-cdr-counts.sh #{op.opts.bq_project} #{op.opts.bq_dataset} #{op.opts.project} #{op.opts.cdr_version} #{op.opts.bucket} #{op.opts.search_vat}}
        end
    end
end

Common.register_command({
  :invocation => "generate-public-cdr-counts",
  :description => "generate-public-cdr-counts --bq-project <PROJECT> --bq-dataset <DATASET> --public-project <PROJECT> \
 --cdr-version=<''|YYYYMMDD> --bucket <BUCKET> --search-vat <SEARCH_VAT>
Generates databases in bigquery with non de-identified data from a cdr that will be imported to mysql/cloudsql to be used by databrowser.",
  :fn => ->(*args) { generate_public_cdr_counts("generate-public-cdr-counts", *args) }
})

def generate_cloudsql_db(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  op.add_option(
    "--project [project]",
    ->(opts, v) { opts.project = v},
    "Project the Cloud Sql instance is in"
  )
  op.add_option(
    "--instance [instance]",
    ->(opts, v) { opts.instance = v},
    "Cloud SQL instance"
  )
  op.add_option(
      "--database [database]",
      ->(opts, v) { opts.database = v},
      "Database name"
  )
  op.add_option(
    "--bucket [bucket]",
    ->(opts, v) { opts.bucket = v},
    "Name of the GCS bucket containing the SQL dump"
  )

  op.add_validator ->(opts) { raise ArgumentError unless opts.project and opts.instance and opts.database and opts.bucket }
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate()

  with_cloud_proxy_and_db(gcc) do
    common = Common.new
    Dir.chdir('db-cdr') do
        common.run_inline %W{./generate-cdr/generate-cloudsql-db.sh #{op.opts.project} #{op.opts.instance} #{op.opts.database} #{op.opts.bucket}}
    end
  end
end

Common.register_command({
  :invocation => "generate-cloudsql-db",
  :description => "generate-cloudsql-db  --project <PROJECT> --instance <INSTANCE> \
--database <cdrYYYYMMDD> --bucket <BUCKET>
Generates a cloudsql database from data in a bucket. Used to make cdr and public count databases.",
  :fn => ->(*args) { generate_cloudsql_db("generate-cloudsql-db", *args) }
})

def cloudsql_import(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  op.add_option(
      "--project [project]",
      ->(opts, v) { opts.project = v},
      "Project the Cloud Sql instance is in"
  )
  op.add_option(
      "--instance [instance]",
      ->(opts, v) { opts.instance = v},
      "Cloud SQL instance"
  )
  op.add_option(
      "--database [database]",
      ->(opts, v) { opts.database = v},
      "Database name"
  )
  op.add_option(
      "--bucket [bucket]",
      ->(opts, v) { opts.bucket = v},
      "Name of the GCS bucket containing the SQL dump"
  )
  op.parse.validate

  ServiceAccountContext.new(op.opts.project).run do
    Dir.chdir('db-cdr') do
      common = Common.new
      common.run_inline %W{./generate-cdr/cloudsql-import.sh
        --project #{op.opts.project}
        --instance #{op.opts.instance}
        --database #{op.opts.database}
        --bucket #{op.opts.bucket}
        --file #{op.opts.file}}
    end
  end
end


Common.register_command({
  :invocation => "cloudsql-import",
  :description => "cloudsql-import --project <PROJECT> --instance <CLOUDSQL_INSTANCE>
   --database <DATABASE> --bucket <BUCKET> [--create-db-sql-file <SQL.sql>] [--file <ONLY_IMPORT_ME>]
Import bucket of files or a single file in a bucket to a cloudsql database",
                            :fn => ->(*args) { cloudsql_import("cloud-sql-import", *args) }
                        })

def generate_local_cdr_db(*args)
  common = Common.new
  Dir.chdir('db-cdr') do
    common.run_inline %W{./generate-cdr/generate-local-cdr-db.sh} + args
  end
end

Common.register_command({
  :invocation => "generate-local-cdr-db",
  :description => "generate-cloudsql-cdr --cdr-version <''|YYYYMMDD> --cdr-db-prefix <cdr|public> --bucket <BUCKET>
Creates and populates local mysql database from data in bucket made by generate-private/public-cdr-counts.",
  :fn => ->(*args) { generate_local_cdr_db(*args) }
})


def generate_local_count_dbs(*args)
  common = Common.new
  Dir.chdir('db-cdr') do
    common.run_inline %W{./generate-cdr/generate-local-count-dbs.sh} + args
  end
end

Common.register_command({
  :invocation => "generate-local-count-dbs",
  :description => "generate-local-count-dbs.sh --cdr-version <''|YYYYMMDD> --bucket <BUCKET>
Creates and populates local mysql databases cdr<VERSION> and public<VERSION> from data in bucket made by generate-private/public-cdr-counts.",
  :fn => ->(*args) { generate_local_count_dbs(*args) }
})


def mysqldump_db(*args)
  common = Common.new
  Dir.chdir('db-cdr') do
    common.run_inline %W{./generate-cdr/make-mysqldump.sh} + args
  end
end

Common.register_command({
  :invocation => "mysqldump-local-db",
  :description => "mysqldump-local-db --db-name <LOCALDB> --bucket <BUCKET>
Dumps the local mysql db and uploads the .sql file to bucket",
  :fn => ->(*args) { mysqldump_db(*args) }
})

def local_mysql_import(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  op.add_option(
    "--sql-dump-file [filename]",
    ->(opts, v) { opts.file = v},
    "File name of the SQL dump to import"
  )
  op.add_option(
    "--bucket [bucket]",
    ->(opts, v) { opts.bucket = v},
    "Name of the GCS bucket containing the SQL dump"
  )
  op.parse.validate

  common = Common.new
  Dir.chdir('db-cdr') do
    common.run_inline %W{./generate-cdr/local-mysql-import.sh
        --sql-dump-file #{op.opts.file} --bucket #{op.opts.bucket}}
  end
end
Common.register_command({
                            :invocation => "local-mysql-import",
                            :description => "local-mysql-import --sql-dump-file <FILE.sql> --bucket <BUCKET>
Imports .sql file to local mysql instance",
                            :fn => ->(*args) { local_mysql_import("local-mysql-import", *args) }
                        })


def run_drop_cdr_db()
  common = Common.new
  Dir.chdir('db-cdr') do
    common.run_inline %W{./run-drop-db.sh}
  end
end

Common.register_command({
  :invocation => "run-drop-cdr-db",
  :description => "Drops the cdr schema of SQL database for the specified project.",
  :fn => ->() { run_drop_cdr_db() }
})

def create_cdr_indices(cmd_name, args)
  op = WbOptionsParser.new(cmd_name, args)
  op.opts.data_browser = false
  op.opts.branch = "master"
  op.add_option(
    "--branch [--branch]",
    ->(opts, v) { opts.branch = v},
    "Branch. Optional - Default is master."
  )
  op.add_option(
    "--project [--project]",
    ->(opts, v) { opts.project = v},
    "Project. Required."
  )
  op.add_option(
    "--bq-dataset [bq-dataset]",
    ->(opts, v) { opts.bq_dataset = v},
    "BQ dataset. Required."
  )
  op.add_option(
    "--cdr-sql-bucket [cdr-sql-bucket]",
    ->(opts, v) { opts.cdr_sql_bucket = v},
    "Destination bucket name that holds sql files. Required."
  )
  op.add_option(
    "--cdr-version [cdr-version]",
    ->(opts, v) { opts.cdr_version = v},
    "CDR version. Required."
  )
  op.add_option(
    "--data-browser [data-browser]",
    ->(opts, v) { opts.data_browser = v},
    "Generate for data browser. Optional - Default is false"
  )
  op.add_option(
    "--search-vat [search-vat]",
    ->(opts, v) { opts.search_vat = v},
    "Generate search table from VAT. Optional - Default is false"
  )
  op.add_validator ->(opts) { raise ArgumentError unless opts.project and opts.bq_dataset and opts.cdr_version}
  op.parse.validate

  env = ENVIRONMENTS[op.opts.project]

  common = Common.new
  content_type = "Content-Type: application/json"
  accept = "Accept: application/json"
  circle_token = "Circle-Token: "
  payload = "{ \"branch\": \"#{op.opts.branch}\", \"parameters\": {\"db_build_cdr_indices\": true, \"cdr_source_project\": \"#{env.fetch(:source_cdr_project)}\", \"cdr_source_dataset\": \"#{op.opts.bq_dataset}\", \"cdr_sql_bucket\": \"#{env.fetch(:cdr_sql_bucket)}\", \"project\": \"#{op.opts.project}\", \"cdr_version_db_name\": \"#{op.opts.cdr_version}\", \"data_browser\": #{op.opts.data_browser}, \"search_vat\": #{op.opts.search_vat}}}"
  common.run_inline "curl -X POST https://circleci.com/api/v2/project/github/all-of-us/cdr-indices/pipeline -H '#{content_type}' -H '#{accept}' -H \"#{circle_token}\ $(cat ~/.circle-creds/key.txt)\" -d '#{payload}'"
end

Common.register_command({
  :invocation => "create-cdr-indices",
  :description => "Build the CDR indices using CircleCi",
  :fn => ->(*args) { create_cdr_indices("create-cdr-indices", args) }
})

def circle_import_cdr_data(cmd_name, args)
  op = WbOptionsParser.new(cmd_name, args)
  op.opts.branch = "master"
  op.add_option(
    "--branch [--branch]",
    ->(opts, v) { opts.branch = v},
    "Branch. Optional - Default is master."
  )
  op.add_option(
    "--project [--project]",
    ->(opts, v) { opts.project = v},
    "Project. Required."
  )
  op.add_option(
    "--database [database]",
    ->(opts, v) { opts.database = v},
    "Database. Required."
  )
  op.add_validator ->(opts) { raise ArgumentError unless opts.project and opts.database }
  op.parse.validate

  env = ENVIRONMENTS[op.opts.project]

  common = Common.new
  content_type = "Content-Type: application/json"
  accept = "Accept: application/json"
  circle_token = "Circle-Token: "
  payload = "{ \"branch\": \"#{op.opts.branch}\", \"parameters\": {\"db_import_cdr_data\": true, \"instance\": \"#{env.fetch(:instance)}\", \"project\": \"#{op.opts.project}\", \"database\": \"#{op.opts.database}\", \"bucket\": \"#{env.fetch(:cdr_sql_bucket)}\/#{op.opts.database}\"}}"
  common.run_inline "curl -X POST https://circleci.com/api/v2/project/github/all-of-us/cdr-indices/pipeline -H '#{content_type}' -H '#{accept}' -H \"#{circle_token}\ $(cat ~/.circle-creds/key.txt)\" -d '#{payload}'"
end

Common.register_command({
  :invocation => "circle-import-cdr-data",
  :description => "Import the cdr data build to cloudsql db with CircleCi",
  :fn => ->(*args) { circle_import_cdr_data("circle-import-cdr-data", args) }
})

Common.register_command({
  :invocation => "run-cloud-data-migrations",
  :description => "Runs data migrations in the cdr and workbench schemas on the Cloud SQL database for the specified project.",
  :fn => ->(*args) { run_cloud_data_migrations("run-cloud-data-migrations", args) }
})

def write_db_creds_file(project, public_db_name, root_password, databrowser_db_password, public_password=nil)
  instance_name = "#{project}:us-central1:#{INSTANCE_NAME}"
  db_creds_file = Tempfile.new("#{project}-vars.env")
  if db_creds_file
    begin
      db_creds_file.puts "DB_CONNECTION_STRING=jdbc:google:mysql://#{instance_name}/databrowser?rewriteBatchedStatements=true"
      db_creds_file.puts "DB_DRIVER=com.mysql.jdbc.GoogleDriver"
      db_creds_file.puts "DB_HOST=127.0.0.1"
      db_creds_file.puts "DB_NAME=databrowser"
      # TODO: make our CDR migration scripts update *all* CDR versions listed in the cdr_version
      # table of the workbench DB; then this shouldn't be needed anymore.
      db_creds_file.puts "PUBLIC_DB_NAME=#{public_db_name}"
      db_creds_file.puts "CLOUD_SQL_INSTANCE=#{instance_name}"
      db_creds_file.puts "LIQUIBASE_DB_USER=liquibase"
      db_creds_file.puts "LIQUIBASE_DB_PASSWORD=#{databrowser_db_password}"
      db_creds_file.puts "MYSQL_ROOT_PASSWORD=#{root_password}"
      db_creds_file.puts "DATABROWSER_DB_USER=databrowser"
      db_creds_file.puts "DATABROWSER_DB_PASSWORD=#{databrowser_db_password}"
      if public_password
        db_creds_file.puts "PUBLIC_DB_CONNECTION_STRING=jdbc:google:mysql://#{instance_name}/#{public_db_name}?rewriteBatchedStatements=true"
        db_creds_file.puts "PUBLIC_DB_USER=public"
        db_creds_file.puts "PUBLIC_DB_PASSWORD=#{public_password}"
      end
      db_creds_file.close

      copy_file_to_gcs(db_creds_file.path, "#{project}-credentials", "vars.env")
    ensure
      db_creds_file.unlink
    end
  else
    raise("Error creating file.")
  end
end

def update_cdr_config_options(cmd_name, args)
  op = WbOptionsParser.new(cmd_name, args)
  op.opts.dry_run = false
  op.add_option(
      "--dry_run",
      ->(opts, _) { opts.dry_run = "true"},
      "Make no changes.")
  return op
end

def update_cdr_config_for_project(cdr_config_file, dry_run)
  common = Common.new
  common.run_inline %W{
    gradle updateCdrConfig
   -PappArgs=['#{cdr_config_file}',#{dry_run}]}
end

def update_cdr_config(cmd_name, *args)
  op = update_cdr_config_options(cmd_name, args)
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate

  with_cloud_proxy_and_db(gcc) do
    cdr_config_file = must_get_env_value(gcc.project, :cdr_config_json)
    update_cdr_config_for_project("/w/public-api/config/#{cdr_config_file}", op.opts.dry_run)
  end
end

Common.register_command({
  :invocation => "update-cdr-config",
  :description => "Update CDR config (tiers and versions) in a cloud environment",
  :fn => ->(*args) { update_cdr_config("update-cdr-config", *args)}
})

def update_cdr_config_local(cmd_name, *args)
  setup_local_environment()
  op = update_cdr_config_options(cmd_name, args)
  op.parse.validate
  cdr_config_file = 'config/cdr_config_local.json'
  app_args = ["-PappArgs=['/w/public-api/" + cdr_config_file + "',false]"]
  common = Common.new
  common.run_inline %W{./gradlew updateCdrConfig} + app_args
end

Common.register_command({
  :invocation => "update-cdr-config-local",
  :description => "Update CDR config (tiers and versions) in the local environment",
  :fn => ->(*args) { update_cdr_config_local("update-cdr-config-local", *args)}
})

def connect_to_cloud_db(cmd_name, *args)
  common = Common.new
  op = WbOptionsParser.new(cmd_name, args)
  op.add_option(
    "--root",
    ->(opts, _) { opts.root = true },
    "Connect as root")
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate
  env = read_db_vars(gcc)
  CloudSqlProxyContext.new(gcc.project).run do
    password = op.opts.root ? env["MYSQL_ROOT_PASSWORD"] : env["DATABROWSER_DB_PASSWORD"]
    user = op.opts.root ? "root" : env["DATABROWSER_DB_USER"]
    common.run_inline %W{
      mysql --host=127.0.0.1 --port=3307 --user=#{user}
      --database=#{env["DB_NAME"]} --password=#{password}},
      password
  end
end

Common.register_command({
  :invocation => "connect-to-cloud-db",
  :description => "Connect to a Cloud SQL database via mysql.",
  :fn => ->(*args) { connect_to_cloud_db("connect-to-cloud-db", *args) }
})

def deploy_app(cmd_name, args)
  common = Common.new
  op = WbOptionsParser.new(cmd_name, args)
  op.opts.dry_run = false
  op.add_option(
    "--version [version]",
    ->(opts, v) { opts.version = v},
    "Version to deploy (e.g. your-username-test)"
  )
  op.add_option(
    "--promote",
    ->(opts, _) { opts.promote = true},
    "Promote this deploy to make it available at the root URL"
  )
  op.add_option(
    "--no-promote",
    ->(opts, _) { opts.promote = false},
    "Do not promote this deploy to make it available at the root URL"
  )
  op.add_option(
    "--dry-run",
    ->(opts, _) { opts.dry_run = true},
    "Don't actually deploy, just log the command lines which would be " +
    "executed on a real invocation."
  )
  op.add_option(
    "--quiet",
    ->(opts, _) { opts.quiet = true},
    "Don't display a confirmation prompt when deploying"
  )
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate

  ENV.update(read_db_vars(gcc))
  ENV.update(get_gae_vars(gcc.project))

  # Clear out generated files, which may be out of date; they will be regenerated by appengineStage.
  common.run_inline %W{rm -rf src/generated}

  common.run_inline %W{./gradlew :appengineStage}
  promote = "--no-promote"
  unless op.opts.promote.nil?
    promote = op.opts.promote ? "--promote" : "--no-promote"
  else
    promote = op.opts.version ? "--no-promote" : "--promote"
  end

  run_inline_or_log(op.opts.dry_run, %W{
    gcloud app deploy
      build/staged-app/app.yaml
      --project #{gcc.project} #{promote}
    } +
    (op.opts.quiet ? %W{--quiet} : []) +
    (op.opts.version ? %W{--version #{op.opts.version}} : []))
end

def deploy_public_api(cmd_name, args)
  common = Common.new
  common.status "Deploying public-api..."
  deploy_app(cmd_name, args)
end

Common.register_command({
  :invocation => "deploy-public-api",
  :description => "Deploys the public API server to the specified cloud project.",
  :fn => ->(*args) { deploy_public_api("deploy-public-api", args) }
})

def create_meta_db()
  run_with_redirects(
    "cat db/create_db.sql | envsubst | " \
    "mysql -u \"root\" -p\"#{ENV["MYSQL_ROOT_PASSWORD"]}\" --host 127.0.0.1 --port 3307",
    ENV["MYSQL_ROOT_PASSWORD"]
  )
end

def migrate_database(dry_run = false)
  common = Common.new
  common.status "Migrating main database..."
  Dir.chdir("db") do
    run_inline_or_log(dry_run, %W{gradle --info update -PrunList=main})
  end
end

def migrate_meta_db()
  common = Common.new
  common.status "Migrating metadata db..."
  Dir.chdir("db") do
    common.run_inline(%W{../gradlew --info update -PrunList=data -Pcontexts=cloud})
  end
end

def load_config(project, dry_run = false)
  config_json = must_get_env_value(project, :config_json)
  unless config_json
    raise("unknown project #{project}, expected one of #{configs.keys}")
  end

  common = Common.new
  common.status "Loading #{config_json} into database..."
  run_inline_or_log(dry_run, %W{gradle --info loadConfig -Pconfig_key=main -Pconfig_file=config/#{config_json}})
  run_inline_or_log(dry_run, %W{gradle --info loadConfig -Pconfig_key=cdrBigQuerySchema -Pconfig_file=config/cdm/cdm_5_2.json})
end

def with_cloud_proxy_and_db(gcc, service_account = nil, key_file = nil)
  ENV.update(read_db_vars(gcc))
  ENV["DB_PORT"] = "3307" # TODO(dmohs): Use MYSQL_TCP_PORT to be consistent with mysql CLI.
  CloudSqlProxyContext.new(gcc.project, service_account, key_file).run do
    yield(gcc)
  end
end

def with_cloud_proxy_and_db_env(cmd_name, args)
  op = WbOptionsParser.new(cmd_name, args)
  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate
  with_cloud_proxy_and_db(gcc) do |ctx|
    yield ctx
  end
end

def deploy(cmd_name, args)

  op = WbOptionsParser.new(cmd_name, args)
  op.opts.dry_run = false
  op.add_option(
    "--account [account]",
    ->(opts, v) { opts.account = v},
    "Service account to act as for deployment, if any. Defaults to the GAE " +
    "default service account."
  )
  op.add_option(
    "--version [version]",
    ->(opts, v) { opts.version = v},
    "Version to deploy (e.g. your-username-test)"
  )
  op.add_validator ->(opts) { raise ArgumentError unless opts.version}
  op.add_option(
    "--key-file [keyfile]",
    ->(opts, v) { opts.key_file = v},
    "Service account key file to use for deployment authorization"
  )
  op.add_option(
    "--dry-run",
    ->(opts, _) { opts.dry_run = true},
    "Don't actually deploy, just log the command lines which would be " +
    "executed on a real invocation."
  )
  op.add_option(
    "--promote",
    ->(opts, _) { opts.promote = true},
    "Promote this version to immediately begin serving API traffic"
  )
  op.add_option(
    "--no-promote",
    ->(opts, _) { opts.promote = false},
    "Deploy, but do not yet serve traffic from this version - DB migrations are still applied"
  )
  op.add_validator ->(opts) { raise ArgumentError if opts.promote.nil?}

  gcc = GcloudContextV2.new(op)
  op.parse.validate
  gcc.validate

  common = Common.new
  common.status "Running database migrations..."
  with_cloud_proxy_and_db(gcc, op.opts.account, op.opts.key_file) do |ctx|
    migrate_database(op.opts.dry_run)
    load_config(ctx.project, op.opts.dry_run)
    cdr_config_file = must_get_env_value(gcc.project, :cdr_config_json)
    update_cdr_config_for_project("config/#{cdr_config_file}", op.opts.dry_run)

    # Keep the cloud proxy context open for the service account credentials.
    deploy_public_api(cmd_name, %W{
      --project #{gcc.project}
      --version #{op.opts.version}
      #{op.opts.promote ? "--promote" : "--no-promote"}
      --quiet
    } + (op.opts.dry_run ? %W{--dry-run} : []))
  end
end

Common.register_command({
  :invocation => "deploy",
  :description => "Run DB migrations and deploy the API and public servers",
  :fn => ->(*args) { deploy("deploy", args) }
})


def run_cloud_migrations(cmd_name, args)
  with_cloud_proxy_and_db_env(cmd_name, args) { migrate_database }
end

Common.register_command({
  :invocation => "run-cloud-migrations",
  :description => "Runs database migrations on the Cloud SQL database for the specified project.",
  :fn => ->(*args) { run_cloud_migrations("run-cloud-migrations", args) }
})

def update_cloud_config(cmd_name, args)
  with_cloud_proxy_and_db_env(cmd_name, args) do |ctx|
    load_config(ctx.project)
  end
end

Common.register_command({
  :invocation => "update-cloud-config",
  :description => "Updates configuration in Cloud SQL database for the specified project.",
  :fn => ->(*args) { update_cloud_config("update-cloud-config", args) }
})

def docker_run(args)
  Common.new.run_inline %W{docker-compose run --rm scripts} + args
end

Common.register_command({
  :invocation => "docker-run",
  :description => "Runs the specified command in a docker container.",
  :fn => ->(*args) { docker_run(args) }
})

def create_project_resources(gcc)
  common = Common.new
  common.status "Enabling APIs..."
  for service in SERVICES
    common.run_inline("gcloud services enable #{service} --project #{gcc.project}")
  end
  common.status "Creating GCS bucket to store credentials..."
  common.run_inline %W{gsutil mb -p #{gcc.project} -c regional -l us-central1 gs://#{gcc.project}-credentials/}
  common.status "Creating Cloud SQL instances..."
  common.run_inline %W{gcloud sql instances create #{INSTANCE_NAME} --require-ssl --tier=db-n1-standard-2
                       --activation-policy=ALWAYS --backup-start-time 00:00
                       --failover-replica-name #{FAILOVER_INSTANCE_NAME} --enable-bin-log
                       --database-version MYSQL_5_7 --project #{gcc.project} --storage-auto-increase --async --maintenance-release-channel preview --maintenance-window-day SAT --maintenance-window-hour 5}
  common.status "Waiting for database instance to become ready..."
  loop do
    sleep 3.0
    db_status = `gcloud sql instances describe databrowsermaindb --project #{gcc.project} | grep state`
    common.status "DB status: #{db_status}"
    break if db_status.include? "RUNNABLE"
  end
  common.status "Creating AppEngine app..."
  common.run_inline %W{gcloud app create --region us-central --project #{gcc.project}}
end

def setup_project_data(gcc, public_db_name)
  root_password, databrowser_db_password = random_password(), random_password()

  public_password = nil
  if gcc.project == get_cdr_sql_project(gcc.project)
    # Only initialize a public user/pass if this environment will have CDR dbs.
    public_password = random_password()
  end

  common = Common.new
  # This changes database connection information; don't call this while the server is running!
  common.status "Writing DB credentials file..."
  write_db_creds_file(gcc.project, public_db_name, root_password, databrowser_db_password, public_password)
  common.status "Setting root password..."
  run_with_redirects("gcloud sql users set-password root --host % --project #{gcc.project} " +
                     "--instance #{INSTANCE_NAME} --password #{root_password}",
                     root_password)
  # Don't delete the credentials created here; they will be stored in GCS and reused during
  # deployment, etc.
  with_cloud_proxy_and_db(gcc) do
    common.status "Setting up databases and users..."
    create_meta_db

    common.status "Running schema migrations..."
    migrate_database
  end
end

def random_password()
  return rand(36**20).to_s(36)
end

# TODO: add a goal which updates passwords but nothing else
# TODO: add a goal which updates CDR DBs but nothing else

def setup_cloud_project(cmd_name, *args)
  op = WbOptionsParser.new(cmd_name, args)
  op.add_option(
    "--public-db-name [PUBLIC_DB]",
    ->(opts, v) { opts.public_db_name = v},
    "Name of the public db to use for the data browser. (example: public20180206) This will " +
    "subsequently be created by cloudsql-import."
  )
  op.add_validator ->(opts) { raise ArgumentError unless opts.public_db_name}
  gcc = GcloudContextV2.new(op)

  op.parse.validate
  gcc.validate

  create_project_resources(gcc)
  setup_project_data(gcc, op.opts.public_db_name)
end

Common.register_command({
  :invocation => "setup-cloud-project",
  :description => "Initializes resources within a cloud project that has already been created",
  :fn => ->(*args) { setup_cloud_project("setup-cloud-project", *args) }
})

def get_test_service_account()
  ServiceAccountContext.new(TEST_PROJECT).run do
    print "Service account key is now in sa-key.json"
  end
end

Common.register_command({
  :invocation => "get-test-service-creds",
  :description => "Copies sa-key.json locally (for use when running tests from an IDE, etc).",
  :fn => ->() { get_test_service_account()}
})


