#!/usr/bin/env ruby
# Ruby goals used by our build (not intended to be invoked directly by developers)

require_relative "../aou-utils/workbench"
require_relative "../aou-utils/swagger"

Workbench.handle_argv_or_die(__FILE__)
