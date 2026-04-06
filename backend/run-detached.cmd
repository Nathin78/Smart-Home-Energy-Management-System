@echo off
setlocal

cd /d "%~dp0"

set "JAVA_EXE=C:\Program Files\Java\jdk-17\bin\java.exe"
if not exist "%JAVA_EXE%" set "JAVA_EXE=C:\Program Files\Java\jdk-21\bin\java.exe"

if not exist "%JAVA_EXE%" (
  echo ERROR: Java not found.
  exit /b 1
)

set "LOG_OUT=%~dp0backend-task.log"
set "LOG_ERR=%~dp0backend-task.err"

"%JAVA_EXE%" -jar "%~dp0target\shems-backend-1.0.0.jar" > "%LOG_OUT%" 2> "%LOG_ERR%"
