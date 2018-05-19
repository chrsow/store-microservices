FROM node

# Set work directory
WORKDIR /src

# Bundle app source
COPY package*.json ./
COPY . .

# Install app dependencies
RUN npm install

EXPOSE  8080

CMD ["npm", "start"]
