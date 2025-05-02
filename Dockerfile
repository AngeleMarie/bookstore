# Use Node.js official image
FROM node:16

WORKDIR /app

COPY . .

RUN npm install


EXPOSE 5600

CMD ["npm", "start"]
