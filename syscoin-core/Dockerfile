FROM debian:bullseye-slim

LABEL maintainer.0="Jagdeep Sidhu (@realSidhuJag)"

RUN useradd -r syscoin \
  && apt-get update -y \
  && apt-get install -y curl gnupg gosu ca-certificates \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ARG TARGETPLATFORM
ENV SYSCOIN_VERSION=4.3.99
ENV SYSCOIN_DATA=/home/syscoin/.syscoin
ENV PATH=/opt/syscoin-${SYSCOIN_VERSION}/bin:$PATH

RUN curl -SLO https://syscoincore.org/bin/syscoin-core-${SYSCOIN_VERSION}/SHA256SUMS.asc | apt-key add -

RUN set -ex \
  && if [ "${TARGETPLATFORM}" = "linux/amd64" ]; then export TARGETPLATFORM=x86_64-linux-gnu; fi \
  && if [ "${TARGETPLATFORM}" = "linux/arm64" ]; then export TARGETPLATFORM=aarch64-linux-gnu; fi \
  && if [ "${TARGETPLATFORM}" = "linux/arm/v7" ]; then export TARGETPLATFORM=arm-linux-gnueabihf; fi \
  && for key in \
    01EA5486DE18A882D4C2684590C8019E36C2E964 \
  ; do \
      gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" || \
      gpg --batch --keyserver pgp.mit.edu --recv-keys "$key" || \
      gpg --batch --keyserver keyserver.pgp.com --recv-keys "$key" || \
      gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
      gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" ; \
    done \
  && curl -SLO https://syscoincore.org/bin/syscoin-core-${SYSCOIN_VERSION}/syscoin-${SYSCOIN_VERSION}-${TARGETPLATFORM}.tar.gz \
  && curl -SLO https://syscoincore.org/bin/syscoin-core-${SYSCOIN_VERSION}/SHA256SUMS.asc \
  && gpg --verify SHA256SUMS.asc \
  && grep " syscoin-${SYSCOIN_VERSION}-${TARGETPLATFORM}.tar.gz" SHA256SUMS.asc | sha256sum -c - \
  && tar -xzf *.tar.gz -C /opt \
  && rm *.tar.gz *.asc \
  && rm -rf /opt/syscoin-${SYSCOIN_VERSION}/bin/syscoin-qt

COPY docker-entrypoint.sh /entrypoint.sh

VOLUME ["/home/syscoin/.syscoin"]

EXPOSE 8369 8370 18369 18370 18443 18444 38332 38333


ENTRYPOINT ["/entrypoint.sh"]

RUN syscoind -version | grep "Syscoin Core version v${SYSCOIN_VERSION}"

CMD ["syscoind"]