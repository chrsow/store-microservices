FROM node

WORKDIR /src

# Install app dependencies
COPY . .
RUN npm install

EXPOSE  8080
WORKDIR /src

CMD ["node", "paymentsAPI.js"]
