FROM node:4.4

ENV SSL "DISABLED"
ENV PORT ${PORT:-9000}

RUN npm i -g bower \
             grunt-cli

RUN mkdir -p /app
WORKDIR /app

ADD package.json /app/
RUN npm i

COPY . /app/

EXPOSE $PORT

CMD ["npm", "start" ]
