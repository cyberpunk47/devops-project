FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VERSION=blue
ENV VERSION=$VERSION
EXPOSE 5000
CMD ["npm", "start"]
