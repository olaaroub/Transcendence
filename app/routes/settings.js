

async function change_username(req, reply)
{
    const id = req.params.id;
    const body = req.body;
    console.log(body.username);
    try {
        await this.db.run("UPDATE users SET username = ? WHERE id = ?", [body.username, id]);
        reply.code(200).send({ message: "updating successfly username", success: true });
    } catch {
        reply.code(500).code({ message: "Error updating username", success: false });
    }
}

async function change_bio(req, reply)
{
    const id = req.params.id;
    const body = req.body;
    try {
        await this.db.run("UPDATE infos SET bio = ? WHERE id = ?", [body.bio, id]);
        reply.code(200).send({ message: "updating successfly bio", success: true });
    } catch {
        reply.code(500).code({ message: "Error updating bio", success: false });
    }    
}

async function change_password(req, reply)
{
    const id = req.params.id;
    const body = req.body;
    try {
        await this.db.run("UPDATE users SET password = ? WHERE id = ?", [body.password, id]);
        reply.code(200).send({ message: "updating successfly password", success: true });
    } catch {
        reply.code(500).code({ message: "Error updating password", success: false });
    }   
}

async function getProfileData(req, reply)
{
    try {
        const id = req.params.id;
        const responceData = await this.db.get(`SELECT users.id, users.email, users.username, infos.profileImage,infos.bio
                                                FROM users
                                                INNER JOIN infos ON users.id = infos.user_id
                                                WHERE users.id = ?`, [id]);
        // console.log(responceData);
        reply.code(200).send(responceData);
    } catch (err)
    {
        reply.code(500).send({success: false, message: "can't getProfileData"});
    }
}

function settingsRoutes(fastify) 
{
    fastify.put("/users/:id/settings-username", change_username);
    fastify.put("/users/:id/setting-bio", change_bio);
    fastify.put("/users/:id/change-password", change_password);
    fastify.get("/users/:id/profile", getProfileData);
}


module.exports = settingsRoutes;