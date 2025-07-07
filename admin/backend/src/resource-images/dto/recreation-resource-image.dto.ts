import { ApiProperty } from "@nestjs/swagger";
import { Length, Matches } from "class-validator";

/**
 * Enum representing available image size options for the recreation API
 */
export enum RecreationResourceImageSize {
  /** Original upload size */
  ORIGINAL = "original",

  /** Collection view thumbnail (100x75) */
  COLLECTION = "col",

  /** Content page header image (1110x740) */
  CONTENT_HEADER = "con",

  /** Content page link card image (377x251) */
  CONTENT_CARD = "pcs",

  /** High resolution print quality image (999999x999999) */
  HIGH_RES_PRINT = "hpr",

  /** Inline content image (788x525) */
  INLINE = "ili",

  /** Landing page header image (720x780) */
  LANDING_HEADER = "lan",

  /** Landing page link card image (630x380) */
  LANDING_CARD = "llc",

  /** Low resolution print image (1000x1000) */
  LOW_RES_PRINT = "lpr",

  /** Park photo gallery image (1734x1156) */
  GALLERY = "gal",

  /** Presentation slide image (1920x1080) */
  PRESENTATION = "ppp",

  /** Preview image (900x480) */
  PREVIEW = "pre",

  /** Search result image (525x394) */
  SEARCH = "rsr",

  /** RST thumbnail image (75x56) */
  RST_THUMB = "rth",

  /** Screen resolution image (1400x800) */
  SCREEN = "scr",

  /** Standard thumbnail image (175x175) */
  THUMBNAIL = "thm",
}

export class RecreationResourceImageVariantDto {
  @ApiProperty({
    description: "Size code of the image as defined in BCGov DAM",
    enum: RecreationResourceImageSize,
    example: RecreationResourceImageSize.ORIGINAL,
    externalDocs: {
      description: "Learn more about image size codes used (need admin access)",
      url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/pages/admin/admin_size_management.php",
    },
  })
  size_code: RecreationResourceImageSize;

  @ApiProperty({
    description: "Image URL",
    example: "https://example.com/image.jpg",
  })
  url: string;

  @ApiProperty({
    description: "Width of the image in pixels",
    example: 1920,
  })
  width: number;

  @ApiProperty({
    description: "Height of the image in pixels",
    example: 1080,
  })
  height: number;

  @ApiProperty({
    description: "File extension",
    example: "jpg",
  })
  extension: string;
}

export class RecreationResourceImageDto {
  @ApiProperty({
    description: "Reference ID for the image",
    example: "1000",
  })
  ref_id: string;

  @ApiProperty({
    description: "Image caption",
    example: "Scenic mountain view",
  })
  @Matches(/^[A-Za-z0-9 "'()#.&/]+$/, {
    message:
      "document title can only contain alphanumeric characters and spaces",
  })
  @Length(3, 100)
  caption: string;

  @ApiProperty({
    description: "Available image variants",
    type: [RecreationResourceImageVariantDto],
    required: false,
  })
  recreation_resource_image_variants?: RecreationResourceImageVariantDto[];
}

export class FileUploadDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "File to upload",
  })
  file: any;
}
