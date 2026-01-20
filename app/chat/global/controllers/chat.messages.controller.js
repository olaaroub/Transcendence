
export async function getMessages(req)
{
    let lastMessages = this.db.prepare(`SELECT
                                            m.sender_id, u.username, u.avatar_url, m.msg, m.created_at
                                            FROM
                                                usersCash u INNER JOIN messages m ON u.id = m.sender_id
                                            ORDER BY m.created_at DESC
                                            LIMIT 50`).all();

    req.log.info("Fetched last 50 messages for global chat");

    lastMessages.push({sender_id: 0, username: "System", avatar_url: "/public/default_pfp.png", msg: "Welcome to the Global Chat.\nPlease be respectful and tolerant of other users.", created_at: new Date().toISOString()});

    return lastMessages;
}