import { registerAs } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export default registerAs('cors', (): CorsOptions => {
  const rawOrigins = process.env.CORS_ORIGINS;

  if (!rawOrigins || rawOrigins === '*') {
    return {
      origin: (origin, callback) => callback(null, origin ?? true),
      methods: 'GET,PUT,POST,DELETE,PATCH',
      allowedHeaders: 'Content-Type,Authorization',
      credentials: true,
    };
  }

  const origins = rawOrigins.split(',').map(origin => origin.trim());

  return {
    origin: origins,
    methods: 'GET,PUT,POST,DELETE,PATCH',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  };
});
