import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RecreationResourceService } from "src/recreation-resource/service/recreation-resource.service";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";
import { RecreationResourceImageSize } from "./dto/recreation-resource-image.dto";
import { ParseImageSizesPipe } from "./pipes/parse-image-sizes.pipe";
import {
  RecreationResourceDetailDto,
  SiteOperatorDto,
} from "./dto/recreation-resource.dto";
import { FsaResourceService } from "./service/fsa-resource.service";

@ApiTags("recreation-resource")
@Controller({ path: "recreation-resource", version: "1" })
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
    private readonly fsaResourceService: FsaResourceService,
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
    return await this.recreationResourceService.searchRecreationResources(
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
      new ParseImageSizesPipe([RecreationResourceImageSize.HIGH_RES_PRINT]),
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

  @Get(":id/site-operator")
  @ApiOperation({
    summary: "Find site operator by resource ID",
    operationId: "getSiteOperatorById",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiResponse({
    status: 200,
    description: "Site operator found",
    type: SiteOperatorDto,
  })
  @ApiResponse({ status: 404, description: "Site operator not found" })
  async findSiteOperator(@Param("id") id: string): Promise<SiteOperatorDto> {
    try {
      const clientNumber =
        await this.recreationResourceService.findClientNumber(id);
      if (clientNumber)
        return await this.fsaResourceService.findByClientNumber(clientNumber);
      else return null;
    } catch (err) {
      throw new HttpException(err.response.data, err.status);
    }
  }
}
