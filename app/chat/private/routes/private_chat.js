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

export default async function chatRoutes(fastify)
{

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
