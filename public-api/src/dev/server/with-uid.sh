#!/bin/bash

USERNAME=$(whoami 2>/dev/null)
EXIT_CODE=$?

# Allow 'core' user for development
if [ $EXIT_CODE -eq 0 ] && [ "$USERNAME" != "core" ]; then
  >&2 echo 'This container has poor behavior if run as an existing user.' \
    'The given UID matches the user '"'$USERNAME'"'. Exiting.';
  exit 1;
fi

exec "$@"