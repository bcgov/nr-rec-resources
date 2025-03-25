import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RecreationResourceService } from "src/recreation-resource/service/recreation-resource.service";
import { RecreationResourceSearchService } from "src/recreation-resource/service/search.service";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";
import { RecreationResourceImageSize } from "./dto/recreation-resource-image.dto";
import { ParseImageSizesPipe } from "./pipes/parse-image-sizes.pipe";
import { RecreationResourceDetailDto } from "./dto/recreation-resource.dto";

@ApiTags("recreation-resource")
@Controller({ path: "recreation-resource", version: "1" })
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
    private readonly recreationResourceSearchService: RecreationResourceSearchService,
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
  @ApiQuery({
    name: "type",
    required: false,
    type: String,
    description: "Recreation resource type",
  })
  @ApiQuery({
    name: "imageSizeCodes",
    required: false,
    default: "llc",
    enum: RecreationResourceImageSize,
    type: () => RecreationResourceImageSize,
    isArray: true,
    description:
      "Comma separated list of image sizes codes to be returned for the" +
      " recreation resource. You can pass a single status or multiple size codes " +
      "separated by commas. If nothing is passed in, only Landing Card (llc) sizes are returned",
  })
  @ApiQuery({
    name: "district",
    required: false,
    type: String,
    description: "Recreation district",
  })
  @ApiQuery({
    name: "access",
    required: false,
    type: String,
    description: "Recreation resource access type",
  })
  @ApiQuery({
    name: "facilities",
    required: false,
    type: String,
    description: "Recreation resource facilities",
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
    @Query("type") type?: string,
    @Query("district") district?: string,
    @Query("access") access?: string,
    @Query("facilities") facilities?: string,
  ): Promise<PaginatedRecreationResourceDto> {
    return await this.recreationResourceSearchService.searchRecreationResources(
      page,
      filter ?? "",
      limit ? parseInt(String(limit)) : undefined,
      activities,
      type,
      district,
      access,
      facilities,
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Find recreation resource by ID",
    operationId: "getRecreationResourceById",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiQuery({
    name: "imageSizeCodes",
    required: false,
    enum: RecreationResourceImageSize,
    type: () => RecreationResourceImageSize,
    isArray: true,
    description:
      "Comma separated list of image sizes codes to be returned for the " +
      "recreation resource. You can pass a single status or multiple size codes separated by commas.",
  })
  @ApiResponse({
    status: 200,
    description: "Resource found",
    type: RecreationResourceDetailDto,
  })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async findOne(
    @Param("id") id: string,
    @Query(
      "imageSizeCodes",
      new ParseImageSizesPipe([RecreationResourceImageSize.THUMBNAIL]),
    )
    imageSizeCodes?: RecreationResourceImageSize[],
  ): Promise<RecreationResourceDetailDto> {
    const recResource = await this.recreationResourceService.findOne(
      id,
      imageSizeCodes,
    );
    if (!recResource) {
      throw new HttpException("Recreation Resource not found.", 404);
    }
    return recResource;
  }
}
