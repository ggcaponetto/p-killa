FROM node:carbon
WORKDIR .
COPY ./context .
RUN git init -q
RUN npm i
RUN npm run build
RUN  npm install http-server -g
CMD ["http-server",".","-p", "3333"]
