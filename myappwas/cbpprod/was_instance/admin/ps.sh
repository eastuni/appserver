. ${WAS_HOME}/admin/name.prop
ps -ef | grep $CONTAINER_NAME | grep -Ev grep | awk '{print $2}'
