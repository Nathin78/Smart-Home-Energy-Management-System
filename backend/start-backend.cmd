@echo off
setlocal

REM Starts the backend on http://localhost:%SHEMS_PORT%/api (default 8080)

if "%SHEMS_PORT%"=="" set "SHEMS_PORT=8080"

cd /d "%~dp0"

set "JAVA_EXE=C:\Program Files\Java\jdk-17\bin\java.exe"
if exist "%JAVA_EXE%" goto :have_java
set "JAVA_EXE=C:\Program Files\Java\jdk-21\bin\java.exe"
if exist "%JAVA_EXE%" goto :have_java

:have_java
if not exist "%JAVA_EXE%" (
  echo ERROR: Java not found. Install JDK 17+ and/or set JAVA_HOME.
  exit /b 1
)

echo Building backend...
call mvn -Dmaven.repo.local=.m2\repository -DskipTests package
if errorlevel 1 (
  if not exist "target\shems-backend-1.0.0.jar" (
    echo ERROR: Build failed and no jar found in target\.
    exit /b 1
  )
  echo WARNING: Build failed; running existing jar anyway.
)

echo.
echo Starting backend...
echo URL: http://localhost:%SHEMS_PORT%/api
echo.
"%JAVA_EXE%" -jar "target\shems-backend-1.0.0.jar" --server.port=%SHEMS_PORT%
