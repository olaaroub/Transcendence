
import { getMessages } from '../controllers/chat.messages.controller.js';

export default async function getChatMessages(fastify) 
{
    fastify.get('/global-chat/messages', getMessages);
}