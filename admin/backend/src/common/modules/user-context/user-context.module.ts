import { Global, Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';

@Global()
@Module({
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule {}
