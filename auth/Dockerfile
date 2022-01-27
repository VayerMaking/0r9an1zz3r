FROM node:17-alpine as builder

WORKDIR /home/api

COPY package*.json .

RUN npm install

COPY . .
COPY .env .

# NoSQL
RUN npx prisma generate     

# SQL
# RUN npx prisma migrate dev --name init

EXPOSE 5000
CMD npm start