

async function routes (fastify) {
    
    fastify.get('/hello-ws', { websocket: true }, (connection, req) => {
        // Client connect
        try
        {
            console.log('Client connected');
            connection.on('message', message => {
                connection.send("thanks");
                console.log(`Client message: ${message}`);
            });
            // Client disconnect
            connection.on('close', () => {
                console.log('Client disconnected');
            });
        }
        catch (err)
        {
            console.log(err);
        }
    });
}

module.exports = routes;