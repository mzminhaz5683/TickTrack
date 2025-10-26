@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

set "initHtml=index.html"
set "localHostIp=127.0.0.1"
set "PORT=8080"

:: =============================================================================
for /f "tokens=5" %%a in ('netstat -a -n -o ^| find ":!PORT! " ^| find "LISTENING"') do set PID=%%a

if defined PID (
    echo Port !PORT! is already in use by process ID: !PID!
    set /p answer=Do you want to kill this process and continue? [Y/N > Y] :
    if /i "!answer!"=="N" (
        echo Aborting.
        exit /b 1
    )
    echo Killing process ID !PID!...
    taskkill /PID !PID! /F >nul 2>&1
    timeout /t 1 >nul
)

echo Starting server at http://%localHostIp%:%PORT%/%initHtml%
powershell -NoExit -Command "cd '%CD%'; $Listener = [System.Net.HttpListener]::new(); $Listener.Prefixes.Add('http://%localHostIp%:%PORT%/'); $Listener.Start(); Write-Host 'Serving files from %CD% on port %PORT%'; while ($true) { $Context = $Listener.GetContext(); $Request = $Context.Request; $Response = $Context.Response; $Path = Join-Path '%CD%' ($Request.Url.LocalPath.TrimStart('/')); if (-not (Test-Path $Path)) { $Path = Join-Path '%CD%' '%initHtml%' }; $Bytes = [System.IO.File]::ReadAllBytes($Path); $Response.ContentLength64 = $Bytes.Length; $Response.OutputStream.Write($Bytes,0,$Bytes.Length); $Response.OutputStream.Close() }"
