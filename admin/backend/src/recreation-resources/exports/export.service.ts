import { Injectable } from '@nestjs/common';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { isIdirViewerOnly } from '@/auth/sensitive-fields.interceptor';
import { ExportDownloadQueryDto } from './dtos/export-download-query.dto';
import { ExportPreviewQueryDto } from './dtos/export-preview-query.dto';
import { ExportPreviewResponseDto } from './dtos/export-preview-response.dto';
import { ListExportDatasetsResponseDto } from './dtos/list-export-datasets-response.dto';
import { ALL_EXPORT_DATASETS } from './datasets';
import { ExportPreviewRow, ExportRepository } from './export.repository';

/**
 * CSV export columns that must not be visible to IDIR viewer-only users.
 * CLIENT_NUMBER contains agreement holder identity information.
 * ESTIMATED_REPAIR_COST is a financial field restricted to higher roles.
 * TODO: Confirm with the ticket whether AGREEMENT_START_DATE / AGREEMENT_END_DATE
 *       should also be redacted for IDIR viewers.
 */
const VIEWER_REDACTED_COLUMNS = new Set([
  'CLIENT_NUMBER',
  'ESTIMATED_REPAIR_COST',
]);

interface ExportDownloadResult {
  csv: string;
  fileName: string;
}

@Injectable()
export class ExportService {
  constructor(
    private readonly exportRepository: ExportRepository,
    private readonly userContext: UserContextService,
  ) {}

  // ...existing code...

  listDatasets(): ListExportDatasetsResponseDto {
    return {
      datasets: ALL_EXPORT_DATASETS,
    };
  }

  async getPreview(
    query: ExportPreviewQueryDto,
  ): Promise<ExportPreviewResponseDto> {
    const rows = await this.exportRepository.getPreviewRows(query);
    const redacted = this.redactRowsForCurrentUser(rows);
    const columns = this.getColumns(redacted);

    return {
      columns,
      rows: redacted,
    };
  }

  async getDownload(
    query: ExportDownloadQueryDto,
  ): Promise<ExportDownloadResult> {
    const rows = await this.exportRepository.getDownloadRows(query);
    const redacted = this.redactRowsForCurrentUser(rows);
    const columns = this.getColumns(redacted);

    return {
      csv: this.buildCsv(columns, redacted),
      fileName: this.buildDownloadFileName(query.dataset),
    };
  }

  /**
   * Removes columns that IDIR viewer-only users are not allowed to see.
   * For other roles the rows are returned unchanged.
   */
  private redactRowsForCurrentUser(
    rows: ExportPreviewRow[],
  ): ExportPreviewRow[] {
    let roles: string[] = [];
    try {
      roles = this.userContext.getCurrentUser().client_roles ?? [];
    } catch {
      // Unauthenticated – guard will handle it; return rows as-is.
      return rows;
    }

    if (!isIdirViewerOnly(roles)) {
      return rows;
    }

    return rows.map((row) => {
      const filtered: ExportPreviewRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (!VIEWER_REDACTED_COLUMNS.has(key)) {
          filtered[key] = value;
        }
      }
      return filtered;
    });
  }

  private getColumns(rows: ExportPreviewRow[]): string[] {
    return rows[0] ? Object.keys(rows[0]) : [];
  }

  private buildCsv(columns: string[], rows: ExportPreviewRow[]): string {
    if (columns.length === 0) {
      return '';
    }

    const csvRows = [
      columns,
      ...rows.map((row) => columns.map((column) => row[column])),
    ];

    return csvRows
      .map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(','))
      .join('\r\n');
  }

  private buildDownloadFileName(dataset: string): string {
    const dateStamp = new Date().toISOString().slice(0, 10);
    return `${dataset}-${dateStamp}.csv`;
  }

  private escapeCsvCell(value: string | null | undefined): string {
    const normalized = this.escapeSpreadsheetFormula(value ?? '');
    const escaped = normalized.replace(/"/g, '""');

    if (/[",\r\n]/.test(normalized)) {
      return `"${escaped}"`;
    }

    return escaped;
  }

  private escapeSpreadsheetFormula(value: string): string {
    // Prevent spreadsheet apps from interpreting exported cells as formulas.
    if (/^[=+\-@]/.test(value)) {
      return `'${value}`;
    }

    return value;
  }
}
