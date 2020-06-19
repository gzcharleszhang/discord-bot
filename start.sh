docker build . -t dbot-image && docker run --name dbot -d -v $(pwd)/logs:/usr/src/app/logs dbot-image
