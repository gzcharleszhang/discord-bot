docker build . -t dbot-image && \
  docker stop dbot && \
  docker rm dbot && \
  docker run --name dbot -d -v $(pwd)/logs:/usr/src/app/logs \
    -v :$(pwd)/db/discord-bot.db:/usr/src/app/dbb/discord-bot.db dbot-image
