
function addSocketAndUserInfos(socket, fastify, userId) 
{
    if (!fastify.sockets.has(userId))
    {
        const isFoundedInDataBase = fastify.db.prepare("SELECT 1 FROM usersCash WHERE id = ?").get(userId);

        if (!isFoundedInDataBase)
        {
            // fetch the data in userservice
            fastify.db.prepare('INSERT INTO usersCash(id, username, avatar_url) VALUSE(?, ?, ?)')
                .run(userId, `oussama_${userId}`, '/public/Default_pfp.jpg');
            fastify.log.info("fetch the user Infos successfly");
        }
        fastify.sockets.set(userId, new Set())
    }
    fastify.sockets.get(userId).add(socket);
}

function deletSocket(socket, fastify, userId)
{
    const userSockets = fastify.sockets.get(userId);
    if (userSockets)
    {
        userSockets.delete(socket);
            if (userSockets.size === 0) {
                fastify.sockets.delete(userId);
            }
    }
    fastify.log.info("socket closed - client disconnected");
}

/*

{
    content: "ffffffffgfg",
}

*/




async function  handleMessageEvent(socket, fastify, userId, message)
{
    const messageAsString = message.toString();
    const messageJson = JSON.parse(messageAsString);

    this.db.prepare("INSERT INTO messages(sender_id, content) VALUES(?, ?)")
        .run(userId, messageJson.content);
    
    const sockets = fastify.sockets;
    sockets.forEach((userId, usersSockets) => {
        usersSockets.forEach(userSocket => {
            this.db.prepare('SELECT ')
        })
    });
}

async function globalChatHandler(socket, request)
{
    const id = request.params.id;

    addSocketAndUserInfos(socket, request.server, id);
    socket.on('close', () => deletSocket(socket, request.server, id));
    socket.on('error', (err) => request.log.error({ err }, "Websocket connection error"))
    socket.on('message', async (message) => await handleMessageEvent(socket, request.server, id, message));
}


export default async function main(fastify)
{
    fastify.get('/chat/globalChat/:id', {socket: true}, globalChatHandler);
}