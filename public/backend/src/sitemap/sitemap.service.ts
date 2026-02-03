import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

const STATIC_PAGES = ['/', '/contact', '/search'];

@Injectable()
export class SitemapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateSitemap(): Promise<string> {
    const baseUrl =
      this.configService.get<string>('PUBLIC_FRONTEND_BASE_URL') ||
      'https://www.sitesandtrailsbc.ca';

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

    for (const page of STATIC_PAGES) {
      xml += this.buildUrlEntry(`${baseUrl}${page}`);
    }

    for (const resource of resources) {
      const id = resource.rec_resource_id;
      const lastmod = resource.updated_at;
      xml += this.buildUrlEntry(`${baseUrl}/resource/${id}`, lastmod);
      xml += this.buildUrlEntry(`${baseUrl}/resource/${id}/contact`, lastmod);
    }

    xml += '</urlset>\n';

    return xml;
  }

  private buildUrlEntry(url: string, lastmod?: Date): string {
    let entry = '  <url>\n';
    entry += `    <loc>${this.escapeXml(url)}</loc>\n`;
    if (lastmod) {
      entry += `    <lastmod>${this.formatDate(lastmod)}</lastmod>\n`;
    }
    entry += '  </url>\n';
    return entry;
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatDate(date: Date): string {
    // Format date as YYYY-MM-DD (ISO 8601)
    return date.toISOString().split('T')[0];
  }
}
