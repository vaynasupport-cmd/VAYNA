@echo off
title VAYNA SaaS Orchestrator
color 0B

cd /d "%~dp0"

echo ===================================================
echo   VAYNA SaaS Orchestrator - Lanceur Automatique
echo ===================================================
echo.
echo Ce script maintiendra le serveur Python en vie.
echo Si Python plante ou si l'ordinateur s'endort,
echo il redemarrera le script automatiquement.
echo.

:loop
echo [%date% %time%] Lancement de saas_sync.py...
python saas_sync.py

echo.
echo [%date% %time%] [ATTENTION] Le script Python s'est arrete (Crash ou arret volontaire).
echo Redemarrage automatique dans 5 secondes...
timeout /t 5 >nul
goto loop
