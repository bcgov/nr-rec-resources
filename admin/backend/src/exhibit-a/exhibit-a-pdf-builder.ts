import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import {
  ExhibitAPageOrientation,
  ExhibitAPageSize,
} from './dto/generate-exhibit-a.dto';

type Rect = { x: number; y: number; width: number; height: number };
type XY = [number, number];

export type ExhibitAPdfHeader = {
  submission_id: string;
  application_guid: string;
  title: string | null;
  forest_region: string | null;
  forest_district: string | null;
  district_name: string | null;
  mgt_unit_type: string | null;
  mgt_unit_number: string | null;
  drawn_by: string | null;
  project_type?: string | null;
  tsa?: string | null;
  submission_date?: Date | string | null;
  utm_zone?: number | null;
  utm_easting?: number | null;
  utm_northing?: number | null;
  area_ha?: number | null;
  width_m?: number | null;
  length_km?: number | null;
};

/** One section: its length and start (PofC) / end (PofT) points in UTM metres. */
export type ExhibitAPdfCoordinateRow = {
  pointId: string;
  lengthKm?: number | null;
  pofc?: XY | null;
  poft?: XY | null;
};

export type ExhibitAPdfLayoutInput = {
  submissionId: string;
  header: ExhibitAPdfHeader;
  pageSize: ExhibitAPageSize;
  pageOrientation: ExhibitAPageOrientation;
  scale: number;
};

const ANSI_PAGE_INCHES: Record<ExhibitAPageSize, XY> = {
  A: [8.5, 11],
  B: [11, 17],
  C: [17, 22],
  D: [22, 34],
  E: [34, 44],
};

const ASSET_DIRS = [
  fileURLToPath(new URL('./assets/', import.meta.url)),
  ...[
    'src/exhibit-a/assets',
    'dist/exhibit-a/assets',
    'dist/admin/backend/src/exhibit-a/assets',
    'admin/backend/dist/exhibit-a/assets',
    'admin/backend/dist/admin/backend/src/exhibit-a/assets',
    'frontend/public/images',
    'frontend/public/images/exhibit-A',
    'admin/frontend/public/images/exhibit-A',
    '../frontend/public/images',
    '../frontend/public/images/exhibit-A',
  ].map((d) => resolve(process.cwd(), d)),
];

/** Header labels drawn in bold; the value after the label stays regular. */
const BOLD_LABELS = [
  'Submission ID:',
  'Natural Resource District:',
  'Recreation District',
  'MAP PROJ:',
  'Project Type:',
  'AREA (Ha):',
  'WIDTH (m):',
  'LENGTH (km):',
  'Drawn By:',
  'Date:',
  'Map Sheet:',
];

const BLACK = rgb(0, 0, 0);
const BORDER = 0.35;
const MARGIN = 14;
const GAP = 6;
const TITLE_H = 50;
const TITLE_SIZE = 16;
const MIN_ROW_H = 18;
const SIZE = 6.2; // header cell font size
const MAP_OF_SIZE = SIZE + 2.4;
const LINE_GAP = 1.1;
const PAD_X = 4;
const PAD_Y = 2;
const LIST_MAX_FONT = 6; // section list font range (pt)
const LIST_MIN_FONT = 4;
const LIST_MIN_FONT_PORTRAIT = 3.4;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const fmtDate = (d?: Date | string | null) => {
  const date = d ? new Date(d) : null;
  return date && !Number.isNaN(+date) ? date.toLocaleDateString('en-CA') : '';
};

/** Collapses whitespace; swaps glyphs Helvetica can't encode (avoids crashes). */
const makeClean = (font: PDFFont) => {
  const ok = new Set(font.getCharacterSet());
  return (s?: string | null) =>
    [
      ...(s ?? '')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\s+/g, ' ')
        .trim(),
    ]
      .map((c) => (ok.has(c.codePointAt(0)!) ? c : '?'))
      .join('');
};

