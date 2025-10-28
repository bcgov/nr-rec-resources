import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SitemapService } from './sitemap.service';

@ApiTags('sitemap')
@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({
    summary: 'Generate XML sitemap',
    operationId: 'getSitemap',
    description:
      'Returns an XML sitemap containing all public recreation resources and static pages for SEO purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'XML sitemap generated successfully',
    content: {
      'application/xml': {
        schema: {
          type: 'string',
          example:
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...</urlset>',
        },
      },
    },
  })
  async getSitemap(): Promise<string> {
    return this.sitemapService.generateSitemap();
  }
}
