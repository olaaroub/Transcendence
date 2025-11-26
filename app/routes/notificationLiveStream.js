

async function routes (fastify) {
    
    fastify.get('/notification/:id', { websocket: true }, (connection, req) => {
        // Client connect
        try
        {
            const id = req.params.id;
            if (!id)
                throw ({error: "you did not gave me userId"});
            console.log("id is---------------------------------------------------:", id);
            fastify.connections.set(id, connection.socket);
            console.log(fastify.connections.size);
            connection.on('close', () => {
                fastify.connections.delete(id);
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