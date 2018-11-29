# data-browser
All of Us public data browser.

## Setup for Development

System requirements:

  * [Docker CE](https://www.docker.com/community-edition)
  * [Ruby](https://www.ruby-lang.org/en/downloads/)
  * [Python](https://www.python.org/downloads/) >= 2.7.9
  * [gcloud](https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version)

Docker must be installed to build and run code (For Google workstations, see
go/installdocker.). Ruby is required to run our development scripts, which
document common operations and provide a convenient way to perform them.
Python is required by some scripts and the Google Cloud Tools.

After you've installed `gcloud`, login using your `pmi-ops` account:

```shell
gcloud auth login
```

To initialize the project, run the following:

```shell
git clone https://github.com/all-of-us/data-browser
cd data-browser
git submodule update --init --recursive
```

Then set up [git secrets](#git-secrets) and fire up the [development servers](#running-the-dev-servers).

## Development Process

To make changes, do:

```shell
git checkout master
git pull
git checkout -b <USERNAME>/<BRANCH_NAME>
# (make changes and git add / commit them)
git push -u origin <USERNAME>/<BRANCH_NAME>
```

And make a pull request in your browser at
https://github.com/all-of-us/data-browser based on your upload.

After responding to changes, merge in GitHub.

### UI

* Direct your editor to write swap files outside the source tree, so Webpack
does not reload when they're updated.
[Example for vim](https://github.com/angular/angular-cli/issues/4593).

## Running the Dev Servers

### Public API: dev AppEngine appserver

From the `public-api/` directory:
```Shell
./project.rb dev-up
```

When the console displays "Dev App Server is now running", you can hit your
local API server under http://localhost:8083/.

**Note:** If you haven't loaded any data locally for the app, please run the goal below. Also, this will not run while dev-up is running, so please kill dev-up first.
```Shell
./project.rb run-local-data-migrations
```

If you have skipped running dev-up, after running run-local-data-migrations run:

```Shell
./project.rb run-public-api
```

This will start up the public API on http://localhost:8083/.

Other available operations may be discovered by running:
```Shell
./project.rb
```

### UI

From the `public-ui/` directory:
```Shell
./project.rb dev-up
```

After webpack finishes the build, you can view your local UI server at
http://localhost:4201/. You can view the tests at http://localhost:9877/debug.html.

By default, this connects to our test API server. Use `--environment=$ENV` to
use an alternate `src/environments/environment.$ENV.ts` file and connect to a
different API server. To connect to your own API server running at
`localhost:8083`, pass `--environment=local`.

Other available operations may be discovered by running:
```Shell
./project.rb
```

#### You can regenerate classes from swagger with

```Shell
./project.rb swagger-regen
```

## git-secrets

### Setup

Download the git-secrets tool.
If you are on a mac, run:
```Shell
  brew install git-secrets
```
If you are on Linux, run:
```Shell
rm -rf git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install && sudo chmod o+rx /usr/local/bin/git-secrets
cd ..
rm -rf git-secrets
```
### Running

git-secrets by default runs every time you make a commit. But if you
want to manually scan:
#### The Repository
```Shell
git secrets --scan
```
#### A File(s)
```Shell
git secrets --scan /path/to/file (/other/path/to/file *)
```
#### A Directory (recursively)
```Shell
git secrets --scan -r /path/to/directory
```

## API Server Configuration

Spring application configs, in `application.properties` files, specify behavior
like logging. They are static files bundled with the built Java binary.

Database connection information is read from `application-web.xml`. These
secrets vary per-environment; Ruby setup scripts pull the values from Google
Cloud Storage and generate the XML, which is then deployed with the Java binary.

Server behavior configuration is stored in the database. It may be changed
without restarting the server, but is usually set only at deployment time. It's
based on config\_$ENV.json files (which are converted into `WorkbenchConfig`
objects) and loaded into the database by `workbench.tools.ConfigLoader`.

`CacheSpringConfiguration`, a Spring `@Configuration`, provides
the `@RequestScoped` `WorkbenchConfig`. It caches the values fetched from the
database with a 10 minute expiration.

## Generate public count databases for a CDR version

This happens anytime a new cdr is released or if you want all the count data for databrowser generated locally.

Description of arguments these scripts take are as follows.
* bq-project : Project where BigQuery cdr lives that you want to generate data from. This must exist
* bq-dataset : BigQuery Dataset for the cdr release that you want to generate data from. This must exist
* workbench-project:  Project where private count dataset (cdr) is generated. This must exist.
* public-project: Project where public count dataset (public) is generated. This must exist.
* cdr-version: Version of form YYYYMMDD or empty string '' . It is used to name resulting datasets, csv folders, and databases.
* bucket: A GCS Bucket where csv data dumps are of the generated data. This must exist.
* db-name: Name of database
* database: Name of database
* instance: Cloud Sql Instance

#### Generate public count data for use by databrowser in BigQuery from a non de-identified cdr release
`./project.rb generate-public-cdr-counts --bq-project all-of-us-ehr-dev --bq-dataset synthetic_cdr20180606 --public-project all-of-us-workbench-test --cdr-version 20181107 --bin-size 20 --bucket all-of-us-workbench-public-cloudsql`
##### Result is
1. Public BigQuery dataset:  all-of-us-workbench-test:public20181107
2. CSV dumps of tables in bucket all-of-us-workbench-public-cloudsql: public20181107/*.csv.gz 
3. Browse csvs in browser like here :https://console.cloud.google.com/storage/browser?project=all-of-us-workbench-test&organizationId=394551486437
3. Note cdr-version can be '' to make dataset named public
#### Generate cloudsql databases from a bucket without downloading the data
##### * NOTE The cloudsql instance is set in code for each environment in /public-api/libproject/devstart.rb. Thus each cdr release will be on the same cloudsql instance for an environment.  
`# Once for public cdr.`

`./project.rb generate-cloudsql-db --project all-of-us-workbench-test --instance workbenchmaindb --database public20180913 --bucket all-of-us-workbench-public-cloudsql/public20180913`
##### Result is
1. Database is live on cloudsql.

#### Tell databrowser about your new cdr release so they can use it
1. For the environment you want, in the data-browser/public-api/config/cdr_versions_ENV.json , add a new object to the array for your cdr. Properties are:
   * name: unique name
   * dataAccessLevel: 1 = registered, 2 = controlled
   * bigqueryProject: project the BigQuery cdr is
   * bigqueryDataset: dataset of cdr,
   * creationTime: date string in this format "2018-09-20 00:00:00Z",
   * releaseNumber: gets incremented by 1 each time an official release is made. It has the same value for a registered and controlled cdr release. 
   * numParticipants: To get the number of participants look in your new cdrXXXXXXX cloudsql database at the achilles_results table where analysis_id = 1. `select count_value from achilles_results where analysis_id = 1` 
   * cdrDbName: name of the the cloudsql count database used by workbench "cdr20180920",
   * publicDbName: name of the public cloudsql database use by data browser and public api
2. Set the default cdr version for the environment in config_ENV.json. 
   * You probably don’t want to set your new cdr to the default before testing it.
   * NOTE The cloudsql instance is set in code for each environment in /public-api/libproject/devstart.rb  
3. Make your config changes take effect:
   * For non local environments: 
     * commit and merge your config files with master and the changes will take effect on the next build.
     * OR run `./project.rb update-cloud-config --project <project>` where project is the project for your environment. You can find this project in config_<ENV>.json server.projectId
   * For local , run dev-up to build your api

#### Generate full local mysql test databases -- public for data generated above if you need to develop with a full test database
1. DO NOT do this with production data. It is not allowed.
2. Make a sql dump from cloud console of the database you want.
2. Run `./project.rb local-mysql-import --sql-dump-file <FILE.sql> --bucket <BUCKET>`
3. Update your local environment per above.

Alternatively if you want to make a local database from csvs in gcs  
 * Run `./project.rb generate-local-count-dbs --cdr-version 20180206 --bucket all-of-us-workbench-public-cloudsql`
 * You may want to do this if generate-cloudsql-db fails because of limited gcloud sql import csv functionality
 * Or you have some local schema changes you need and just need csv data 
##### Result is
1. Local mysql database or databases.
2. cdr-version in the alternative method can be an empty string, '',  to make database named 'public'

#### Put mysqldump of local mysql database in bucket for importing into cloudsql. Call once for db you want to dump
`./project.rb mysqldump-local-db --db-name public20180206 --bucket all-of-us-workbench-public-cloudsql`
##### Result is
1. public20180206.sql uploaded to all-of-us-workbench-public-cloudsql

#### Import a dump to cloudsql instance by specifying dump file in the --file option.
`./project.rb cloudsql-import --project all-of-us-workbench-test --instance workbenchmaindb --bucket all-of-us-workbench-public-cloudsql --database public20180206 --file public20180206.sql`
##### Note a 3GB dump can take an hour or so to finish. You must wait before running another import on same instance (Cloudsql limitation) You can check status of import at the website: https://console.cloud.google.com/sql/instances/workbenchmaindb/operations?project=all-of-us-workbench-test
##### Or with this command:
`gcloud sql operations list --instance [INSTANCE_NAME] --limit 10`

##### Result
1) database is in cloudsql

#### Import a dump to local mysql db.
`./project.rb local-mysql-import --sql-dump-file cdr20180206.sql --bucket all-of-us-workbench-public-cloudsql`

##### Result
1) mysql db is in your local mysql for development. You need to alter your env per above to use it.

## Running test cases

To run both common api and public api unit tests, in the api dir run:

```
./project.rb test
```

To run just public api unit tests run:
```
./project.rb test-public-api
```

To run bigquery tests (which run slowly and actually
create and delete BigQuery datasets), run:

```
./project.rb bigquerytest
```

By default, all tests will return just test pass / fail output and stack traces for exceptions. To get full logging, pass on the command line --project-prop verboseTestLogging=yes when running tests.

### Authenticated Backend Requests (CLI)

This approach is required if you want to issue a request to a backend as a service account. 
This approach requires [oauth2l](https://github.com/google/oauth2l) to be installed:
```
go get github.com/google/oauth2l
go install github.com/google/oauth2l
```

The following shows how to make an authenticated backend request as the shared workbench test service account against databrowser dev (assumes you have run dev-up at least once):

```
# From the "public-api" directory.
curl -X GET -H "$(~/go/bin/oauth2l header --json sa-key.json userinfo.email userinfo.profile)" -H "Content-Type: application/json" https://public-api-dot-all-of-us-workbench-test.appspot.com/v1/databrowser/domain-totals
# If you get 401 errors, you may need to clear your token cache.
oauth2l reset
```

**Note:** If you do not have sa-key.json in public-api, you cannot make this request. Run:
```
./project.rb get-test-service-creds 
```
to fetch the credentials.
