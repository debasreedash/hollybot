FROM node:10-alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3978

# install and cache app dependencies
COPY . .
RUN npm install --silent

# start app
CMD ["npm", "start"]