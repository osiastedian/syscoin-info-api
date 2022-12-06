FROM blocknetdx/syscoin4:v4.3.0

RUN apt-get update;

RUN apt-get -y install jq;

COPY ./custom-entry.sh /entrypoint.sh

COPY ./health-check.sh ./health-check.sh

ENTRYPOINT ["/entrypoint.sh"]