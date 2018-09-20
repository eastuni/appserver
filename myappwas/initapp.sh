#!bin/bash

washome=/app/cbpprod/was_instance
appuser=apprun
ciuser=jenkins

echo "init app"
mkdir -p /app/apprun

echo "copy app"
cp -r /app_init/product /app
cp -r /app_init/cbpprod /app
cp -r /app_init/apps    /app/apprun
cp -r /app_init/ui      /app
cp -r /app_init/admin_conf/* ${washome}/admin/conf
cp -r /app_init/online_conf/* ${washome}/online/conf

echo "chown,chmod"
chown -R ${appuser}:${ciuser} /app 
chmod 755 ${washome}/admin/*.sh 
chmod 755 ${washome}/online/*.sh 

echo "www link"
cd /var/www/html 
ln -s /app/ui/ap && ln -s /app/ui/biz && ln -s /app/ui/cp

echo "webapps"
mkdir ${washome}/admin/webapps 
cd ${washome}/admin/webapps 
ln -s ../../../webapps/bxmAdmin && ln -s ../../../webapps/cpPfDist && ln -s ../../../webapps/cpServiceEndpoint \
&& ln -s ../../../webapps/pf 

cd ${washome}/admin/lib 
ln -s ../webapps/cpServiceEndpoint/WEB-INF/classes/log4j.xml 
      
mkdir ${washome}/online/webapps 
cd ${washome}/online/webapps 
      
ln -s ../../../webapps/onPfDist && ln -s ../../../webapps/onServiceEndpoint 
cd ${washome}/online/lib 
ln -s ../webapps/onServiceEndpoint/WEB-INF/classes/log4j.xml 

echo "cp link" 
cd /app/ui/cp 
ln -s ../ap/cbpbook  && ln -s ../ap/favicon.ico  && ln -s ../ap/file \
&& ln -s ../ap/images  && ln -s ../ap/index.html  && ln -s ../ap/libs \
&& ln -s ../ap/login.html  && ln -s ../ap/main.html  && ln -s ../ap/scripts  && ln -s ../ap/styles

echo "env DB"
echo "export DB_PORT=${DB_PORT}" >> /home/${appuser}/.bash_aliases
echo "export DB_HOST=${DB_HOST}" >> /home/${appuser}/.bash_aliases
