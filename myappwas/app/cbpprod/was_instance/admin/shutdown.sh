#!/usr/bin/env bash

. ${WAS_HOME}/admin/name.prop

APP_LOG_HOME=${LOG_HOME}/${INSTANCE_NAME}

export CATALINA_BASE=${WAS_HOME}/${INSTANCE_NAME}
export CATALINA_LOG_HOME=${WAS_LOG_HOME}/${INSTANCE_NAME}
export CATALINA_OUT=${CATALINA_LOG_HOME}/catalina.out

if [ ! -d $CATALINA_LOG_HOME ]; then
	mkdir -p $CATALINA_LOG_HOME
fi

export CATALINA_OPTS="-Denv=product -Denv.servername=$SERVER_NAME -Dserver.Name=$CONTAINER_NAME -Dcatalina.log=$CATALINA_LOG_HOME -DlogHome=$APP_LOG_HOME -Dbxm.home=$BXM_HOME"

export JAVA_OPTS="-Xms1024m -Xmx2048m -XX:NewSize=256m -XX:MaxNewSize=256m -XX:PermSize=512m -XX:MaxPermSize=512m -Xss16m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=$HOME/dump/ -XX:+UnlockDiagnosticVMOptions -XX:+UnsyncloadClass"

cd $CATALINA_HOME/bin
./shutdown.sh

