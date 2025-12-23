
async function addSocketAndUserInfos(socket, fastify, userId) 
{
    if (!fastify.sockets.has(userId))
    {
        console.log(userId);
        const isFoundedInDataBase = fastify.db.prepare("SELECT 1 FROM usersCash WHERE id = ?").get(userId);

        if (!isFoundedInDataBase)
        {
            console.log(userId)
            const userData = await fetch(`http://localhost:3002/api/user/chat/profile/${userId}`);
            const {username, avatar_url} = await userData.json();
            console.log(username, avatar_url)
            if (!username || !avatar_url)
                throw new Error("this user not founed");
            fastify.db.prepare('INSERT INTO usersCash(id, username, avatar_url) VALUES(?, ?, ?)')
                .run(userId, username, avatar_url);
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

1 [1, 2, 3], 2 [4, 3,2]
*/




async function  handleMessageEvent(socket, fastify, userId, message)
{
    const messageAsString = message.toString();
    const messageJson = JSON.parse(messageAsString);

    const messageIteams = fastify.db.prepare("INSERT INTO messages(sender_id, content) VALUES(?, ?) RETURNING sender_id, content, created_at")
                            .get(userId, messageJson.content);

    const userData = fastify.db.prepare('SELECT * FROM usersCash WHERE id = ?').get(userId);

    socket.send(JSON.stringify({
        type: 'MESSAGE_SENDED_SUCCESSFULLY'
    }));

    const response = {
        messageIteams,
        username: userData.username,
        avatar_url: userData.avatar_url
    }

    const sockets = fastify.sockets;
    sockets.forEach((userSockets, user_id) => {
        userSockets.forEach(userSocket => {
            if (userSocket !== socket)
                userSocket.send(JSON.stringify(response));
        })
    });
}

async function globalChatHandler(socket, request)
{
    const id = request.params.id;

    try
    {
        await addSocketAndUserInfos(socket, request.server, id);

        socket.on('close', () => deletSocket(socket, request.server, id));
        socket.on('error', (err) => request.log.error({ err }, "Websocket connection error"))
        socket.on('message', async (message) => await handleMessageEvent(socket, request.server, id, message));
    } catch (err)
    {
        request.log.error(err);
    }
}


export default async function main(fastify)
{
    const requestSchema = {
        params: {
            type: 'object',
            properties: {
                id: {type: 'integer'}
            },
            required: ['id']
        }
    }
    fastify.get('/chat/globalChat/:id', { websocket: true, schema: requestSchema}, globalChatHandler);
}