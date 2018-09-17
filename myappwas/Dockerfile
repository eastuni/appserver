FROM eastuni/ubuntu-ko:httpd

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
          && useradd -d "/home/${appuser}" -u ${appuid} -g ${appgid} -m -s /bin/bash ${appuser}
RUN groupadd -g ${cigid} ${cigroup} \
          && useradd -d "/home/${ciuser}" -u ${ciuid} -g ${cigid} -m -s /bin/bash ${ciuser}
VOLUME /applogs

COPY bash_aliases /home/${appuser}/.bash_aliases
COPY app/product /app/product
COPY app/cbpprod /app/cbpprod
COPY app/apprun /app/apprun

RUN chown -R ${appuser}:${ciuser} /app && chown ${appuser}:${appuser} /home/${appuser}/.bash_aliases

USER ${appuser}

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash","/entrypoint.sh"]
