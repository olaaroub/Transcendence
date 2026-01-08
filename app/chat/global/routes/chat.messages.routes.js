
import { getMessages } from '../controllers/chat.messages.controller.js';

export default async function getChatMessages(fastify) 
{
    fastify.get('/chat/global/messages', getMessages);
}