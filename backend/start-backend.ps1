#!/usr/bin/env powershell

# Set JAVA_HOME
$jdk17 = "C:\Program Files\Java\jdk-17"
$jdk21 = "C:\Program Files\Java\jdk-21"
if (Test-Path $jdk17) {
  $env:JAVA_HOME = $jdk17
} elseif (Test-Path $jdk21) {
  $env:JAVA_HOME = $jdk21
}
if ($env:JAVA_HOME) {
  $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SHEMS BACKEND - Startup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Java
Write-Host "Checking Java installation..." -ForegroundColor Yellow
java -version

Write-Host ""
Write-Host "Rebuilding application..." -ForegroundColor Yellow
cd "C:\nathin\infosys\task\backend"
mvn clean package -DskipTests -q

Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""

if (-not $env:SHEMS_PORT) { $env:SHEMS_PORT = "8080" }
Write-Host "Starting SHEMS Backend Server..." -ForegroundColor Green
Write-Host "Port: $env:SHEMS_PORT" -ForegroundColor Cyan
Write-Host "Database: shems_db (MySQL)" -ForegroundColor Cyan
Write-Host "URL: http://localhost:$env:SHEMS_PORT/api" -ForegroundColor Cyan
Write-Host ""

java -Xmx512m -Xms256m -jar "target/shems-backend-1.0.0.jar" --server.port=$env:SHEMS_PORT

Write-Host ""
Write-Host "Backend stopped!" -ForegroundColor Yellow
