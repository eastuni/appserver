#!/bin/bash

if [ -f /initfile ];then
  echo "already initapp"
else
	echo "exec /initapp.sh"
	bash /initapp.sh
	echo "init app" > /initfile
fi

echo "clean applogs"
rm -rf /applogs/*

su - apprun -c "bash /startwas.sh"
service apache2 start
#service apache2 stop

#/usr/sbin/apache2ctl restart -D FOREGROUND

tail -f /var/log/apache2/*log
