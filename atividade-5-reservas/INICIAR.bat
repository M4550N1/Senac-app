@echo off
setlocal
cd /d "%~dp0"
title Hotel Brisa do Mar - JSON Server
where node >nul 2>nul
if errorlevel 1 goto missingnode
where npm >nul 2>nul
if errorlevel 1 goto missingnode
if not exist "node_modules\.bin\json-server.cmd" (
    echo Instalando dependencias. Aguarde...
    call npm ci --no-fund
    if errorlevel 1 goto installerror
)
echo.
echo Abra no navegador: http://localhost:3000
echo Tabela de reservas: http://localhost:3000/reservas.html
echo Mantenha esta janela aberta. Para parar, pressione Ctrl+C.
echo.
call npm start
if errorlevel 1 goto servererror
exit /b 0
:missingnode
echo Instale o Node.js LTS em https://nodejs.org/ e tente novamente.
pause
exit /b 1
:installerror
echo Nao foi possivel instalar. Verifique a conexao e o erro acima.
pause
exit /b 1
:servererror
echo O servico parou. Verifique o erro acima e se a porta 3000 esta livre.
pause
exit /b 1
