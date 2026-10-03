@echo off
cd /d "%~dp0"
echo Blockout: http://127.0.0.1:5173
echo Bu pencere acikken editor calisir. Kapatmak icin Ctrl+C.
node server.cjs
pause
