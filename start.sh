docker build . -t dbot-image && docker run --name dbot -d -v $(pwd)/logs:/usr/src/app/logs $(pwd)/db/discord-bot.db:/usr/src/app/dbb/discord-bot.db dbot-image
