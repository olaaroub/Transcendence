import {
	getOrCreateConversation,
	sendMessage,
	getMessages
} from "../conversation.js";

export default async function chatRoutes(fastify)
{
    fastify.ready((err) =>
	{
        if (err) throw err;

        fastify.io.on("connection", (socket) => {
            console.log("New user connected:", socket.id);

            socket.on("open_chat", async (data) => {
                const senderId = parseInt(data.senderId);
                const receiverId = parseInt(data.receiverId);

                try {
                    const conversationId = getOrCreateConversation(senderId, receiverId);
                    const roomName = `chat_${conversationId}`;

                    socket.join(roomName);

                    const oldMessages = getMessages(conversationId, 20, 0);

                    socket.emit("chat_initialized", {
                        conversationId,
                        messages: oldMessages
                    });

                    console.log(`User ${senderId} opened chat ${conversationId}`);
                } catch (error) {
                    console.error(error);
                    socket.emit("error", { message: "Failed to load chat" });
                }
            });

            socket.on("send_message", async (data) =>
			{
                const conversationId = parseInt(data.conversationId);
                const senderId = parseInt(data.senderId);
                const receiverId = parseInt(data.receiverId);
                const { content } = data;

                try {
                    const result = sendMessage(conversationId, senderId, content);
                    
                    const payload = {
                        messageId: result.lastInsertRowid,
                        senderId,
                        content,
                        conversationId,
                        createdAt: new Date().toISOString() 
                    };

                    fastify.io.to(`chat_${conversationId}`).emit("receive_message", payload);

                    fastify.io.to(`user_${receiverId}`).emit("new_notification", {
                        type: "NEW_MESSAGE",
                        from: senderId,
                        conversationId: conversationId,
                        text: "You have a new message!"
                    });

                    socket.emit("message_sent", { status: "sent" });
                } catch (error) { 
                    console.error(error); 
                }
            });

            socket.on("userId", (userId) => {
                socket.join(`user_${userId}`);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });
    });
}
