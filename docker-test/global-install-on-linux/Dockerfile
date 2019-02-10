FROM node:carbon

RUN apt-get update && apt-get install vim -y
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    net-tools \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN npm i -g p-killa
RUN npm install http-server -g

RUN ["chmod", "+x", "/usr/local/lib/node_modules/p-killa/scripts/linux/list-pid.sh"]
RUN ["chmod", "+x", "/usr/local/lib/node_modules/p-killa/scripts/linux/kill-pid.sh"]
RUN ["chmod", "+x", "/usr/local/lib/node_modules/p-killa/scripts/linux/kill-pid-delay.sh"]

RUN http-server -p 5555 . &
# RUN p-killa --ports 5555
# CMD ["http-server",".","-p", "3333"]
