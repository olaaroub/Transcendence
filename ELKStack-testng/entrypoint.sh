#!/bin/sh

echo "--- Log Generator Script Starting (Alpine) ---"

echo "Installing netcat..."
apk add --no-cache netcat-openbsd
echo "Installation complete."

echo "Waiting for logstash at logstash:5000..."
until nc -z logstash 5000; do
  echo "Waiting..."
  sleep 1
done
echo "Logstash is ready."

echo "Starting log stream..."
while true; do
  echo "{\"message\": \"This is a log message at $(date)\", \"service\": \"log-generator\"}"
  sleep 5
done | nc logstash 5000