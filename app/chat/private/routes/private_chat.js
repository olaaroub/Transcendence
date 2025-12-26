// import {
//     getOrCreateConversation,
//     sendMessage,
//     getMessages
//   } from "../conversation.js";
	
// export default async function chatRoutes(fastify)
// {
//   fastify.post("/conversation", (req, reply) =>
//   {
//     const { userA, userB } = req.body;

//     const conversationId = getOrCreateConversation(userA, userB);

//     reply.send({ conversationId });
//   });
// }


import {
	getOrCreateConversation,
	sendMessage,
	getMessages
} from "../conversation.js";

// export default async function chatRoutes(fastify)
// {

// 	fastify.post("/conversation", (req, reply) =>
// 	{
// 		const { userA, userB } = req.body;

// 		if (!userA || !userB) {
// 			return reply.status(400).send({ error: "userA and userB are required" });
// 		}

// 		const conversationId = getOrCreateConversation(userA, userB);
// 		reply.send({ conversationId });
// 	});

// 	fastify.post("/message", (req, reply) =>
// 	{
// 		const { conversationId, senderId, content } = req.body;

// 		if (!conversationId || !senderId || !content) {
// 			return reply.status(400).send({ error: "conversationId, senderId, and content are required" });
// 		}

// 		const result = sendMessage(conversationId, senderId, content);
// 		reply.send({ messageId: result.lastInsertRowid });
// 	});

// 	fastify.get("/messages/:conversationId", (req, reply) =>
// 	{
// 		const conversationId = parseInt(req.params.conversationId);
// 		const limit = parseInt(req.query.limit) || 20;
// 		const offset = parseInt(req.query.offset) || 0;

// 		if (!conversationId) {
// 			return reply.status(400).send({ error: "conversationId is required" });
// 		}

// 		const messages = getMessages(conversationId, limit, offset);
// 		reply.send({ messages });
// 	});
// }

export default async function chatRoutes(fastify) {

	fastify.ready((err) => {
		if (err) throw err;

		fastify.io.on("connection", (socket) => {
			console.log("New connection:", socket.id);
			socket.on("join_private", (userId) => {
				socket.join(`user_${userId}`);
				console.log(`User ${userId} is now online and in their room`);
			});

			socket.on("send_message", async (data) => {
				const { conversationId, senderId, receiverId, content } = data;

				try
				{
					const result = sendMessage(conversationId, senderId, content);
					const messageId = result.lastInsertRowid;

					fastify.io.to(`user_${receiverId}`).emit("receive_message",
					{
						messageId,
						senderId,
						content,
						conversationId,
						createdAt: new Date()
					});

					socket.emit("message_sent", { messageId, status: "sent" });

				}
				catch (error)
				{
					console.error("DB Error:", error);
				}
			});

			socket.on("disconnect", () => {
				console.log("User disconnected");
			});
		});
	});

	fastify.post("/conversation", (req, reply) =>
	{
		const { userA, userB } = req.body;

		if (!userA || !userB) {
			return reply.status(400).send({ error: "userA and userB are required" });
		}

		const conversationId = getOrCreateConversation(userA, userB);
		reply.send({ conversationId });
	});

	fastify.post("/message", (req, reply) =>
	{
		const { conversationId, senderId, content } = req.body;

		if (!conversationId || !senderId || !content) {
			return reply.status(400).send({ error: "conversationId, senderId, and content are required" });
		}

		const result = sendMessage(conversationId, senderId, content);
		reply.send({ messageId: result.lastInsertRowid });
	});

	fastify.get("/messages/:conversationId", (req, reply) =>
	{
		const conversationId = parseInt(req.params.conversationId);
		const limit = parseInt(req.query.limit) || 20;
		const offset = parseInt(req.query.offset) || 0;

		if (!conversationId) {
			return reply.status(400).send({ error: "conversationId is required" });
		}

		const messages = getMessages(conversationId, limit, offset);
		reply.send({ messages });
	});
}