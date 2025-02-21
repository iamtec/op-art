FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000

# Install nodemon globally if you haven't already
RUN npm install -g nodemon

CMD ["nodemon", "server.js"]
