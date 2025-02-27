# Use the official Node.js image as the base image
FROM node:18

# Install netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Copy the wait-for-rabbit script
COPY wait-for-rabbit.sh /app/wait-for-rabbit.sh

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]