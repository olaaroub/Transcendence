import Fastify from "fastify";
import chatRoutes from "./routes/private_chat.js";

const fastify = Fastify({ logger: true });

fastify.get("/", async () =>
{
  return { status: "ok" };
});

fastify.register(chatRoutes);

fastify.listen({ port: 8405 }, (err) =>
{
  if (err)
  {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Server running on http://localhost:8405");
});


// curl -X POST http://localhost:8405/conversation \
//   -H "Content-Type: application/json" \
//   -d '{"userA":1,"userB":2}'
