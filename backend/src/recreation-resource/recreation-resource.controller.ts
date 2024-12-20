import { Controller, Get, HttpException, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";

@ApiTags("recreation-resource")
@Controller({ path: "recreation-resource", version: "1" })
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
  ) {}

  @Get()
  findAll(): Promise<RecreationResourceDto[]> {
    return this.recreationResourceService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const recResource = await this.recreationResourceService.findOne(id);
    if (!recResource) {
      throw new HttpException("Recreation Resource not found.", 404);
    }
    return recResource;
  }
}
