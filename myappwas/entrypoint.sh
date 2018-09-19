#!/bin/bash

echo "export DB_PORT=${DB_PORT}" >> /home/apprun/.bash_aliases 
echo "export DB_HOST=${DB_HOST}" >> /home/apprun/.bash_aliases

echo "clean applogs"
rm -rf /applogs/*

su - apprun -c "bash /startwas.sh"
service apache2 start
#service apache2 stop

#/usr/sbin/apache2ctl restart -D FOREGROUND

tail -f /var/log/apache2/*log
