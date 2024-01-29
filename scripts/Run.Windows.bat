title MLC Web Server Runner

set "site_dir=%~dp0"

cd /D C:\php
php -S 0.0.0.0:8888 -t %site_dir%..\site