FROM node:20-alpine

WORKDIR /server

COPY package*.json ./

RUN npm install
#RUN npm install --include=dev

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
