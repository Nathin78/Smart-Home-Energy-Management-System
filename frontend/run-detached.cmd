@echo off
setlocal

cd /d "%~dp0"

set "LOG_OUT=%~dp0frontend-task.log"
set "LOG_ERR=%~dp0frontend-task.err"

call "C:\Program Files\nodejs\npm.cmd" run dev > "%LOG_OUT%" 2> "%LOG_ERR%"
