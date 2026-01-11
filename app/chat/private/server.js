import Fastify from "fastify";
import socketio from "fastify-socket.io";
import chatRoutes from "./routes/private_chat.js";
import vault from 'node-vault';
import fastifyMetrics from 'fastify-metrics';
import "./create_tables.js";
import db from "./db.js";

async function getSecrets(logger) {
  try {

    const vaultPath = process.env.VAULT_SECRET_PATH;

    const options = {
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.PRIVATE_CHAT_SERVICE_TOKEN
    };

    const vaultClient = vault(options);
    logger.info(`reading secrets from: ${vaultPath}`);
    const { data } = await vaultClient.read(vaultPath);
    return {
      jwtSecret: data.data.jwt_secret,
    };

  } catch (err) {
    logger.error({ msg: "CRITICAL: Error fetching secret from Vault", err: err });
    process.exit(1);
  }
}

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service_name: 'private-chat',
      environment: process.env.NODE_ENV || 'development'
    },

    redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password']
  }
});


await fastify.register(fastifyMetrics, {
  endpoint: '/metrics',
  defaultMetrics: { enabled: true }
});

const chatMessageCounter = new fastify.metrics.client.Counter({
  name: 'chat_message_sent_total',
  help: 'Total number of messages sent',
  labelNames: ['chat_type']
})

fastify.decorate('customMetrics', {
  chatMessageCounter,
});

fastify.cust

fastify.get("/", async () => {
  return { status: "ok" };
});

// fastify.register(socketio, {cors: { origin: "*" }}); //dialk
// fastify.register(chatRoutes);

async function start() { // hadchi zdto fhad function wdrt lih try catch 7it DARORI IKHDM HADCHI HOW LWL, ila mat799atch chi 7aja khas exiti process (unhandled erros ayrj3o lina project)

  try {
    fastify.log.info("private chat service is starting...");

    const { jwtSecret } = await getSecrets(fastify.log);
    fastify.log.info("Secrets fetched successfully");


    // Hadchi aykhsek mn b3d, ---SWEL OHAMMOU---, (tat checki bih token li taysift lik simo fl headers.....)
    /*
    await fastify.register(fastifyJwt, {
        secret: jwtSecret
    });
    */

    // zid had line fl blasa fin tatconnecti b database
    // fastify.log.info({ dbPath: process.env.DATABASE_PATH }, "Database connected successfully");


    await fastify.register(socketio, {
        cors: { origin: "*", methods: ["GET", "POST", "DELETE"] },
        path: '/api/chat/private/socket.io' // by simo
      });
      await fastify.register(chatRoutes); // khsek tzid {prefix: '/api'} hnaya (ta checki m3a ohammou)

      await fastify.delete('/api/chat/private/user/:id', async (req, res) =>
      {
        const id = req.params.id;

          try {
              db.prepare('DELETE FROM conversation WHERE (senderId = ? OR receiverId = ?)').run(id, id);
              res.code(200).send({message: "user deleted", ok: true})
          } catch(err)
          {
            // req.log.error
            console.log(err);
            res.code(500).send({message: "you can not delete user conversadtion", ok: false})
          }
      })

    fastify.listen({
      port: process.env.PORT,
      host: process.env.HOST
    });

  } catch (err) {
    fastify.log.error({ msg: "Starting failed", err: err });
    process.exit(1);
  }
}

start();

//dialk
/* fastify.listen({ port: 8405 }, (err) =>
 {
   if (err)
   {
     fastify.log.error(err);
     process.exit(1);
   }
   console.log("Server running on http://localhost:8405");
 });


 curl -X POST http://localhost:8405/conversation \
   -H "Content-Type: application/json" \
   -d '{"userA":1,"userB":2}'
*/
