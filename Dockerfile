FROM node:14.13-buster-slim

WORKDIR /app

COPY ./package.json ./package.json

RUN npm install

COPY src/ src/

ENTRYPOINT ["npm", "start"]
