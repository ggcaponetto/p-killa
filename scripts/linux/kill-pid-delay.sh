#!/usr/bin/env sh
ping -c $2 127.0.0.1
kill -9 $1
