#!/usr/bin/env bash
# filepath: /home/gianni-fornasari/dev/challenge-backend/wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 5672; do
  echo "Waiting for RabbitMQ at $host:5672..."
  sleep 1
done

exec $cmd