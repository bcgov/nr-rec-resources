import { ClsModuleOptions } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

export const clsConfig: ClsModuleOptions = {
  global: true,
  middleware: {
    mount: true,
    generateId: true,
    idGenerator: () => uuidv4(),
    setup: (cls, req) => {
      // Store request method and URL for logging context
      cls.set('requestMethod', req.method);
      cls.set('requestUrl', req.url);
      cls.set('userAgent', req.headers['user-agent']);
    },
  },
};
