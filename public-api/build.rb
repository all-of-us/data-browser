#!/usr/bin/env ruby
# Ruby goals used by our build (not intended to be invoked directly by developers)

require_relative "../aou-utils/workbench"
require_relative "../aou-utils/swagger"

def merge_yaml()
  Workbench::Swagger.merge_yaml('src/main/resources/public-api.yaml',
    ['../common-api/src/main/resources/common_api.yaml'],
     'src/main/resources/merged.yaml')
end

Common.register_command({
  :invocation => "merge-yaml",
  :description => "Merges API YAML files together to produce a single YAML spec.",
  :fn => ->() { merge_yaml() }
})

Workbench.handle_argv_or_die(__FILE__)
