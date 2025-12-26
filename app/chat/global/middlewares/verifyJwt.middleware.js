import createError from 'http-errors';

export async function JwtHandler(request, reply) {
  try {

    const payload = await request.jwtVerify();

    request.userId = payload.id;
    request.username = payload.username;

    request.log.debug({ userId: payload.id, username: payload.username }, "JWT Verified");
  }
  catch (err) {
    request.log.warn("Unauthorized access attempt (Invalid or missing token)");
    // throw createError.Unauthorized("Invalid or missing token");
  }
}