FROM node:12.10.0

COPY index.js /usr/local/
RUN mkdir /cache && apt-get update && apt-get install -y pigz
VOLUME /cache

CMD [ "node", "/usr/local/index.js" ]
