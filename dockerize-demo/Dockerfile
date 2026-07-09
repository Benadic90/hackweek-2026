# We don't need a massive ubuntu image for a simple node app, alpine is way faster to pull
FROM node:18-alpine

# Set up where we're going to put all the code inside the container
WORKDIR /usr/src/app

# PRO TIP: Copy the package files first! This abuses Docker's layer caching 
# so we don't have to wait for npm install every time we change a line of code.
COPY package*.json ./

# Only install production dependencies. We don't need nodemon or jest in prod.
RUN npm ci --only=production

# Now toss the rest of the code in
COPY . .

# Let docker know which port the express app is listening on
EXPOSE 3000

# Security best practice: NEVER run your app as root. The alpine image comes with a 'node' user built-in.
USER node

# Fire it up!
CMD ["npm", "start"]
