
export async function getMessages(req, reply)
{
    const lastMessages = this.db.prepare(`SELECT 
                                            m.sender_id, u.username, u.avatar_url, m.msg, m.created_at
                                            FROM
                                                usersCash u INNER JOIN messages m ON u.id = m.sender_id
                                            ORDER BY m.created_at DESC
                                            LIMIT 50`).all();

    req.log.info("Fetched last 50 messages for global chat");
    return lastMessages;
}