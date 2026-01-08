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
            console.log("New user connected:", socket.id);

            socket.on("open_chat", async (data) => {
                const senderId = parseInt(data.senderId);
                const receiverId = parseInt(data.receiverId);

                try {
                    const conversationId = getOrCreateConversation(senderId, receiverId);
                    const roomName = `chat_${conversationId}`;

                    socket.join(roomName);

                    const oldMessages = getMessages(conversationId, 20, 0);

                    // Mark messages as seen when opening chat
                    const seenResult = markMessagesAsSeen(conversationId, senderId);
                    
                    // Notify the other user that their messages were seen
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
                        seen: false,
                        createdAt: new Date().toISOString() 
                    };

                    fastify.io.to(`chat_${conversationId}`).emit("receive_message", payload);

                    // Get unread count for the receiver
                    const unreadCount = getUnreadCount(conversationId, receiverId);

                    fastify.io.to(`user_${receiverId}`).emit("new_notification", {
                        type: "NEW_MESSAGE",
                        from: senderId,
                        conversationId: conversationId,
                        text: "You have a new message!"
                    });

                    // Emit unread indicator for red dot
                    fastify.io.to(`user_${receiverId}`).emit("unread_messages", {
                        conversationId,
                        friendId: senderId,
                        unreadCount,
                        hasUnread: true
                    });

                    socket.emit("message_sent", { status: "sent" });
                } catch (error) { 
                    console.error(error); 
                }
            });

            // Mark messages as seen
            socket.on("mark_seen", async (data) => {
                const conversationId = parseInt(data.conversationId);
                const userId = parseInt(data.userId);
                const otherUserId = parseInt(data.otherUserId);

                try {
                    const result = markMessagesAsSeen(conversationId, userId);
                    
                    if (result.changes > 0) {
                        // Notify sender that their messages were seen
                        fastify.io.to(`user_${otherUserId}`).emit("messages_seen", {
                            conversationId,
                            seenBy: userId
                        });

                        // Update unread indicator (remove red dot)
                        socket.emit("unread_messages", {
                            conversationId,
                            friendId: otherUserId,
                            unreadCount: 0,
                            hasUnread: false
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            });

            // Typing indicator - user started typing
            socket.on("typing_start", (data) => {
                const conversationId = parseInt(data.conversationId);
                const userId = parseInt(data.userId);
                const receiverId = parseInt(data.receiverId);

                fastify.io.to(`chat_${conversationId}`).emit("user_typing", {
                    conversationId,
                    userId,
                    isTyping: true
                });

                // Also send to user's personal room in case they're not in chat room
                fastify.io.to(`user_${receiverId}`).emit("user_typing", {
                    conversationId,
                    userId,
                    isTyping: true
                });
            });

            // Typing indicator - user stopped typing
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

            // Get all unread counts for a user (useful on app load)
            socket.on("get_unread_counts", (data) => {
                const userId = parseInt(data.userId);

                try {
                    const unreadCounts = getUnreadCountsForUser(userId);
                    socket.emit("all_unread_counts", {
                        unreadCounts
                    });
                } catch (error) {
                    console.error(error);
                }
            });

            socket.on("userId", (userId) => {
                socket.join(`user_${userId}`);

                // Send unread counts when user connects
                try {
                    const unreadCounts = getUnreadCountsForUser(parseInt(userId));
                    socket.emit("all_unread_counts", {
                        unreadCounts
                    });
                } catch (error) {
                    console.error(error);
                }
            });

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });
    });
}
