# Build Geth in a stock Go builder container
FROM golang:1.19-alpine as go-ethereum

ARG GETH_REPO=https://github.com/syscoin/go-ethereum.git
RUN apk add --no-cache gcc musl-dev linux-headers git
RUN git clone ${GETH_REPO}
ADD . /go-ethereum
RUN cd go-ethereum && go run build/ci.go install
# Build stage for Syscoin Core
FROM alpine:3.15 as syscoin-core

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add autoconf
RUN apk --no-cache add automake
RUN apk --no-cache add boost-dev
RUN apk --no-cache add build-base
RUN apk --no-cache add chrpath
RUN apk --no-cache add file
RUN apk --no-cache add gnupg
RUN apk --no-cache add libevent-dev
RUN apk --no-cache add libressl
RUN apk --no-cache add libtool
RUN apk --no-cache add linux-headers
RUN apk --no-cache add cmake
RUN apk --no-cache add libc-dev
RUN apk --no-cache add make
RUN apk --no-cache add zeromq-dev
RUN apk --no-cache add git
RUN apk --no-cache add python3
RUN apk --no-cache add xz
RUN apk --no-cache add bison
RUN apk --no-cache add curl
RUN apk --no-cache add pkgconf
RUN apk --no-cache add bash
RUN apk --no-cache add clang
RUN apk --no-cache add util-macros
RUN apk --no-cache add gmp-dev
RUN apk --no-cache add sqlite-dev
RUN set -ex \
  && for key in \
    90C8019E36C2E964 \
  ; do \
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" || \
    gpg --batch --keyserver keys.openpgp.org --recv-keys "$key" || \
    gpg --batch --keyserver keyserver.pgp.com --recv-keys "$key" || \
    gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" ; \
  done

ENV SYSCOIN_PREFIX=/opt/syscoin

ARG SYS_REPO=https://github.com/syscoin/syscoin.git
ARG TAG=v4.4.0rc12
RUN git clone --depth 1 --branch ${TAG} ${SYS_REPO}
WORKDIR /syscoin
RUN sed -i '/AX_PROG_CC_FOR_BUILD/a\AR_FLAGS=cr' src/secp256k1/configure.ac
RUN sed -i s:sys/fcntl.h:fcntl.h: src/compat/compat.h
RUN ./autogen.sh
RUN ./configure \
    --prefix=${SYSCOIN_PREFIX} \
    --mandir=/usr/share/man \
    --disable-tests \
    --disable-bench \
    --disable-ccache \
    --with-gui=no \
    --with-utils \
    --with-libs \
    --with-daemon
RUN make install -j$(nproc)
RUN strip ${SYSCOIN_PREFIX}/bin/syscoin-cli
RUN strip ${SYSCOIN_PREFIX}/bin/syscoin-tx
RUN strip ${SYSCOIN_PREFIX}/bin/syscoind
RUN rm ${SYSCOIN_PREFIX}/bin/sysgeth
# Build stage for compiled artifacts
FROM alpine:3.15

LABEL maintainer.0="Jagdeep Sidhu (@realSidhuJag)"

RUN adduser -S syscoin
RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
  boost-filesystem \
  boost-system \
  boost-thread \
  libevent \
  libzmq \
  su-exec \
  ca-certificates \
  gmp \
  sqlite-dev

ENV SYSCOIN_PREFIX=/opt/syscoin
ENV PATH=${SYSCOIN_PREFIX}/bin:$PATH
ENV SYSCOIN_VERSION=4.4.0

# Copy SYS binary to the container
COPY --from=syscoin-core /opt /opt
# Copy NEVM binary to the container
COPY --from=go-ethereum /go/go-ethereum/build/bin/geth ${SYSCOIN_PREFIX}/bin/sysgeth
COPY --from=go-ethereum /go/go-ethereum/build/bin/faucet ${SYSCOIN_PREFIX}/bin/faucet
COPY docker-entrypoint.sh /entrypoint.sh

VOLUME ["/home/syscoin/.syscoin"]

EXPOSE 8369 8370 18369 18370 18443 18444 38332 38333 8545 8546 30303 30303/udp

ENTRYPOINT ["/entrypoint.sh"]

RUN syscoind -version | grep "Syscoin Core version v${SYSCOIN_VERSION}"

CMD ["syscoind"]