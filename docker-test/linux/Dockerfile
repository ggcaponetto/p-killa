FROM node:carbon
WORKDIR ./context
COPY ./context .

RUN apt-get update && apt-get install vim -y
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    net-tools \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN git init -q
RUN npm i
RUN npm run build-install-global
RUN npm install http-server -g
# CMD ["http-server",".","-p", "3333"]
