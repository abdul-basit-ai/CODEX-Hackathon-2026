param([int]$Port = 3021)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$voiceEnvPath = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path -LiteralPath $voiceEnvPath)) {
    $voiceEnvPath = Join-Path $PSScriptRoot '..\chess-companion\.env'
}
if (-not (Test-Path -LiteralPath '.output\server\index.mjs')) {
    throw 'The verified production build was not found.'
}
$env:PORT = [string]$Port
Write-Host "Open http://127.0.0.1:$Port/dashboard/ in your browser."
if (Test-Path -LiteralPath $voiceEnvPath) {
    & node "--env-file=$voiceEnvPath" '.output/server/index.mjs'
} else {
    & node '.output/server/index.mjs'
}
