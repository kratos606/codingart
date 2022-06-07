FROM ubuntu:latest

RUN apt-get update -y \
    && apt-get upgrade -y \
    && apt-get install nodejs npm python3 python3-pip -y

RUN pip3 install Pillow

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run client-install

RUN npm run client-build

EXPOSE 80

CMD [ "node", "index.js" ]