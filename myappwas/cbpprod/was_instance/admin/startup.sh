#!/usr/bin/env bash

. ${WAS_HOME}/admin/name.prop

TAPP_LOG_HOME=${APP_LOG_HOME}

export CATALINA_BASE=${WAS_HOME}/${INSTANCE_NAME}
export CATALINA_LOG_HOME=${WAS_LOG_HOME}/${INSTANCE_NAME}
export CATALINA_OUT=${CATALINA_LOG_HOME}/catalina.out

if [ ! -d $CATALINA_LOG_HOME ]; then
	mkdir -p $CATALINA_LOG_HOME
fi

export CATALINA_OPTS="-Denv=product -Denv.servername=$SERVER_NAME -Dcatalina.log=$CATALINA_LOG_HOME -DlogHome=$TAPP_LOG_HOME -Dlib.bxm.home=$BXM_HOME -Dgepw.ds=${DB_PASSWD} -Dport.ds=${DB_PORT} -Dhost.ds=${DB_HOST}"

JAVA_OPTS="$JAVA_OPTS -Dbxm.node.name=DFT1 -Dbxm.instance.name=${CONTAINER_NAME}"
#Tomcat사용시에만 추가.
JAVA_OPTS="$JAVA_OPTS -Dcom.atomikos.icatch.file=${BXM_HOME}/jta/jta.properties -Doracle.jdbc.autoCommitSpecCompliant=false"
JAVA_OPTS="$JAVA_OPTS -Xms1024m -Xmx2048m -XX:NewSize=256m -XX:MaxNewSize=256m -XX:PermSize=512m -XX:MaxPermSize=2048m -Xss16m "
JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=$HOME/dump/ -XX:+UnlockDiagnosticVMOptions -XX:+UnsyncloadClass"
export JAVA_OPTS

cd $CATALINA_HOME/bin
./startup.sh

