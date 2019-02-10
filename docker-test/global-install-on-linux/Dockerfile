FROM ubuntu

RUN apt-get update
RUN apt-get install curl -y
RUN apt-get install gnupg2 -y
RUN apt-get install lsof -y

RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get install -y nodejs


RUN npm i -g p-killa
RUN npm install http-server -g

RUN http-server -p 5555 . &
# RUN p-killa --ports 5555
# CMD ["http-server",".","-p", "3333"]
