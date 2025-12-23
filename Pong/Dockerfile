FROM node:alpine

WORKDIR /app

COPY . .

RUN cd /Shared && npm install && npm run build
RUN cd /Offline && npm install && npm run build

EXPOSE 3000

CMD [""]