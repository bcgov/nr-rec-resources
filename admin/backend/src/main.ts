import { NestExpressApplication } from '@nestjs/platform-express';
import { bootstrap } from "./app";
import { Logger } from '@nestjs/common';
const logger = new Logger("NestApplication");

bootstrap()
  .then(async (app: NestExpressApplication) => {
    await app.listen(process.env.PORT || 8001);
    logger.log(`Listening on ${await app.getUrl()}`);
    logger.log(`Process start up took ${process.uptime()} seconds`);
    return app;
  })
  .catch((err) => {
    logger.error(err);
  });
