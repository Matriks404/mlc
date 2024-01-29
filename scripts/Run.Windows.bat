title MLC Web Server Runner

set "site_dir=%~dp0"
php -S 0.0.0.0:8888 -t %site_dir%..\site