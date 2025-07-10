FROM node:20-alpine
#RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build
#CMD ["npm", "start"]
#CMD ["npm", "run", "dev"]
CMD npm run dev