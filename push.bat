@echo off
echo ========================================================
echo   Subiendo cambios de Asesoria-II a GitHub (Vercel)
echo ========================================================
echo.
git push origin main
git push origin main:master
echo.
echo ========================================================
echo   Push completado. Vercel desplegará automáticamente.
echo ========================================================
pause
