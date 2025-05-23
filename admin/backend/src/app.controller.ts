import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import {
  AUTH_RST_ADMIN_ROLE,
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  ROLE_MODE,
} from "./auth";

@ApiTags("App")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
  @UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
  @AuthRoles([AUTH_RST_ADMIN_ROLE], ROLE_MODE.ALL)
  getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
