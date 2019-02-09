#!/usr/bin/env bash
ping -n %2 127.0.0.1
taskkill /PID %1 /F
