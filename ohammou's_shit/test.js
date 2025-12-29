let lastMessages= [];

// req.log.info("Fetched last 50 messages for global chat");
lastMessages.push({sender_id: 0, username: "System", avatar_url: "/public/Default_pfp.jpg", msg: "Welcome to the global chat!", created_at: new Date().toISOString()});
lastMessages.push({sender_id: 0, username: "System", avatar_url: "/public/Default_pfp.jpg", msg: "Please be respectful and follow the community guidelines.", created_at: new Date().toISOString()});

lastMessages.reverse();

console.log(lastMessages);