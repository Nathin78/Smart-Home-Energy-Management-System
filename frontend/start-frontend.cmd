@echo off
setlocal

REM Starts the Vite dev server on http://localhost:5173
REM Optional: set SHEMS_PORT to match backend port for proxy (default 8080)

cd /d "%~dp0"
call npm run dev
