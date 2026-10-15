#!/bin/sh
set -e

mkdir -p "$(dirname "${SQLITE_PATH:-/app/data/db.sqlite3}")"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
