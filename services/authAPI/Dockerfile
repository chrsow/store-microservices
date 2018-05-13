FROM node

# Bundle app source
COPY . /src 

# Install app dependencies
RUN cd /src;
RUN npm install

EXPOSE  8080
WORKDIR /src
CMD ["npm", "start"]
