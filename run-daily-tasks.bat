@echo off
setlocal
chcp 65001 >nul

REM ============================
REM Paths
REM ============================
set ROOT=C:\Users\User\Documents\Projects\styled
set SCRAPER_DIR=%ROOT%\my_scraper
set VENV_ACTIVATE=%SCRAPER_DIR%\venv\Scripts\activate.bat

REM ============================
REM Run Scrapy (Python)
REM ============================
echo [INFO] Activating Python virtual environment...
call "%VENV_ACTIVATE%"
set PYTHONIOENCODING=utf-8

echo [INFO] Running Scrapy spiders...
pushd "%SCRAPER_DIR%"
python -m my_scraper.spiders.run_all_spiders
popd

echo [INFO] Deactivating Python venv...
call deactivate

REM ============================
REM Import into Prisma DB (Node.js)
REM ============================
echo [INFO] Importing products into database...
pushd "%ROOT%"
node scripts/import-products.js
popd

echo [SUCCESS] Daily tasks completed successfully.
endlocal
