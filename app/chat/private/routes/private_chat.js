import {
    getOrCreateConversation,
    sendMessage,
    getMessages,
    markMessagesAsSeen,
    getUnreadCount,
    getUnreadCountsForUser,
    getFriendIdFromConversation
} from "../conversation.js";

export default async function chatRoutes(fastify)
{
    fastify.ready((err) =>
    {
        if (err) throw err;

        fastify.io.on("connection", (socket) => {
            fastify.log.info({ socketId: socket.id }, "New user connected");

            socket.on("open_chat", async (data) => {
                const senderId = parseInt(data.senderId);
                const receiverId = parseInt(data.receiverId);

                try {
                    const conversationId = getOrCreateConversation(senderId, receiverId);
                    const roomName = `chat_${conversationId}`;

                    socket.join(roomName);

                    const oldMessages = getMessages(conversationId, 20, 0);

                    const seenResult = markMessagesAsSeen(conversationId, senderId);

                    if (seenResult.changes > 0) {
                        fastify.io.to(`user_${receiverId}`).emit("messages_seen", {
                            conversationId,
                            seenBy: senderId
                        });
                    }

                    socket.emit("chat_initialized", {
                        conversationId,
                        messages: oldMessages
                    });

                    fastify.log.info({ senderId, conversationId }, `User ${senderId} opened chat ${conversationId}`);

                } catch (error) {
                    console.error(error);
                    fastify.log.error({ err: error }, "Failed to load chat");
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

                    fastify.customMetrics.chatMessageCounter.inc({ chat_type: 'private' });

                    const payload = {
                        messageId: result.lastInsertRowid,
                        senderId,
                        content,
                        conversationId,
                        seen: false,
                        createdAt: new Date().toISOString()
                    };

                    fastify.io.to(`chat_${conversationId}`).emit("receive_message", payload);

                    const unreadCount = getUnreadCount(conversationId, receiverId);

                    fastify.io.to(`user_${receiverId}`).emit("new_notification", {
                        type: "NEW_MESSAGE",
                        from: senderId,
                        conversationId: conversationId,
                        text: "You have a new message!"
                    });

                    fastify.io.to(`user_${receiverId}`).emit("unread_messages", {
                        conversationId,
                        friendId: senderId,
                        unreadCount,
                        hasUnread: true
                    });

                    socket.emit("message_sent", { status: "sent" });
                } catch (error) {
                    console.error(error);
                    fastify.log.error({ err: error }, "Failed to send message");
                }
            });

            socket.on("mark_seen", async (data) => {
                const conversationId = parseInt(data.conversationId);
                const userId = parseInt(data.userId);
                const otherUserId = parseInt(data.otherUserId);

                try {
                    const result = markMessagesAsSeen(conversationId, userId);

                    if (result.changes > 0) {
                        fastify.io.to(`user_${otherUserId}`).emit("messages_seen", {
                            conversationId,
                            seenBy: userId
                        });

                        socket.emit("unread_messages", {
                            conversationId,
                            friendId: otherUserId,
                            unreadCount: 0,
                            hasUnread: false
                        });
                    }
                } catch (error) {
                    console.error(error);
                    fastify.log.error({ err: error }, "Failed to mark messages as seen");
                }
            });

            socket.on("typing_start", (data) => {
                const conversationId = parseInt(data.conversationId);
                const userId = parseInt(data.userId);
                const receiverId = parseInt(data.receiverId);

                fastify.io.to(`chat_${conversationId}`).emit("user_typing", {
                    conversationId,
                    userId,
                    isTyping: true
                });

                fastify.io.to(`user_${receiverId}`).emit("user_typing", {
                    conversationId,
                    userId,
                    isTyping: true
                });
            });

            socket.on("typing_stop", (data) => {
                const conversationId = parseInt(data.conversationId);
                const userId = parseInt(data.userId);
                const receiverId = parseInt(data.receiverId);

                fastify.io.to(`chat_${conversationId}`).emit("user_typing", {
                    conversationId,
                    userId,
                    isTyping: false
                });

                fastify.io.to(`user_${receiverId}`).emit("user_typing", {
                    conversationId,
                    userId,
                    isTyping: false
                });
            });

            socket.on("get_unread_counts", (data) => {
                const userId = parseInt(data.userId);

                try {
                    const unreadCounts = getUnreadCountsForUser(userId);
                    socket.emit("all_unread_counts", {
                        unreadCounts
                    });
                } catch (error) {
                    console.error(error);
                    fastify.log.error({ err: error }, "Failed to get unread counts");
                }
            });

            socket.on("userId", (userId) => {
                socket.join(`user_${userId}`);

                try {
                    const unreadCounts = getUnreadCountsForUser(parseInt(userId));
                    socket.emit("all_unread_counts", {
                        unreadCounts
                    });
                } catch (error) {
                    console.error(error);
                    fastify.log.error({ err: error }, "Failed to send initial unread counts");
                }
            });

            socket.on("disconnect", () => {
                fastify.log.info("User disconnected");
            });
        });
    });
}