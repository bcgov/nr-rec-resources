import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
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

  @Get("search") // it must be ahead Get(":id") to avoid conflict
  async searchRecreationResources(
    @Query("filter") filter: string = "",
    @Query("limit") limit?: number,
    @Query("page") page: number = 1,
  ) {
    const response =
      await this.recreationResourceService.searchRecreationResources(
        page,
        filter ?? "",
        limit ? parseInt(String(limit)) : undefined,
      );

    return response;
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
