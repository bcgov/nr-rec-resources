import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { UserContextService } from './user-context.service';

@Global()
@Module({
  imports: [ClsModule],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule {}
