FROM node:17-alpine as builder

WORKDIR /home/api

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .

EXPOSE 5000
