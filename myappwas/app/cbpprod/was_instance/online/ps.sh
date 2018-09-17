CONTAINER_NAME=cbb_container1
ps -ef | grep $CONTAINER_NAME | grep -Ev grep | awk '{print $2}'
