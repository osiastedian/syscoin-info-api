FROM node:fermium

WORKDIR /app

COPY package.json ./

COPY package-lock.json ./

RUN npm ci

COPY ./index.js ./index.js

EXPOSE 3000

CMD node index.js