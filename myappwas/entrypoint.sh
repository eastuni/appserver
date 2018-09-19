#!/bin/bash

run_was(){
	APP_NAME=$1
	echo "start up ${APP_NAME}"
	fromsh=${WAS_HOME}/${APP_NAME}/startup.sh
	mysh=~/tomcatrun.sh
	cp $fromsh $mysh
	sed -i "s/startup.sh/catalina.sh run/g" $mysh
	$mysh
}

startup_was(){
	APP_NAME=$1
	echo "start up ${APP_NAME}"
	${WAS_HOME}/${APP_NAME}/startup.sh
}

service apache2 start

su - apprun
. /home/apprun/.bash_aliases
startup_was online
run_was admin

