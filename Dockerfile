FROM node:22
WORKDIR /app
RUN apt-get update && apt-get install -y git
COPY . .
RUN npm install
CMD ["npm", "start"]
