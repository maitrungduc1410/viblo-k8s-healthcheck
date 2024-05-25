FROM --platform=linux/amd64 node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD [ "node", "./bin/www" ]