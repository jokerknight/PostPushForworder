FROM node:18-alpine

WORKDIR /app/src

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

CMD ["node", "app.js"]