#!/bin/bash

initHtml="index.html"
localHostIp="127.0.0.1"
PORT="8080"

# ==============================================================================
PID=$(lsof -ti :$PORT)
if [ -n "$PID" ]; then
    echo "Port $PORT is already in use by process(es): $PID"
    echo -n "Do you want to kill this process and continue? [Y/N > Y] :"
    read answer
    if [[ "$answer" =~ ^[Nn]$ ]]; then
        echo "Aborting."
        exit 1
    else
        echo "Killing process(es): $PID"
        kill -9 $PID
        sleep 1
    fi
    echo ""
    echo ""
fi

echo "Starting server at http://$localHostIp:$PORT/$initHtml"
busybox httpd -f -p $localHostIp:$PORT
