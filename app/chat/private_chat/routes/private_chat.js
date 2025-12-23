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

    const conversationId = getOrCreateConversation(userA, userB);

    reply.send({ conversationId });
  });
}
