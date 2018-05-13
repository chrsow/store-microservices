FROM node

# Bundle app source
COPY . /src

# Install app dependencies
RUN cd /src; npm install

#export the mongo uri
ENV MONGO_URI mongodb://store-database:27017/store-microservices

EXPOSE  8080
CMD ["node", "/src/productApi.js"]
