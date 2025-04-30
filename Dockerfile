# Use Node.js official image
FROM node:16

WORKDIR /app

COPY . .

RUN npm install


EXPOSE 5780

CMD ["npm", "start"]
