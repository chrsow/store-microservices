FROM node

# Bundle app source
COPY ./models /src/models
COPY ./public /src/public
COPY ./app.js /src/app.js
COPY ./faker.js /src/faker.js
COPY ./package.json /src/package.json

# Install app dependencies
RUN cd /src; npm install

#export the mongo uri 
ENV MONGO_URI mongodb://localhost:27017/store-microservices

EXPOSE  8080
CMD ["node", "/src/app.js"]
