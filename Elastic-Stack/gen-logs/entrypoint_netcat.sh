#!/bin/sh

echo "--- Log generator starting---"

echo "Installing netcat..."
apk add --no-cache netcat-openbsd

echo "Waiting for logstash ti be ready..."
until nc -z logstash 5000; do
  echo "Waiting..."
  sleep 1
done

echo "Starting log stream..."
count=0
while true; do

  if [ $(($count % 4)) -eq 0 ]; then
    echo "{\"level\": \"error\", \"service\": \"log-generator\", \"message\": \"Fuuck, something broke!\"}"
  else
    echo "{\"level\": \"info\", \"service\": \"log-generator\", \"message\": \"This is a log message at $(date)\"}"
  fi

  count=$(($count + 1))
  sleep 5
done | nc logstash 5000