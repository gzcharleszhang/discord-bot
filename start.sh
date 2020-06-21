docker build . -t dbot-image && docker run --name dbot -d -v $(pwd)/logs:/usr/src/app/logs -v $(pwd)/db:/usr/src/app/db dbot-image
