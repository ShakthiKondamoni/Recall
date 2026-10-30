@echo off
cd /d "%~dp0"
where corepack >nul 2>&1 || (echo Corepack is required. & exit /b 1)
if not exist node_modules (echo Run corepack pnpm install first. & exit /b 1)
call corepack pnpm build
if errorlevel 1 (echo Recall build failed. & pause & exit /b 1)
