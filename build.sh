#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Running migrations..."
python backend/manage.py migrate --noinput

echo "Collecting static files..."
python backend/manage.py collectstatic --noinput