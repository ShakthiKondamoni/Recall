@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo Node.js 24 LTS is required. & exit /b 1)
where corepack >nul 2>&1 || (echo Install Node.js 24+ with Corepack enabled, then retry. & exit /b 1)
if not exist .env (echo Missing .env. Copy .env.example to .env first. & exit /b 1)
if not exist node_modules (echo Dependencies missing. Run corepack pnpm install first. & exit /b 1)
call corepack pnpm dev:web
if errorlevel 1 (echo Recall web startup failed. Review the error above. & pause & exit /b 1)
