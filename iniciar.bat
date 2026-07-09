@echo off
cd /d "%~dp0backend"
start "BI Vendas - Auth API" cmd /k npm start
cd /d "%~dp0frontend"
start "BI Vendas - Frontend" cmd /k npm start
