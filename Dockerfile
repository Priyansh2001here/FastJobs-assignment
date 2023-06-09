FROM node:19

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN npm run tsc

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run" , "run"]