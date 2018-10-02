#!bin/bash

washome=/app/cbpprod/was_instance
appuser=apprun
ciuser=jenkins

echo "init app"
rm -rf /app/*
mkdir -p /app/apprun

washome=/app/cbpprod/was_instance
webapps=/app/cbpprod/webapps

echo "copy cbp app"
cp -r /app_init/product /app
cp -r /app_init/cbpprod /app
cp -r /app_init/apps    /app/apprun
cp -r /app_init/ui      /app
mv /app/ui/ca/*					/app/ui/ap
cp -r /app_init/admin_conf/* ${washome}/admin/conf
cp -r /app_init/online_conf/* ${washome}/online/conf

echo "copy pf app"

pfDir=/app_init/pf
pfconf=/app_init/pf_conf
pfdistconf=/app_init/pfdist_conf
pfhome=$webapps/pf
pflibDir=$pfhome/WEB-INF/lib
# UI
mkdir -p $pflibDir
#cp -r $pfDir/ui/* $pfhome
mkdir -p /app/ui/pf
cp -r $pfDir/ui/* /app/ui/pf

# lib
cp $pfDir/lib/pf/*.jar $pflibDir/
cp $pfDir/lib/deps/*.jar $pflibDir/
cp -r $pfconf/* $pfhome/WEB-INF

echo "copy pfdist app"
cp -r $pfDir/pfdist $webapps/cpPfDist
cp -r $pfdistconf/* $webapps/cpPfDist/WEB-INF
cp -r $pfDir/pfdist $webapps/onPfDist
cp -r $pfdistconf/* $webapps/onPfDist/WEB-INF

echo "chown,chmod"
chown -R ${appuser}:${ciuser} /app 
chmod 755 ${washome}/admin/*.sh 
chmod 755 ${washome}/online/*.sh 

echo "www link"
cd /var/www/html 
ln -s /app/ui/ap && ln -s /app/ui/biz && ln -s /app/ui/cp

echo "webapps"
r_path=../../../webapps

mkdir ${washome}/admin/webapps 
cd ${washome}/admin/webapps
ln -s $r_path/bxmAdmin && ln -s $r_path/cpPfDist && ln -s $r_path/cpServiceEndpoint \
&& ln -s $r_path/pf 
cd ${washome}/admin/lib 
ln -s ../webapps/cpServiceEndpoint/WEB-INF/classes/log4j.xml 
      
mkdir ${washome}/online/webapps 
cd ${washome}/online/webapps 
ln -s $r_path/onPfDist && ln -s $r_path/onServiceEndpoint 
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
