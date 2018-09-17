#!/bin/bash
. ~/.bash_aliases

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

startup_was online
run_was admin
