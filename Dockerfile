FROM node:lts-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

EXPOSE 8080

# Inicia o aplicativo
CMD [ "node", "app.js" ]