FROM mcr.microsoft.com/playwright:v1.48.2-noble

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npx playwright install

COPY . .

EXPOSE 3333

CMD ["node", "app.js"]
