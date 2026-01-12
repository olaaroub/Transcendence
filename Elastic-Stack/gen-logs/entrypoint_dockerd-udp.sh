#!/bin/sh

#here i will use tcp and docker deamon to ship logs to logstash

echo "--- Log generator script starting ---"
count=0
while true; do

  if [ $(($count % 4)) -eq 0 ]; then
    echo "ERROR: This is an Error log!!"
  elif [ $(($count % 3)) -eq 0 ]; then
	  echo "DEBUG: This is a Debug log!!"
  else
	  echo "INFO: This is an Info log!!"
  fi
  count=$(($count + 1))
  sleep 5
done