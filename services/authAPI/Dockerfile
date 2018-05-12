FROM node

# Bundle app source
COPY . .

# Install app dependencies
RUN cd /src; npm install

EXPOSE  8080

CMD ["npm", "start"]
