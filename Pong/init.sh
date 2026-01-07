#!/bin/sh

mkdir -p /pong-dist/offline
mkdir -p /pong-dist/online
mkdir -p /pong-dist/Assets

echo "Copying Offline Version to Volume..."
rm -rf /pong-dist/offline/* || true
cp -r /app/Offline/dist/* /pong-dist/offline/

echo "Copying Online Version to Volume..."
rm -rf /pong-dist/online/* || true
cp -r /app/Online/dist/client/* /pong-dist/online/

echo "Copying Assets to Volume..."
rm -rf /pong-dist/Assets/* || true
cp -r /app/Assets/* /pong-dist/Assets/

echo "Copying DONE. Starting Pong Server..."

exec node /app/Online/dist/server/server.js