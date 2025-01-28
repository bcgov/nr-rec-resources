import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";

@ApiTags("recreation-resource")
@Controller({ path: "recreation-resource", version: "1" })
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
  ) {}

  @ApiOperation({
    summary: "Search recreation resources",
    operationId: "searchRecreationResources",
  })
  @ApiQuery({
    name: "filter",
    required: false,
    type: String,
    description: "Search filter",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "activities",
    required: false,
    type: String,
    description: "Recreation activities",
  })
  @ApiResponse({
    status: 200,
    description: "Resources found",
    type: PaginatedRecreationResourceDto,
  })
  @Get("search") // it must be ahead Get(":id") to avoid conflict
  async searchRecreationResources(
    @Query("filter") filter: string = "",
    @Query("limit") limit?: number,
    @Query("page") page: number = 1,
    @Query("activities") activities?: string,
  ): Promise<PaginatedRecreationResourceDto> {
    const response =
      await this.recreationResourceService.searchRecreationResources(
        page,
        filter ?? "",
        limit ? parseInt(String(limit)) : undefined,
        activities,
      );

    return response;
  }

  @ApiOperation({
    summary: "Find recreation resource by ID",
    operationId: "getRecreationResourceById",
  })
  @ApiResponse({
    status: 200,
    description: "Resource found",
    type: RecreationResourceDto,
  })
  @ApiResponse({ status: 404, description: "Resource not found" })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<RecreationResourceDto> {
    const recResource = await this.recreationResourceService.findOne(id);
    if (!recResource) {
      throw new HttpException("Recreation Resource not found.", 404);
    }
    return recResource;
  }
}
