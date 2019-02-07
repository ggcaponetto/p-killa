@echo off
netstat -ano | findstr 0.0.0.0:%1
