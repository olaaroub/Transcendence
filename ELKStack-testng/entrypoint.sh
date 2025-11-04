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