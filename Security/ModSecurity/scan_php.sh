#!/bin/sh

if grep -q "<?php" "$1"; then
    echo "0:PHP Source Code Detected"
    exit 0
fi


HEX_HEADER=$(od -A n -t x1 -N 4 "$1" | tr -d ' \n')

case "$HEX_HEADER" in
    ffd8ff*)
        echo "1:OK (JPEG)"
        ;;
    89504e47)
         echo "1:OK (PNG)"
        ;;
    47494638)
        echo "1:OK (GIF)"
        ;;
    *)
        echo "0:Invalid Magic Bytes: $HEX_HEADER"
        exit 0
        ;;
esac