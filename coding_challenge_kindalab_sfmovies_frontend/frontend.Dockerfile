FROM node:lts

WORKDIR /app
COPY .env .env
COPY . .

RUN npm i
RUN npm i -g serve
RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "build", "-l", "3000" ]
