import createError from 'http-errors'

async function blockAndunblockFriend(req, reply) {
  const id = req.params.id;
  const { friend_id, block } = req.body;

  if (!friend_id)
    throw createError.BadRequest("Friend ID is required");

  const friendshipsData = this.db.prepare("SELECT status, blocker_id FROM friendships WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)")
    .get([id, friend_id, id, friend_id]);

  if (!friendshipsData || friendshipsData.status === 'BLOCKED' && String(friendshipsData.blocker_id) !== String(id) && block)
  {
    req.log.info({ userId: id, targetId: friend_id }, "User trying to block a friend who already blocked them");
    reply.code(200).send({ success: true });
  }

  if (!friendshipsData || (friendshipsData.status === 'BLOCKED' && String(friendshipsData.blocker_id) !== String(id) && !block))
    throw createError.BadRequest("You trying to unblock a friend who blocked you");

  if (!friendshipsData || (friendshipsData.status === 'BLOCKED' && block) || friendshipsData.status === 'PENDING')
    throw createError.NotFound("Friendship not found or not in a valid state for this operation");


  if (block) {
    const info = this.db.prepare("UPDATE friendships SET status = ?, blocker_id = ? WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)")
      .run(["BLOCKED", id, id, friend_id, id, friend_id]);

    if (info.changes === 0) throw createError.NotFound("Friendship not found");

    req.log.info({ userId: id, targetId: friend_id }, "User BLOCKED a friend");
    this.customMetrics.friendCounter.inc({ action: 'blocked' });
  }
  else {
    const info = this.db.prepare("DELETE FROM friendships WHERE (userRequester = ? AND userReceiver = ?) OR (userReceiver = ? AND userRequester = ?)")
      .run([id, friend_id, id, friend_id]);

    if (info.changes === 0) throw createError.NotFound("Friendship not found or not blocked");

    req.log.info({ userId: id, targetId: friend_id }, "User UNBLOCKED a friend");
    this.customMetrics.friendCounter.inc({ action: 'unblocked' });
  }

  reply.code(200).send({ success: true });
}

export default async function block_unblockFriend(fastify)
{
    fastify.put("/user/blockAndunblock-friend/:id", blockAndunblockFriend);
}