import { Injectable } from '@nestjs/common';
import { ExportDownloadQueryDto } from './dtos/export-download-query.dto';
import { ExportPreviewQueryDto } from './dtos/export-preview-query.dto';
import { ExportPreviewResponseDto } from './dtos/export-preview-response.dto';
import { ListExportDatasetsResponseDto } from './dtos/list-export-datasets-response.dto';
import { ALL_EXPORT_DATASETS } from './datasets';
import { ExportPreviewRow, ExportRepository } from './export.repository';

interface ExportDownloadResult {
  csv: string;
  fileName: string;
}

@Injectable()
export class ExportService {
  constructor(private readonly exportRepository: ExportRepository) {}

  listDatasets(): ListExportDatasetsResponseDto {
    return {
      datasets: ALL_EXPORT_DATASETS,
    };
  }

  async getPreview(
    query: ExportPreviewQueryDto,
  ): Promise<ExportPreviewResponseDto> {
    const rows = await this.exportRepository.getPreviewRows(query);
    const columns = this.getColumns(rows);

    return {
      columns,
      rows,
    };
  }

  async getDownload(
    query: ExportDownloadQueryDto,
  ): Promise<ExportDownloadResult> {
    const rows = await this.exportRepository.getDownloadRows(query);
    const columns = this.getColumns(rows);

    return {
      csv: this.buildCsv(columns, rows),
      fileName: this.buildDownloadFileName(query.dataset),
    };
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
