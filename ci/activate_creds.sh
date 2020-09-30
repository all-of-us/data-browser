#!/bin/bash -e

# Creates credentials file $1 from two environment variables (see
# below) which combine to decrypt the keys for a service account.
# Does gcloud auth using the result.
PROJECT="aou-db-test"
KEY_FILE="public-api/circle-sa-key.json"
while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT=$2; shift 2;;
    --key-file) KEY_FILE=$2; shift 2;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

CRED_VAR=""
CRED_KEY_VAR=""

if [ "$PROJECT" == "aou-db-test" ]; then
  CRED_VAR="GCLOUD_CREDENTIALS"
  CRED_KEY_VAR="GCLOUD_CREDENTIALS_KEY"
else
  CRED_VAR="GCLOUD_PROD_CREDENTIALS"
  CRED_KEY_VAR="GCLOUD_CREDENTIALS_KEY_PROD"
fi

deref() { echo "${!1}"; }

if [ ! "\$$CRED_VAR" ]
then
  echo "No GCLOUD_CREDENTIALS env var defined, aborting creds activation."
  exit 1
fi

eval echo \$$CRED_VAR | \
     openssl enc -d -md sha256 -aes-256-cbc -base64 -A -k "$(deref "$(deref CRED_KEY_VAR)")" \
     > $KEY_FILE

gcloud auth activate-service-account --key-file $KEY_FILE
