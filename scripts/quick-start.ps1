# Quick start script for my-drawing-tool (Windows PowerShell)
# - Installs dependencies if missing
# - Starts the dev server
# Usage: Right-click -> Run with PowerShell, or:
#   powershell -ExecutionPolicy Bypass -File .\scripts\quick-start.ps1

$ErrorActionPreference = 'Stop'

# Move to repo root (script directory/parent)
Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location (Split-Path -Parent $PWD)

Write-Host '==> Checking Node.js and npm...' -ForegroundColor Cyan
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
  Write-Error 'Node.js/npm not found. Please install Node.js from https://nodejs.org/'
}

Write-Host '==> Ensuring dependencies are installed...' -ForegroundColor Cyan
if (-not (Test-Path "$PWD\node_modules")) {
  Write-Host 'Installing dependencies (npm install)...' -ForegroundColor Yellow
  npm install
} else {
  Write-Host 'Dependencies already installed. Skipping npm install.' -ForegroundColor Green
}

Write-Host '==> Starting dev server (npm start)...' -ForegroundColor Cyan
npm start

# Return to previous location when done
Pop-Location
Pop-Location
