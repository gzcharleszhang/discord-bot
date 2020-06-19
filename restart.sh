docker build . -t dbot-image && \
  docker stop dbot && \
  docker rm dbot && \
  docker run --name dbot -d -v $(pwd)/logs:/usr/src/app/logs dbot-image
