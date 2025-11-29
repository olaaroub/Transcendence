

async function routes (fastify) {
    
    fastify.get('/notification/:id', { websocket: true }, (socket, req) => {
        try
        {
            const id = req.params.id;
            if (!id)
                throw ({error: "you did not gave me userId"});
            console.log("id is---------------------------------------------------:", id);
            fastify.sockets.set(id, socket);
            socket.on('close', () => {
                fastify.sockets.delete(id);
                console.log(`client id: ${id} disconnected!`);
            });
        }
        catch (err)
        {
            console.log(err);
        }
    });
}

module.exports = routes;