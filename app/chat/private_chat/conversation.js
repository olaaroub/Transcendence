import db from "./db.js"

export function getOrCreateConversation(userA, userB)
{
    const convo = db.prepare
    (`
        SELECT id FROM conversation
        WHERE 
          (sender_id = ? AND receiver_id = ?)
        OR
          (sender_id = ? AND receiver_id = ?)
    `).get(userA, userB, userB, userA);

    if (convo)
        return convo.id;

    const result = db.prepare
    (`
        INSERT INTO conversation (sender_id, receiver_id)
        VALUES (?, ?)
    `).run(userA, userB);

    return result.lastInsertRowid;
}

export function sendMessage(conversationId, senderId, content)
{
    return db.prepare
    (`
        INSERT INTO message (conversation_id, sender_id, content)
        VALUES (?, ?, ?)
    `).run(conversationId, senderId, content);
}

export function getMessages(conversationId, limit = 20, offset = 0)
{
    return db.prepare(`
        SELECT * FROM message
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT ? OFFSET ?
    `).all(conversationId, limit, offset);
}

// Data Access Layer (DAL)