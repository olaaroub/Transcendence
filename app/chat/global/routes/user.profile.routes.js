import createError from 'http-errors';

import {    updateAvatarUrl,
            updateUsername,
            deleteAccount }
from '../controllers/user.profile.controller.js';

export default async function updateUserCashItems(fastify)
{
    fastify.put('/global-chat/username/:id', updateUsername);
    fastify.put('/global-chat/avatar_url/:id', updateAvatarUrl);
    fastify.delete('/global-chat/account/:id', deleteAccount); 
}