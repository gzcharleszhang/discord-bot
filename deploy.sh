source ./env.sh && \
    ssh -i $HOST_SECRET $HOST_USER@$HOST_IP \
    'cd ./discord-bot && git pull && ./restart.sh'
