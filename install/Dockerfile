FROM node
COPY . .
RUN npm ci
RUN npm run build

EXPOSE 80

ENTRYPOINT node dist/main
