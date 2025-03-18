$ErrorActionPreference = "Stop"

$APP_VERSION = node -p "require('./package.json').version"

Write-Host "Building MystBrowser version $APP_VERSION"

$distFolder = Join-Path $PSScriptRoot "dist"

if (Test-Path $distFolder) {
    Write-Host "Cleaning up old build..."
    Remove-Item -Recurse -Force $distFolder
}

New-Item -ItemType Directory -Path $distFolder | Out-Null

Write-Host "Running Electron Packager..."
Start-Process -NoNewWindow -Wait -FilePath "cmd.exe" -ArgumentList @(
    "/c", "npm", "exec", "electron-packager", "--", ".", "MystBrowser",
    "--app-bundle-id=dev.meowisworking.mystbrowser",
    "--app-copyright=""MystBrowser © 2025 by MeowSkyKung is licensed under CC BY-SA 4.0""",
    "--platform=win32",
    "--arch=x64",
    "--out=$distFolder",
    "--overwrite",
    "--executable-name=MystBrowser",
    "--icon=MystBrowser.ico"
) -PassThru

$oldPath = "$distFolder/MystBrowser-win32-x64"
$newPath = "$distFolder/MystBrowser-$APP_VERSION-win32-x64"

if (Test-Path $newPath) {
    Remove-Item -Recurse -Force $newPath
}

Move-Item -Path $oldPath -Destination $newPath

$zipPath = "$distFolder/MystBrowser-$APP_VERSION-win32-x64.zip"
Compress-Archive -Path "$newPath/*" -DestinationPath "$zipPath" -Force

Write-Host "Build complete: $zipPath"
