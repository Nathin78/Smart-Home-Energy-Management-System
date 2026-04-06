$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot 'dist'
$indexFile = Join-Path $root 'index.html'
$port = 5173

$mimeTypes = @{
  '.css' = 'text/css; charset=utf-8'
  '.html' = 'text/html; charset=utf-8'
  '.ico' = 'image/x-icon'
  '.js' = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.map' = 'application/json; charset=utf-8'
  '.png' = 'image/png'
  '.svg' = 'image/svg+xml'
  '.ttf' = 'font/ttf'
  '.woff' = 'font/woff'
  '.woff2' = 'font/woff2'
}

function Get-ContentType([string]$filePath) {
  $ext = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
  if ($mimeTypes.ContainsKey($ext)) {
    return $mimeTypes[$ext]
  }
  return 'application/octet-stream'
}

function Send-Bytes([System.Net.HttpListenerResponse]$response, [byte[]]$bytes, [string]$contentType) {
  $response.StatusCode = 200
  $response.ContentType = $contentType
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
  $response.OutputStream.Close()
}

function Send-File([System.Net.HttpListenerResponse]$response, [string]$filePath) {
  $bytes = [IO.File]::ReadAllBytes($filePath)
  Send-Bytes $response $bytes (Get-ContentType $filePath)
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "Static frontend server running at http://localhost:$port"
Write-Host "Serving dist from $root"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $path = [Uri]::UnescapeDataString($request.Url.AbsolutePath)

    if ($request.HttpMethod -notin @('GET', 'HEAD')) {
      $response.StatusCode = 405
      $response.OutputStream.Close()
      continue
    }

    $relativePath = $path.TrimStart('/')
    $candidate = if ([string]::IsNullOrWhiteSpace($relativePath)) { $indexFile } else { Join-Path $root $relativePath }
    $candidate = [IO.Path]::GetFullPath($candidate)

    if ($candidate.StartsWith([IO.Path]::GetFullPath($root)) -and (Test-Path $candidate -PathType Leaf)) {
      Send-File $response $candidate
      continue
    }

    Send-File $response $indexFile
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
