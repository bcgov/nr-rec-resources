import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { RecreationResourceAdvisoryDto } from './dto/recreation-resource-advisory.dto';

@Injectable()
export class AdvisoriesService {
  private readonly logger = new Logger(AdvisoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAdvisoriesByRecResourceId(
    rec_resource_id: string,
  ): Promise<RecreationResourceAdvisoryDto[]> {
    this.logger.log(
      `Fetching advisories for rec_resource_id: ${rec_resource_id}`,
    );

    const results = await this.prisma.act_advisories_flat.findMany({
      where: { rec_resource_id },
      orderBy: [
        { listing_rank: 'desc' },
        { urgency_sequence: 'desc' },
        { access_status_precedence: 'asc' },
        { updated_date: 'desc' },
        { advisory_date: 'desc' },
        { event_type_precedence: 'asc' },
      ],
      select: {
        advisory_number: true,
        event_type: true,
        access_status_name: true,
        advisory_status: true,
        urgency: true,
        advisory_date: true,
        effective_date: true,
        end_date: true,
        expiry_date: true,
        updated_date: true,
        published_at: true,
        submitted_by: true,
        is_advisory_date_displayed: true,
        is_effective_date_displayed: true,
        is_end_date_displayed: true,
        is_updated_date_displayed: true,
      },
    });

    return results.map((r) => ({
      advisory_number: r.advisory_number,
      event_type: r.event_type,
      access_status_name: r.access_status_name,
      advisory_status: r.advisory_status,
      urgency: r.urgency,
      advisory_date: r.advisory_date,
      effective_date: r.effective_date,
      end_date: r.end_date,
      expiry_date: r.expiry_date,
      updated_date: r.updated_date,
      published_at: r.published_at,
      submitted_by: r.submitted_by,
      is_advisory_date_displayed: r.is_advisory_date_displayed,
      is_effective_date_displayed: r.is_effective_date_displayed,
      is_end_date_displayed: r.is_end_date_displayed,
      is_updated_date_displayed: r.is_updated_date_displayed,
    }));
  }
}
