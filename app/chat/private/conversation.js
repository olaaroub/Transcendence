import db from "./db.js"

export function getOrCreateConversation(userA, userB)
{
    const convo = db.prepare
    (`
        SELECT id FROM conversation
        WHERE 
          (senderId = ? AND receiverId = ?)
        OR
          (senderId = ? AND receiverId = ?)
    `).get(userA, userB, userB, userA);

    if (convo)
        return convo.id;

    const result = db.prepare
    (`
        INSERT INTO conversation (senderId, receiverId)
        VALUES (?, ?)
    `).run(userA, userB);

    return result.lastInsertRowid;
}

export function sendMessage(conversationId, senderId, content)
{
    return db.prepare
    (`
        INSERT INTO message (conversationId, senderId, content)
        VALUES (?, ?, ?)
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

// Data Access Layer (DAL)