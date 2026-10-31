@echo off
chcp 65001 >nul
title Frontend - Mini Ecommerce

REM Backend tu dong chay khi dang nhap Windows - coi backend-startup.vbs
REM File nay chi can bat frontend. Neu backend chua chay: chay start-backend.bat

echo Dang khoi dong frontend (Next.js - port 3000)...
cd /d "%~dp0frontend"
npm run dev
