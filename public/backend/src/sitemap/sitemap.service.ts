import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SitemapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateSitemap(): Promise<string> {
    const baseUrl =
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'https://beta.sitesandtrailsbc.ca';

    const resources = await this.prisma.recreation_resource.findMany({
      where: {
        display_on_public_site: true,
      },
      select: {
        rec_resource_id: true,
        updated_at: true,
      },
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const staticPages = ['/', '/contact', '/search'];
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += '  </url>\n';
    }

    for (const resource of resources) {
      // /resource/{rec_resource_id} page
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/resource/${this.escapeXml(resource.rec_resource_id)}</loc>\n`;
      if (resource.updated_at) {
        xml += `    <lastmod>${this.formatDate(resource.updated_at)}</lastmod>\n`;
      }
      xml += '  </url>\n';

      // /resource/{rec_resource_id}/contact page
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/resource/${this.escapeXml(resource.rec_resource_id)}/contact</loc>\n`;
      if (resource.updated_at) {
        xml += `    <lastmod>${this.formatDate(resource.updated_at)}</lastmod>\n`;
      }
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return xml;
  }

  private formatDate(date: Date): string {
    // Format date as YYYY-MM-DD (ISO 8601)
    return date.toLocaleDateString('en-CA');
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
