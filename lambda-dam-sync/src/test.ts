import { handler } from './index';

(async () => {
  const response = await handler({} as any, {} as any, () => {});
  console.log('Lambda response:', response);
})();
