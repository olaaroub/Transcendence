import Fastify from 'fastify';

async function main()
{
  const fastify = Fastify({ logger: false });

  try {
      fastify.listen({
      port: process.env.PORT || 3002,
        host: process.env.HOST || '0.0.0.0'
      });
      console.log(`Server listening on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3002}`);
  } catch (err) {
      fastify.log.error(err)
      process.exit(1)
  }
}

main();