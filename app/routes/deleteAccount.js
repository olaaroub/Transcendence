const path = require('path');
const fs = require('fs');


async function deleteAccountHandler(req, reply)
{
    try
    {
        const id = req.params.id;
        const avatar = this.db.prepare(`SELECT profileImage FROM users WHERE id = ?`).get([id]);
        const avatarName = path.basename(avatar.profileImage);
        console.log(avatarName);
        if (avatarName != "Default_pfp.jpg")
            await fs.promises.unlink(path.join(__dirname, '../static', avatarName));
        this.db.prepare(`DELETE FROM users WHERE id = ?`).run([id]);
        reply.code(204).send({success: true});
    }
    catch (err) {
        console.log(err);
        reply.code(500).send({success: false});
    } 
}

async function deleteAccount(fastify)
{

    fastify.delete("/users/deleteAccount/:id", deleteAccountHandler);
}

module.exports = deleteAccount;