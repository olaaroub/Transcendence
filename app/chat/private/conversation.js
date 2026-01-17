import db from "./db.js"

export function getOrCreateConversation(userA, userB)
{
    const convo = db.prepare(`
        SELECT id FROM conversation
        WHERE
          (senderId = ? AND receiverId = ?)
        OR
          (senderId = ? AND receiverId = ?)
    `).get(userA, userB, userB, userA);

    if (convo)
        return convo.id;

    const result = db.prepare(`
        INSERT INTO conversation (senderId, receiverId)
        VALUES (?, ?)
    `).run(userA, userB);

    return result.lastInsertRowid;
}

export function sendMessage(conversationId, senderId, content)
{
    return db.prepare(`
        INSERT INTO message (conversationId, senderId, content, seen)
        VALUES (?, ?, ?, 0)
    `).run(conversationId, senderId, content);
}

export function getMessages(conversationId, limit = 20, offset = 0)
{
    return db.prepare(`
        SELECT * FROM
        (
            SELECT * FROM message
            WHERE conversationId = ?
            ORDER BY createdAt DESC
            LIMIT ? OFFSET ?
        ) ORDER BY createdAt ASC
    `).all(conversationId, limit, offset);
}

export function markMessagesAsSeen(conversationId, receiverId)
{
    return db.prepare(`
        UPDATE message
        SET seen = 1
        WHERE conversationId = ? AND senderId != ? AND seen = 0
    `).run(conversationId, receiverId);
}

export function markMessageAsSeen(messageId)
{
    return db.prepare(`
        UPDATE message
        SET seen = 1
        WHERE id = ? AND seen = 0
    `).run(messageId);
}

export function getUnreadCount(conversationId, userId)
{
    const result = db.prepare(`
        SELECT COUNT(*) as count FROM message
        WHERE conversationId = ? AND senderId != ? AND seen = 0
    `).get(conversationId, userId);
    return result.count;
}

export function getUnreadCountsForUser(userId)
{
    return db.prepare(`
        SELECT
            c.id as conversationId,
            CASE
                WHEN c.senderId = ? THEN c.receiverId
                ELSE c.senderId
            END as friendId,
            COUNT(m.id) as unreadCount
        FROM conversation c
        LEFT JOIN message m ON m.conversationId = c.id
            AND m.senderId != ?
            AND m.seen = 0
        WHERE c.senderId = ? OR c.receiverId = ?
        GROUP BY c.id
        HAVING unreadCount > 0
    `).all(userId, userId, userId, userId);
}

export function getFriendIdFromConversation(conversationId, userId)
{
    const result = db.prepare(`
        SELECT
            CASE
                WHEN senderId = ? THEN receiverId
                ELSE senderId
            END as friendId
        FROM conversation
        WHERE id = ?
    `).get(userId, conversationId);
    return result ? result.friendId : null;
}
