

async function routes (fastify) {
    
    fastify.get('/notification/:id', { websocket: true }, async (socket, req) => {
        try
        {
            const id = req.params.id;
            if (!id)
                throw ({error: "you did not gave me userId"});
            console.log("id is---------------------------------------------------: ", id);
            if (!fastify.sockets.has(id))
                fastify.sockets.set(id, new Set());
            const socketsUser = fastify.sockets.get(id);
            // console.log(socketsUser);
            fastify.sockets.get(id).add(socket);


            socket.on('close', () => {
                if (socketsUser)
                {
                    socketsUser.delete(socket);
                    if (socketsUser.size == 0)
                        fastify.sockets.delete(id);
                }
            });
            /*
                data format:
                {
                    type: 'MAKE_AS_READ' 
                }
             */

            socket.on('message',  async (message) => {
                try {
                console.log(message.toString());
                const data = JSON.parse(message.toString());
                if (data.type == 'MAKE_AS_READ')
                {
                    await fastify.db.prepare("UPDATE infos SET is_read = TRUE WHERE user_id = ?").run([id]);
                    const response = {type: 'NOTIFICATION_READED'}
                    const notificationSockets = fastify.sockets.get(id);
                    for (const socket of notificationSockets)
                    {
                        if (socket && socket.readyState == 1)
                            socket.send(JSON.stringify(response));
                    }
                }

                }
                catch (err)
                {
                    console.log(err);
                    socketsUser.delete(socket);
                    socket.close();
                    console.log("the socket has been deleted")
                }

            });
        }
        catch (err)
        {
            console.log(err);
            socket.close();
            console.log("the socket has been deleted")
            if (fastify.sockets.has(id))
                fastify.sockets.delete(id);
        }
    });
}

module.exports = routes;