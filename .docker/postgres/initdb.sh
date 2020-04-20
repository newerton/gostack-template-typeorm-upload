#!/bin/bash

set -e
set -u

function create_databases() {
	local database=$1
  local user=$2
  local password=$3

	echo "CREATING USER AND DATABASE '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $user;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "MULTIPLE DATABASE CREATION REQUESTED: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_databases $db $POSTGRES_USER $POSTGRES_PASSWORD
	done
	echo "MULTIPLE DATABASE CREATED"
fi
