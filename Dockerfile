FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3333

# Inicia o aplicativo
CMD [ "node", "app.js" ]