/** Word-wraps to maxW. Words wider than maxW are broken by character. Nothing is dropped. */
function wrap(font: PDFFont, text: string, size: number, maxW: number) {
  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= maxW;
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(' ').filter(Boolean)) {
    if (fits(cur ? `${cur} ${word}` : word)) {
      cur = cur ? `${cur} ${word}` : word;
      continue;
    }
    if (cur) lines.push(cur);
    cur = '';
    for (const ch of word) {
      if (cur && !fits(cur + ch)) {
        lines.push(cur);
        cur = ch;
      } else cur += ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

const pointNo = (id: string) => Number(id.match(/\d+/)?.[0] ?? Infinity);

/** Numeric part first (Infinity-Infinity is NaN, which falls through to the name compare). */
const sortCoordinateRows = (rows: ExhibitAPdfCoordinateRow[]) =>
  [...rows].sort(
    (a, b) =>
      pointNo(a.pointId) - pointNo(b.pointId) ||
      a.pointId.localeCompare(b.pointId, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
  );

/** PNG or JPG, detected from magic bytes. */
function embedImage(pdf: PDFDocument, b: Buffer) {
  if (b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG')
    return pdf.embedPng(b);
  if (b[0] === 0xff && b[1] === 0xd8) return pdf.embedJpg(b);
  throw new Error('Unsupported Exhibit A image format. Expected PNG or JPG.');
}

/** Draws img scaled to fit maxW x maxH, centred inside `within`. */
function drawCentered(
  page: PDFPage,
  img: PDFImage,
  within: Rect,
  maxW: number,
  maxH: number,
) {
  const { width, height } = img.scaleToFit(maxW, maxH);
  page.drawImage(img, {
    width,
    height,
    x: within.x + (within.width - width) / 2,
    y: within.y + (within.height - height) / 2,
  });
}

export class ExhibitAPdfBuilder {
  private readonly assetCache = new Map<string, Buffer>();

  /**
   * Size (pt) of the map box for this page/header. The service uses it to
   * request a map image with exactly the same aspect ratio and ground
   * coverage, so the printed scale is true and nothing is cropped or stretched.
   */
  async measureMap(input: ExhibitAPdfLayoutInput) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const { mapRect } = this.computeLayout(font, input);
    return { widthPt: mapRect.width, heightPt: mapRect.height };
  }

  async build(
    input: ExhibitAPdfLayoutInput & {
      mapImageBytes: Buffer;
      coordinateRows: ExhibitAPdfCoordinateRow[];
    },
  ): Promise<Buffer> {
    const { header: h } = input;
    const coords = sortCoordinateRows(input.coordinateRows);
    const total = coords.length;
    const isPortrait =
      input.pageOrientation === ExhibitAPageOrientation.Portrait;
    const listLineHeight = (size: number) => size * (isPortrait ? 1.15 : 1.25);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const clean = makeClean(font);
    const asset = (name: string) => embedImage(pdf, this.asset(name));
    const [mapImg, logo, legend, arrow] = await Promise.all([
      embedImage(pdf, input.mapImageBytes),
      asset('rst_logo.png'),
      asset('legend.jpg'),
      asset('north_arrow4.jpg'),
    ]);

    const {
      W,
      H,
      outer,
      headerRect,
      mapRect,
      sideRect,
      headerH,
      rows,
      natural,
      extra,
    } = this.computeLayout(font, input);
    const mapW = mapRect.width;

    // ---- drawing primitives ----
    const text = (
      p: PDFPage,
      t: string,
      x: number,
      y: number,
      size = 7,
      f = font,
    ) => t && p.drawText(t, { x, y, size, font: f });
    const textCentered = (
      p: PDFPage,
      t: string,
      cx: number,
      y: number,
      size: number,
      f = font,
    ) => text(p, t, cx - f.widthOfTextAtSize(t, size) / 2, y, size, f);
    const line = (p: PDFPage, x1: number, y1: number, x2: number, y2: number) =>
      p.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness: BORDER,
      });
    const hLine = (p: PDFPage, r: Rect, y: number) =>
      line(p, r.x, y, r.x + r.width, y);
    const box = (p: PDFPage, r: Rect) =>
      p.drawRectangle({ ...r, borderColor: BLACK, borderWidth: BORDER });

    // ---- section list ----
    const zone = h.utm_zone ?? '';
    const xy = (p: XY, sep: string) =>
      `${Math.round(p[0])}${sep}${Math.round(p[1])}`;

    /** "1 (1.235 Km)" + compact (portrait) or verbose (landscape) PofC / PofT lines. */
    const entryLines = (
      k: ExhibitAPdfCoordinateRow,
      size: number,
      maxW: number,
    ) => {
      const section = `${k.pointId}${k.lengthKm != null ? ` (${+k.lengthKm.toFixed(3)} Km)` : ''}`;
      const detail = isPortrait
        ? [
            (k.pofc || k.poft) &&
              `UTM${zone} ${[
                k.pofc && `C ${xy(k.pofc, ',')}`,
                k.poft && `T ${xy(k.poft, ',')}`,
              ]
                .filter(Boolean)
                .join('  ')}`,
          ]
        : [
            k.pofc && `PofC UTM${zone} ${xy(k.pofc, ', ')}`,
            k.poft && `PofT UTM${zone} ${xy(k.poft, ', ')}`,
          ];
      return [section, ...detail]
        .filter((t): t is string => !!t)
        .flatMap((t) => wrap(font, clean(t), size, maxW));
    };

    /** Flows entries through `cols` columns inside r; returns next unrendered index. */
    const flow = (
      p: PDFPage,
      r: Rect,
      start: number,
      cols: number,
      size: number,
      lh: number,
      dry = false,
    ) => {
      const colW = r.width / cols;
      const top = r.y + r.height - size;
      let i = start;
      for (let c = 0; c < cols && i < total; c++) {
        let y = top;
        for (; i < total; i++) {
          const lines = entryLines(coords[i]!, size, colW - 8);
          if (y < top && y - (lines.length - 1) * lh < r.y) break; // next column
          for (const l of lines) {
            if (!dry) text(p, l, r.x + c * colW + 4, y, size);
            y -= lh;
          }
        }
      }
      return i;
    };

    /** Scale bar from the real print scale: 1 pt on paper = scale * 0.0254 / 72 m on the ground. */
    const scaleBar = (p: PDFPage, r: Rect) => {
      const mPerPt = (input.scale * 0.0254) / 72;
      const target = r.width * 0.2 * mPerPt;
      const pow = 10 ** Math.floor(Math.log10(target));
      const metres =
        [5, 2, 1].map((m) => m * pow).find((v) => v <= target) ?? pow;
      const w = metres / mPerPt;
      const x = r.x + 12;
      const y = r.y + 12;
      p.drawRectangle({
        x: x - 6,
        y: y - 6,
        width: w + 54,
        height: 22,
        color: rgb(1, 1, 1),
      });
      line(p, x, y, x + w, y);
      line(p, x, y, x, y + 5);
      line(p, x + w, y, x + w, y + 5);
      text(
        p,
        metres >= 1000 ? `${+(metres / 1000).toFixed(2)} km` : `${metres} m`,
        x + w + 5,
        y - 1,
      );
    };

    // ---- Page 1: frame ----
    const page = pdf.addPage([W, H]);
    [outer, mapRect, sideRect].forEach((r) => box(page, r));

    // ---- Title band: logo + centred "EXHIBIT A" ----
    const titleBandY = headerRect.y + headerH - TITLE_H;
    const lg = logo.scaleToFit(Math.min(mapW * 0.34, 170), TITLE_H - 8);
    page.drawImage(logo, {
      ...lg,
      x: outer.x + 6,
      y: titleBandY + (TITLE_H - lg.height) / 2,
    });
    // pdf-lib draws from the baseline, so offset by half the cap height.
    const capH = bold.heightAtSize(TITLE_SIZE, { descender: false });
    textCentered(
      page,
      'EXHIBIT A',
      W / 2,
      titleBandY + (TITLE_H - capH) / 2,
      TITLE_SIZE,
      bold,
    );

    // ---- Metadata grid ----
    const meta: Rect = {
      x: mapRect.x,
      y: headerRect.y,
      width: mapW,
      height: headerH - TITLE_H,
    };
    box(page, meta);
    let top = meta.y + meta.height;
    rows.forEach((row, ri) => {
      const rh = natural[ri]! + extra;
      if (ri) hLine(page, meta, top);
      row.cells.forEach((lines, ci) => {
        const cellX = meta.x + row.w * ci;
        const x = cellX + PAD_X;
        if (ci) line(page, cellX, top - rh, cellX, top);

        const items = lines.map((t) => {
          const mapOf = t.startsWith('MAP OF:');
          // The bold part: whole line for the title, else the matching label.
          const label = mapOf
            ? t
            : (BOLD_LABELS.find((p) => t.startsWith(p)) ?? '');
          return { t, label, size: mapOf ? MAP_OF_SIZE : SIZE, mapOf };
        });
        const contentH =
          items.reduce((sum, i) => sum + i.size, 0) +
          (items.length - 1) * LINE_GAP;
        let y = items.some((i) => i.mapOf)
          ? top - (rh - contentH) / 2 - items[0]!.size
          : top - PAD_Y - SIZE;

        for (const { t, label, size } of items) {
          text(page, label, x, y, size, bold);
          text(
            page,
            t.slice(label.length),
            x + bold.widthOfTextAtSize(label, size),
            y,
            size,
          );
          y -= size + LINE_GAP;
        }
      });
      top -= rh;
    });

    drawCentered(
      page,
      arrow,
      {
        x: sideRect.x + 2,
        y: titleBandY + 2,
        width: sideRect.width - 4,
        height: TITLE_H - 4,
      },
      sideRect.width - 8,
      TITLE_H - 8,
    );
    drawCentered(page, mapImg, mapRect, mapW - 4, mapRect.height - 4);
    scaleBar(page, mapRect);

    // ---- Sidebar: legend + section list ----
    const lr: Rect = {
      x: sideRect.x + 4,
      y: sideRect.y + 4,
      width: sideRect.width - 8,
      height: titleBandY - (sideRect.y + 4),
    };
    const legendTitleY = lr.y + lr.height - 20;
    // Legend only takes the height its image needs at sidebar width;
    // everything else goes to the section list.
    const legendNeeded = Math.min(
      legend.height * ((lr.width - 6) / legend.width) + 6,
      lr.height * (isPortrait ? 0.32 : 0.45),
    );
    const coordH = Math.max(120, lr.height - 20 - legendNeeded);
    const legendH = legendTitleY - lr.y - coordH;
    box(page, lr);
    hLine(page, lr, legendTitleY);
    hLine(page, lr, lr.y + coordH);
    textCentered(page, 'Legend', lr.x + lr.width / 2, legendTitleY + 5, 10);
    drawCentered(
      page,
      legend,
      { x: lr.x, y: lr.y + coordH, width: lr.width, height: legendH },
      lr.width - 6,
      legendH - 6,
    );

    let ty = lr.y + coordH - 16;
    const caption = clean(`${h.mgt_unit_number || 'REC'} (${total} sections)`);
    for (const l of wrap(font, caption, 7, lr.width - 12)) {
      text(page, l, lr.x + 6, ty);
      ty -= 9;
    }

    // Fit every section on page 1: largest font first, 1 then 2 columns,
    // shrinking until a dry run places all entries. Only if even the minimum
    // size doesn't fit do the rest continue on extra pages.
    const listRect: Rect = {
      x: lr.x + 2,
      y: lr.y + 6,
      width: lr.width - 4,
      height: ty - lr.y - 4,
    };
    const minFont = isPortrait ? LIST_MIN_FONT_PORTRAIT : LIST_MIN_FONT;
    const pick = (() => {
      for (let size = LIST_MAX_FONT; size >= minFont; size -= 0.2)
        for (const cols of [1, 2])
          if (
            flow(page, listRect, 0, cols, size, listLineHeight(size), true) >=
            total
          )
            return { size, cols };
      return { size: minFont, cols: 1 };
    })();
    let next = flow(
      page,
      listRect,
      0,
      pick.cols,
      pick.size,
      listLineHeight(pick.size),
    );
    if (next < total)
      text(
        page,
        `continued on next page (${total - next} more)`,
        lr.x + 6,
        lr.y + 1,
        5,
      );

    // ---- Continuation pages ----
    for (let n = 2; next < total; n++) {
      const p = pdf.addPage([W, H]);
      const ly = outer.y + outer.height - TITLE_H;
      const body: Rect = {
        x: outer.x + 4,
        y: outer.y + 6,
        width: outer.width - 8,
        height: outer.height - TITLE_H - 14,
      };
      box(p, outer);
      hLine(p, outer, ly);
      text(
        p,
        `EXHIBIT A - COORDINATES (page ${n})`,
        outer.x + 8,
        ly + 10,
        12,
        bold,
      );
      next = flow(
        p,
        body,
        next,
        Math.max(1, Math.floor(body.width / 170)),
        7,
        9,
      );
    }

    return Buffer.from(await pdf.save());
  }

  /** Page geometry + header rows (row heights come from the tallest wrapped cell). */
  private computeLayout(font: PDFFont, input: ExhibitAPdfLayoutInput) {
    const { header: h } = input;
    const clean = makeClean(font);

    const [pw, ph] = ANSI_PAGE_INCHES[input.pageSize];
    const land = input.pageOrientation === ExhibitAPageOrientation.Landscape;
    const W = (land ? ph : pw) * 72;
    const H = (land ? pw : ph) * 72;
    const outer: Rect = {
      x: MARGIN,
      y: MARGIN,
      width: W - MARGIN * 2,
      height: H - MARGIN * 2,
    };
    const sideW = clamp(W * 0.2, 138, 188);
    const mapW = outer.width - sideW - GAP;

    const unit = h.mgt_unit_number || input.submissionId;
    const districtCode = h.forest_district ? ` (${h.forest_district})` : '';
    const regionCode = h.forest_region ? ` (${h.forest_region})` : '';
    const pageDims = land ? `${ph}x${pw}` : `${pw}x${ph}`;
    const date = fmtDate(h.submission_date);
    const utmLine =
      h.utm_easting != null && h.utm_northing != null
        ? `UTM ${h.utm_zone ?? ''} ${Math.round(h.utm_easting)} east ${Math.round(h.utm_northing)} north`
        : h.utm_zone
          ? `UTM ${h.utm_zone}`
          : '';
    const opt = (label: string, v: number | null | undefined, d: number) =>
      v != null ? [`${label} ${+v.toFixed(d)}`] : [];

    const rows = (
      [
        [[`MAP OF: ${unit} ${h.title ?? ''}`]],
        [
          ['Submission ID:', h.submission_id || input.submissionId],
          [
            'Natural Resource District:',
            `${h.district_name ?? ''}${districtCode}`,
          ],
          ['Recreation District', `${h.title ?? ''}${regionCode}`],
          ['MAP PROJ:', 'NAD 1983 BC Env Albers'],
        ],
        [
          [
            `At scale page. ${pageDims}`,
            `1:${input.scale.toLocaleString('en-CA')}`,
            'Map Sheet:',
          ],
          [
            ...(utmLine ? [utmLine] : []),
            'Project Type:',
            h.project_type ?? h.mgt_unit_type ?? '',
          ],
          [
            ...opt('AREA (Ha):', h.area_ha, 4),
            ...opt('WIDTH (m):', h.width_m, 2),
            ...opt('LENGTH (km):', h.length_km, 4),
          ],
          [`Drawn By: ${h.drawn_by ?? ''}`, ...(date ? [`Date: ${date}`] : [])],
        ],
      ] as string[][][]
    ).map((row) => {
      const w = mapW / row.length;
      return {
        w,
        cells: row.map((paras) =>
          paras.flatMap((p) => wrap(font, clean(p), SIZE, w - PAD_X * 2)),
        ),
      };
    });

    const natural = rows.map((r) =>
      Math.max(
        MIN_ROW_H,
        Math.max(...r.cells.map((c) => c.length)) * (SIZE + LINE_GAP) -
          LINE_GAP +
          PAD_Y * 2,
      ),
    );
    const sum = natural.reduce((a, b) => a + b, 0);
    const headerH = Math.max(clamp(H * 0.18, 108, 148), TITLE_H + sum);
    const extra = (headerH - TITLE_H - sum) / rows.length;

    const bodyH = outer.height - headerH - GAP;
    const headerRect: Rect = {
      x: outer.x,
      y: outer.y + bodyH + GAP,
      width: outer.width,
      height: headerH,
    };
    const mapRect: Rect = {
      x: outer.x,
      y: outer.y,
      width: mapW,
      height: bodyH,
    };
    const sideRect: Rect = {
      x: mapRect.x + mapW + GAP,
      y: outer.y,
      width: sideW,
      height: outer.height,
    };

    return {
      W,
      H,
      outer,
      headerRect,
      mapRect,
      sideRect,
      headerH,
      rows,
      natural,
      extra,
    };
  }

  /** Loads a bundled asset (cached). Throws if missing. */
  private asset(name: string): Buffer {
    let buf = this.assetCache.get(name);
    if (!buf) {
      const path = ASSET_DIRS.map((d) => resolve(d, name)).find((p) =>
        existsSync(p),
      );
      if (!path) throw new Error(`Exhibit A asset not found: ${name}`);
      this.assetCache.set(name, (buf = readFileSync(path)));
    }
    return buf;
  }
}
