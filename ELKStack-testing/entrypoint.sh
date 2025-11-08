#!/bin/sh

echo "--- Log generator script starting ---"
count=0
while true; do

  if [ $(($count % 4)) -eq 0 ]; then
    echo "{\"level\": \"error\", \"service\": \"log-generator\", \"message\": \"This is an Error log!!\"}"

  elif [ $(($count % 3)) -eq 0 ]; then
    echo "{\"level\": \"debug\", \"service\": \"log-generator\", \"message\": \"This is a Debug log!!\"}"

  else
    echo "{\"level\": \"info\", \"service\": \"log-generator\", \"message\": \"This is an Info log!!\"}"
  fi

  count=$(($count + 1))
  sleep 5
done