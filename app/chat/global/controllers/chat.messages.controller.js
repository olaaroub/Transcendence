
export async function getMessages(req, reply)
{
    let lastMessages = this.db.prepare(`SELECT 
                                            m.sender_id, u.username, u.avatar_url, m.msg, m.created_at
                                            FROM
                                                usersCash u INNER JOIN messages m ON u.id = m.sender_id
                                            ORDER BY m.created_at DESC
                                            LIMIT 50`).all();

    req.log.info("Fetched last 50 messages for global chat");
    lastMessages += {sender_id: 0, username: "System", avatar_url: "/public/Default_pfp.jpg", msg: "Welcome to the global chat!", created_at: new Date().toISOString()};
    lastMessages += {sender_id: 0, username: "System", avatar_url: "/public/Default_pfp.jpg", msg: "Please be respectful and follow the community guidelines.", created_at: new Date().toISOString()};
    
    lastMessages.reverse();
    return lastMessages;
}