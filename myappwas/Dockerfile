FROM eastuni/ubuntu-ko:open-jdk

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
RUN apt-get update && apt-get install -y vim && \
     apt-get clean

RUN groupadd -g ${cbpgid} ${cbpgroup} \
          && useradd -d "/home/${cbpuser}" -u ${cbpuid} -g ${cbpgid} -m -s /bin/bash ${cbpuser}
RUN groupadd -g ${cigid} ${cigroup} \
          && useradd -d "/home/${ciuser}" -u ${ciuid} -g ${cigid} -m -s /bin/bash ${ciuser}
VOLUME /applogs

COPY bash_aliases /home/${cbpuser}/.bash_aliases
COPY app/product /app/product
COPY app/cbpprod /app/cbpprod
COPY app/apprun /app/apprun

RUN chown -R ${cbpuser}:${ciuser} /app && chown ${cbpuser}:${cbpuser} /home/${cbpuser}/.bash_aliases

USER ${cbpuser}

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash","/entrypoint.sh"]
