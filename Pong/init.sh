#!/bin/sh

mkdir -p /pong-dist/offline
mkdir -p /pong-dist/online

rm -rf /pong-dist/offline/*
cp -r /app/Offline/dist/* /pong-dist/offline/

# rm -rf /pong-dist/online/*
# cp -r /app/Online/client/dist/* /pong-dist/online/

rm -rf /pong-dist/Assets/*
cp -r /app/Assets/* /pong-dist/Assets/


echo "Starting inline game..."

# exec node /app/Online/server/dist/server.js
 exec tail -f /dev/null