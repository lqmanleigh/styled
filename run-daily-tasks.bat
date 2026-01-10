@echo off
setlocal
chcp 65001 >nul

REM Paths
set ROOT=C:\Users\User\Documents\Projects\styled
set SCRAPER_DIR=%ROOT%\my_scraper
set VENV_ACTIVATE=%SCRAPER_DIR%\venv\Scripts\activate.bat

REM Activate Python venv for Scrapy
call "%VENV_ACTIVATE%"
set PYTHONIOENCODING=utf-8

REM Run spiders inside the Scrapy project directory
pushd "%SCRAPER_DIR%"
python -m my_scraper.spiders.run_all_spiders
popd

REM Deactivate venv
call deactivate

endlocal
