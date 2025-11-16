const path = require('path');
const fs = require('fs');


async function deleteAccountHandler(req, reply)
{
    try
    {
        const id = req.params.id;
        const avatar = await this.db.get(`SELECT profileImage FROM infos WHERE user_id = ?`, [id]);
        const avatarName = path.basename(avatar.profileImage);
        if (avatarName != `Default_pfp.jpg`);
            await fs.promises.unlink(path.join(__dirname, '../static', avatarName));
        await this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
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