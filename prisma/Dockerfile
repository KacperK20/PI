# Use the Node.js image
FROM node:lts-alpine as builder

# Set the working directory
WORKDIR /app

# Copy the Prisma schema and generate the client
COPY prisma/schema.prisma ./
COPY prisma/seed.ts ./
RUN echo "DATABASE_URL=mysql://root:password@10.11.6.150:3306/magazyn_app" > /app/.env
RUN npx prisma generate

# Expose the default port for Prisma Studio
EXPOSE 5555

# Start Prisma Studio
CMD ["npx", "prisma", "studio"]