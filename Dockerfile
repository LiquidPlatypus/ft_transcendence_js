FROM node:20.19-alpine

WORKDIR /app

COPY . .

RUN chmod +x ./install.sh

RUN ./install.sh

RUN npm cache clean --force

EXPOSE 3000

CMD ["npm", "start", "--prefix", "./backend"]
