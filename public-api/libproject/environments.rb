TEST_PROJECT = "aou-db-test"

def make_gae_vars(min_idle_instances = 1, max_instances = 10)
  {
    "GAE_MIN_IDLE_INSTANCES" => min_idle_instances.to_s,
    "GAE_MAX_INSTANCES" => max_instances.to_s,
  }
end

def env_with_defaults(env, config)
  {
    :env_name => env,
    :config_json => "config_#{env}.json",
    :cdr_config_json => "cdr_config_#{env}.json",
    :gae_vars => make_gae_vars,
  }.merge(config)
end

# TODO: Make environment/project flags consistent across commands, consider
# using environment keywords as dict keys here, e.g. :test, :staging, etc.
ENVIRONMENTS = {
  "local" => env_with_defaults("local", {
    :api_endpoint_host => "localhost:8083",
    :cdr_sql_instance => "databrowser",
    :source_cdr_project => "aou-db-test"
  }),
  "aou-db-test" => env_with_defaults("test", {
     :cdr_sql_instance => "#{TEST_PROJECT}:us-central1:databrowsermaindb",
     :config_json => "config_test.json",
     :cdr_config_json => "cdr_config_test.json",
     :api_base_path => "https://api-dot-#{TEST_PROJECT}.appspot.com",
     :source_cdr_project => "aou-res-curation-prod",
     :cdr_sql_bucket => "aou-db-public-cloudsql",
     :instance => "databrowsermaindb",
     :gae_vars => make_gae_vars(1, 10),
  }),
  "aou-db-staging" => env_with_defaults("staging", {
    :cdr_sql_instance => "#{TEST_PROJECT}:us-central1:databrowsermaindb",
    :config_json => "config_staging.json",
    :cdr_config_json => "cdr_config_staging.json",
    :api_base_path => "https://public.api.staging.fake-research-aou.org",
    :source_cdr_project => "aou-res-curation-prod",
    :cdr_sql_bucket => "aou-db-public-cloudsql",
    :instance => "databrowsermaindb",
    :gae_vars => make_gae_vars(1, 10),
  }),
  "aou-db-stable" => env_with_defaults("stable", {
    :cdr_sql_instance => "#{TEST_PROJECT}:us-central1:databrowsermaindb",
    :config_json => "config_stable.json",
    :cdr_config_json => "cdr_config_stable.json",
    :api_base_path => "https://public.api.stable.fake-research-aou.org",
    :source_cdr_project => "aou-res-curation-prod",
    :cdr_sql_bucket => "aou-db-public-cloudsql",
    :instance => "databrowsermaindb",
    :gae_vars => make_gae_vars(1, 10),
  }),
  "aou-db-prod" => env_with_defaults("prod", {
    :cdr_sql_instance => "aou-db-prod:us-central1:databrowsermaindb",
    :config_json => "config_prod.json",
    :cdr_config_json => "cdr_config_prod.json",
    :api_base_path => "https://public.api.researchallofus.org",
    :source_cdr_project => "aou-res-curation-prod",
    :cdr_sql_bucket => "aou-db-prod-public-cloudsql",
    :instance => "databrowsermaindb",
    :gae_vars => make_gae_vars(1, 64),
  })
}

def must_get_env_value(env, key)
  unless ENVIRONMENTS.fetch(env, {}).has_key?(key)
    raise ArgumentError.new("env '#{env}' lacks key #{key}")
  end
  return ENVIRONMENTS[env][key]
end

def get_config(project)
  config_json = must_get_env_value(project, :config_json)
  path = File.join(File.dirname(__FILE__), "../config/#{config_json}")
  return JSON.parse(File.read(path))
end

def get_cdr_config(project)
  cdr_config_json = must_get_env_value(project, :cdr_config_json)
  path = File.join(File.dirname(__FILE__), "../config/#{cdr_config_json}")
  return JSON.parse(File.read(path))
end