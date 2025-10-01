FROM node:18.4

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Install pm2
RUN npm install pm2 -g

# Bundle app source
COPY . .

CMD [ "pm2-runtime", "--raw", "index.js" ]