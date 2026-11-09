import { Global, Module } from '@nestjs/common';

import { AuthService } from './auth.service';

@Global()
@Module({
  exports: [AuthService],
  providers: [AuthService],
})
export class AuthModule {}
