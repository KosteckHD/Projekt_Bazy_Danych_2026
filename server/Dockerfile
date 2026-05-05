FROM node:20-alpine

WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1337

CMD ["npm", "run", "dev"]