### Competitive AMQP task scheduler service

#### install

##### run in docker

```
docker build -f install/Dockerfile -t competitive-amqp .
```

```
docker run -it --rm -p 80:80 -e NODE_ENV=production competitive-amqp
```
