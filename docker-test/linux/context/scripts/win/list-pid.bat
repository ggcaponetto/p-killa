@echo off
netstat -ano | findstr :%1
echo exited with status %ERRORLEVEL%

