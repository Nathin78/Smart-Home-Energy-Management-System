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
$logFile = "C:\nathin\infosys\task\backend\backend.log"
if (-not $env:SHEMS_PORT) { $env:SHEMS_PORT = "8080" }

Write-Host "Starting SHEMS Backend Server..." -ForegroundColor Green
Write-Host "Java Path: $env:JAVA_HOME\bin\java.exe" -ForegroundColor Yellow
Write-Host "Log File: $logFile" -ForegroundColor Yellow

java -version 2>&1
Write-Host "---" -ForegroundColor Cyan

cd C:\nathin\infosys\task\backend

java -Xmx512m -jar target/shems-backend-1.0.0.jar --server.port=$env:SHEMS_PORT *> $logFile

Write-Host "Backend stopped!"
