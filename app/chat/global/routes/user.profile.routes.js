import createError from 'http-errors';

import {    updateAvatarUrl,
            updateUsername,
            deleteAccount }
from '../controllers/user.profile.controller.js';

export default async function updateUserCashItems(fastify)
{
    fastify.put('/chat/global/username/:id', updateUsername);
    fastify.put('/chat/global/avatar_url/:id', updateAvatarUrl);
    fastify.delete('/chat/global/account/:id', deleteAccount); 
}