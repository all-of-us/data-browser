#!/bin/bash

set -e

# Commands to load data and configs in a local databrowser environment.
#
# This script is meant to be run within the api-scripts Docker service in order to update
# a developer's local databrowser environment. This runs as a part of the main dev-env setup script,
# and should be re-run whenever a developer updates one of the relevant config files.
#
# These commands should be kept in sync with the associated deployment commands, which can be
# found under the "deploy" command in public-api/libproject/devstart.rb .

DRY_RUN=false
./gradlew :tools:updateCdrVersions -PappArgs="['/w/public-api/config/cdr_versions_local.json',${DRY_RUN}]"
./gradlew :tools:loadConfig -Pconfig_key=main -Pconfig_file=../config/config_local.json
./gradlew :tools:loadConfig -Pconfig_key=cdrBigQuerySchema -Pconfig_file=../config/cdm/cdm_5_2.json