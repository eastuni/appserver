FROM eastuni/ubuntu-ko:sww
#FROM localhost:5000/ubuntu-ko:sww

ARG appuser=apprun
ARG appgroup=apprun
ARG appuid=1001
ARG appgid=1001

ARG ciuser=jenkins
ARG cigroup=jenkins
ARG ciuid=1000
ARG cigid=1000

# cbp is run with user `manager`, uid = 1001
# If you bind mount a volume from the host or a data container,
# ensure you use the same uid

RUN groupadd -g ${appgid} ${appgroup} \
          && useradd -d "/home/${appuser}" -u ${appuid} -g ${appgid} -m -s /bin/bash ${appuser} \
					&& groupadd -g ${cigid} ${cigroup} \
          && useradd -d "/home/${ciuser}" -u ${ciuid} -g ${cigid} -m -s /bin/bash ${ciuser}
VOLUME /applogs
VOLUME /app

COPY httpconf/00-cbp.conf /etc/apache2/sites-available/
COPY product	/app_init/product
COPY cbpprod	/app_init/cbpprod
COPY ui	/app_init/ui
COPY admin_conf		/app_init/admin_conf
COPY online_conf	/app_init/online_conf
COPY pf_conf	/app_init/pf_conf
COPY pfdist_conf	/app_init/pfdist_conf
COPY bash_aliases /home/${appuser}/.bash_aliases

RUN chown ${appuser}:${appuser} /home/${appuser}/.bash_aliases \
		&& a2ensite 00-cbp  

COPY entrypoint.sh /entrypoint.sh
COPY startwas.sh /startwas.sh
COPY initapp.sh /initapp.sh

ENV DB_PORT 3306
ENV DB_HOST mysql

USER root
ENTRYPOINT ["bash","/entrypoint.sh"]
