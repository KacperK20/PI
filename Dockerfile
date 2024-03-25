FROM node:lts-alpine
 
WORKDIR /app

COPY prisma/schema.prisma ./prisma/schema.prisma
COPY build ./build
COPY ssl ./ssl

COPY ["package.json", "package-lock.json*", "./"]
COPY app_settings.json .
COPY server.js .

RUN npm install
RUN npx prisma generate

EXPOSE 80 443
CMD ["node","server.js"]