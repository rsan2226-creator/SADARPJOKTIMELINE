export type PaperSize = 'A4' | 'F4';
export type PageOrientation = 'portrait' | 'landscape';

export interface PaperConfig {
  widthMm: number;
  heightMm: number;
  label: string;
}

export const PAPER_SIZES: Record<PaperSize, PaperConfig> = {
  A4: { widthMm: 210, heightMm: 297, label: 'A4 (21 × 29,7 cm)' },
  F4: { widthMm: 215, heightMm: 330, label: 'F4 / Folio (21,5 × 33 cm)' },
};

export function getPageSizeCss(
  paperSize: PaperSize = 'A4',
  orientation: PageOrientation = 'portrait'
): string {
  const cfg = PAPER_SIZES[paperSize];
  const w = orientation === 'portrait' ? cfg.widthMm : cfg.heightMm;
  const h = orientation === 'portrait' ? cfg.heightMm : cfg.widthMm;
  return `${w}mm ${h}mm`;
}

const STANDARD_PRINT_TABLE_CSS = `
  table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  th, td { word-wrap: break-word; overflow-wrap: break-word; }
  .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; font-size: 9.5pt; }
  .data-table th, .data-table td { border: 1px solid #000000; padding: 5px 7px; vertical-align: top; }
  .data-table th { background-color: #f1f5f9; font-weight: bold; text-align: center; color: #0f172a; }
  .data-table tbody tr:nth-child(even) { background-color: #f8fafc; }
  .no-border, .no-border td, .no-border th { border: none !important; }
`;

export function injectPaperSizeIntoHtml(
  htmlContent: string,
  paperSize: PaperSize = 'A4',
  orientation: PageOrientation = 'portrait'
): string {
  const sizeCss = getPageSizeCss(paperSize, orientation);
  const pageRule = `@page { size: ${sizeCss}; margin: 1.5cm; }`;

  let updated = htmlContent;
  // Replace existing @page rule if found
  if (/@page\s*(?:Section\d+)?\s*\{[^}]*\}/i.test(updated)) {
    updated = updated.replace(
      /@page(\s+Section\d+)?\s*\{([^}]*)\}/gi,
      (_match, sec, inner) => {
        const cleanedInner = String(inner)
          .replace(/size\s*:[^;]+;?/gi, '')
          .trim();
        return `@page${sec || ''} { size: ${sizeCss}; ${cleanedInner} }`;
      }
    );
  } else if (updated.includes('</head>')) {
    updated = updated.replace(
      '</head>',
      `<style>${pageRule}\n${STANDARD_PRINT_TABLE_CSS}</style></head>`
    );
  }

  // Ensure standard table print rules exist
  if (updated.includes('</style>')) {
    updated = updated.replace('</style>', `\n${STANDARD_PRINT_TABLE_CSS}\n</style>`);
  }

  return updated;
}

export function buildStandardWordHtml({
  title,
  bodyHtml,
  paperSize = 'A4',
  orientation = 'portrait',
  extraCss = '',
}: {
  title: string;
  bodyHtml: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
  extraCss?: string;
}): string {
  const sizeCss = getPageSizeCss(paperSize, orientation);
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: ${sizeCss}; margin: 1.5cm; }
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 10.5pt; color: #000000; line-height: 1.4; }
    h1, h2, h3, h4 { margin: 6px 0 4px 0; color: #000000; }
    h1 { font-size: 14pt; text-align: center; text-transform: uppercase; font-weight: bold; }
    h2 { font-size: 12pt; font-weight: bold; }
    h3 { font-size: 11pt; font-weight: bold; }
    p { margin: 3px 0 5px 0; }
    ul, ol { margin: 3px 0 6px 0; padding-left: 18pt; }
    li { margin-bottom: 2.5pt; }
    hr { border: none; border-top: 1px solid #cbd5e1; margin: 10px 0; }
    .kop { text-align: center; border-bottom: 3px double #000000; padding-bottom: 8px; margin-bottom: 14px; }
    .kop h2 { font-size: 13pt; text-transform: uppercase; font-weight: bold; margin: 0; }
    .kop h3 { font-size: 11.5pt; font-weight: bold; margin: 2px 0; }
    .kop p { font-size: 9.5pt; margin: 2px 0 0 0; }
    .section-title { font-size: 11pt; font-weight: bold; background-color: #f1f5f9; border-left: 4px solid #0f766e; padding: 5px 8px; margin-top: 14px; margin-bottom: 6px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt; }
    .meta-table td { border: none !important; padding: 2px 4px; vertical-align: top; }
    .ttd-table { width: 100%; border-collapse: collapse; margin-top: 22px; font-size: 10pt; page-break-inside: avoid; }
    .ttd-table td { border: none !important; padding: 4px 8px; text-align: center; vertical-align: top; }
    ${STANDARD_PRINT_TABLE_CSS}
    ${extraCss}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function downloadWordFromHtml({
  filename,
  htmlContent,
  paperSize = 'A4',
  orientation = 'portrait',
}: {
  filename: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): void {
  const finalHtml = injectPaperSizeIntoWordHtml(htmlContent, paperSize, orientation);
  const blob = new Blob(['\ufeff', finalHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const safeName = filename.replace(/\.docx?$/i, '').replace(/[^\w\-]+/g, '_');
  triggerDownload(blob, `${safeName}_${paperSize}.doc`);
}

function injectPaperSizeIntoWordHtml(
  htmlContent: string,
  paperSize: PaperSize,
  orientation: PageOrientation
): string {
  if (htmlContent.trim().toLowerCase().includes('<html')) {
    return injectPaperSizeIntoHtml(htmlContent, paperSize, orientation);
  }
  return buildStandardWordHtml({
    title: 'Dokumen SADARPJOK',
    bodyHtml: htmlContent,
    paperSize,
    orientation,
  });
}

export function printFormattedDocument({
  title,
  htmlContent,
  paperSize = 'A4',
  orientation = 'portrait',
}: {
  title: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): void {
  const preparedHtml = injectPaperSizeIntoWordHtml(htmlContent, paperSize, orientation).replace(
    '</head>',
    `<style>
      @media print {
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; }
      }
    </style></head>`
  );

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = title;

  document.body.appendChild(iframe);

  const handleLoad = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print failed, falling back to window.print:', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 200);
  };

  iframe.onload = handleLoad;
  iframe.srcdoc = preparedHtml;
}

// Sanitize text for standard jsPDF Helvetica font (strip 4-byte emojis, normalize symbols)
function sanitizePdfText(input: string): string {
  if (!input) return '';
  return input
    .replace(/\u00a0/g, ' ')
    .replace(/[✓✔☑√]/g, '[v]')
    .replace(/[✗✘×]/g, 'x')
    .replace(/[→➡➜➔]/g, '->')
    .replace(/[←]/g, '<-')
    .replace(/[•●◦▪▫]/g, '-')
    .replace(/[“”„]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/°/g, ' deg')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isMarkdownTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('-')) return false;
  return /^\|?(?:\s*:?-{2,}:?\s*\|)+\s*(?::?-{2,}:?\s*)?\|?$/.test(trimmed);
}

function getColumnAlignments(separatorLine: string): Array<'left' | 'center' | 'right'> {
  return separatorLine
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => {
      const c = cell.trim();
      if (c.startsWith(':') && c.endsWith(':')) return 'center';
      if (c.endsWith(':')) return 'right';
      return 'left';
    });
}

function formatInlineMarkdownHtml(raw: string): string {
  // Preserve explicit <br> / <br/> breaks cleanly before escaping HTML
  const BREAK_TOKEN = '___BR_TOKEN___';
  const withToken = String(raw || '').replace(/<br\s*\/?>/gi, BREAK_TOKEN);
  return escapeHtml(withToken)
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;">$1</code>')
    .replace(new RegExp(BREAK_TOKEN, 'g'), '<br/>');
}

function isAutoCenterHeader(headerText: string): boolean {
  const h = headerText.toLowerCase().trim();
  return (
    h === 'no' ||
    h === 'no.' ||
    h === 'no soal' ||
    h === 'no. soal' ||
    h === 'l/p' ||
    h === 'skor' ||
    h === 'jp' ||
    h === 'alokasi waktu' ||
    h === 'alokasi (jp)' ||
    h === 'semester' ||
    h === 'pertemuan' ||
    h === 'pert. ke-' ||
    h === 'kunci' ||
    h === 'kode' ||
    h === 'fase' ||
    h === 'level' ||
    h.includes('level kognitif') ||
    h.includes('taksonomi') ||
    h.includes('alokasi')
  );
}

export function markdownToCleanHtml(markdown: string): string {
  if (!markdown) return '';
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let tableRows: string[][] = [];
  let tableAligns: Array<'left' | 'center' | 'right'> = [];

  const closeList = () => {
    if (inList) {
      htmlParts.push(`</${inList}>`);
      inList = null;
    }
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;

    const cleanRows: string[][] = [];
    tableRows.forEach((row) => {
      const joined = `|${row.join('|')}|`;
      if (isMarkdownTableSeparator(joined)) {
        if (tableAligns.length === 0) {
          tableAligns = getColumnAlignments(joined);
        }
        return;
      }
      cleanRows.push(row);
    });

    if (cleanRows.length > 0) {
      const colCount = Math.max(...cleanRows.map((r) => r.length));
      const headers = [...cleanRows[0]];
      while (headers.length < colCount) headers.push('');

      htmlParts.push('<table class="data-table" border="1" cellpadding="6" cellspacing="0"><thead><tr>');
      headers.forEach((cell) => {
        htmlParts.push(`<th>${formatInlineMarkdownHtml(cell)}</th>`);
      });
      htmlParts.push('</tr></thead><tbody>');

      cleanRows.slice(1).forEach((rawRow) => {
        const row = [...rawRow];
        while (row.length < colCount) row.push('');
        htmlParts.push('<tr>');
        row.forEach((cell, cIdx) => {
          const headerName = headers[cIdx] || '';
          const explicitAlign = tableAligns[cIdx];
          const align =
            explicitAlign && explicitAlign !== 'left'
              ? explicitAlign
              : isAutoCenterHeader(headerName) || /^\d{1,3}\.?$/.test(cell.trim())
                ? 'center'
                : 'left';
          const alignAttr = align !== 'left' ? ` style="text-align:${align};"` : '';
          htmlParts.push(`<td${alignAttr}>${formatInlineMarkdownHtml(cell)}</td>`);
        });
        htmlParts.push('</tr>');
      });
      htmlParts.push('</tbody></table>');
    }
    tableRows = [];
    tableAligns = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      closeList();
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    if (!line) {
      closeList();
      continue;
    }

    if (/^[-*_]{3,}$/.test(line)) {
      closeList();
      htmlParts.push('<hr/>');
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      closeList();
      const match = line.match(/^(#{1,4})\s+(.*)$/);
      const level = match ? match[1].length : 2;
      const content = match ? match[2] : line;
      if (level === 1) {
        htmlParts.push(`<h1>${formatInlineMarkdownHtml(content)}</h1>`);
      } else if (level === 2) {
        htmlParts.push(`<div class="section-title">${formatInlineMarkdownHtml(content)}</div>`);
      } else if (level === 3) {
        htmlParts.push(`<h3>${formatInlineMarkdownHtml(content)}</h3>`);
      } else {
        htmlParts.push(`<h4>${formatInlineMarkdownHtml(content)}</h4>`);
      }
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        htmlParts.push('<ul>');
      }
      htmlParts.push(`<li>${formatInlineMarkdownHtml(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        htmlParts.push('<ol>');
      }
      htmlParts.push(`<li>${formatInlineMarkdownHtml(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    closeList();
    htmlParts.push(`<p>${formatInlineMarkdownHtml(line)}</p>`);
  }

  flushTable();
  closeList();
  return htmlParts.join('\n');
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface ParsedCell {
  content: string;
  colSpan?: number;
  rowSpan?: number;
  styles?: {
    halign?: 'left' | 'center' | 'right';
    fontStyle?: 'normal' | 'bold' | 'italic';
    fillColor?: [number, number, number];
    textColor?: [number, number, number];
  };
}

function isBorderlessTable(tableEl: HTMLTableElement): boolean {
  const cls = (tableEl.className || '').toLowerCase();
  const styleAttr = (tableEl.getAttribute('style') || '').toLowerCase();
  const borderAttr = tableEl.getAttribute('border');
  if (borderAttr === '1') return false;
  if (
    cls.includes('no-border') ||
    cls.includes('meta-table') ||
    cls.includes('identity-table') ||
    cls.includes('identitas-table') ||
    cls.includes('info-table') ||
    cls.includes('ttd-table') ||
    cls.includes('pilihan-grid') ||
    cls.includes('sig-table')
  ) {
    return true;
  }
  if (styleAttr.includes('border: none') || styleAttr.includes('border:none')) {
    return true;
  }
  const hasTh = tableEl.querySelectorAll('th').length > 0;
  if (
    !hasTh &&
    !cls.includes('bordered') &&
    !cls.includes('data-table') &&
    !cls.includes('table-bordered') &&
    !cls.includes('rpe-table') &&
    !cls.includes('prota-table') &&
    !cls.includes('prosem-table') &&
    !cls.includes('kartu-table') &&
    !cls.includes('keterangan-table')
  ) {
    const firstTdStyle = (tableEl.querySelector('td')?.getAttribute('style') || '').toLowerCase();
    if (!firstTdStyle.includes('border')) {
      return false;
    }
  }
  return false;
}

function extractTableData(tableEl: HTMLTableElement): {
  head: ParsedCell[][];
  body: ParsedCell[][];
  borderless: boolean;
  colCount: number;
} {
  const borderless = isBorderlessTable(tableEl);
  const head: ParsedCell[][] = [];
  const body: ParsedCell[][] = [];
  let maxCols = 0;

  const rows = Array.from(tableEl.rows);
  rows.forEach((tr) => {
    if (tr.closest('table') !== tableEl) return;

    const cells = Array.from(tr.cells);
    const isHeaderRow =
      tr.parentElement?.tagName.toLowerCase() === 'thead' ||
      (cells.length > 0 && cells.every((c) => c.tagName.toLowerCase() === 'th'));

    let rowCols = 0;
    const parsedRow: ParsedCell[] = cells.map((cell) => {
      const colSpan = cell.colSpan > 1 ? cell.colSpan : undefined;
      const rowSpan = cell.rowSpan > 1 ? cell.rowSpan : undefined;
      rowCols += cell.colSpan || 1;

      const alignAttr = (cell.getAttribute('align') || '').toLowerCase();
      const styleStr = (cell.getAttribute('style') || '').toLowerCase();

      let halign: 'left' | 'center' | 'right' = isHeaderRow ? 'center' : 'left';
      if (alignAttr === 'center' || styleStr.includes('text-align: center') || styleStr.includes('text-align:center')) {
        halign = 'center';
      } else if (alignAttr === 'right' || styleStr.includes('text-align: right') || styleStr.includes('text-align:right')) {
        halign = 'right';
      }

      const clone = cell.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      clone.querySelectorAll('p, div, li').forEach((block) => {
        block.prepend(document.createTextNode('\n'));
      });
      const text = sanitizePdfText(clone.textContent || '');

      const isTotalRow =
        tr.className.toLowerCase().includes('total-row') ||
        tr.className.toLowerCase().includes('subtotal-row') ||
        styleStr.includes('font-weight: bold') ||
        styleStr.includes('font-weight:bold');

      return {
        content: text,
        colSpan,
        rowSpan,
        styles: {
          halign,
          fontStyle: isHeaderRow || cell.tagName.toLowerCase() === 'th' || isTotalRow ? 'bold' : 'normal',
          ...(isTotalRow && !borderless ? { fillColor: [226, 232, 240] as [number, number, number] } : {}),
        },
      };
    });

    if (parsedRow.length === 0) return;
    if (rowCols > maxCols) maxCols = rowCols;

    if (isHeaderRow && body.length === 0) {
      head.push(parsedRow);
    } else {
      body.push(parsedRow);
    }
  });

  return { head, body, borderless, colCount: maxCols };
}

function buildSmartColumnStyles(
  head: ParsedCell[][],
  colCount: number,
  contentWidth: number,
  borderless: boolean
): Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }> {
  if (borderless || colCount <= 1 || head.length === 0) return {};

  // Flatten header titles roughly by column index when single header row
  const headerRow = head[0];
  if (!headerRow || headerRow.some((c) => (c.colSpan ?? 1) > 1)) {
    // Complex multi-level header (like PROSEM or Kartu Soal Keterangan)
    if (colCount >= 20) {
      // PROSEM landscape matrix: first 4 info cols + week cols + Keterangan
      const weekCols = colCount - 5;
      const infoWidth = Math.min(contentWidth * 0.42, 112);
      const ketWidth = 30;
      const remaining = Math.max(contentWidth - infoWidth - ketWidth, weekCols * 4.2);
      const weekW = remaining / Math.max(weekCols, 1);
      const styles: Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }> = {
        0: { cellWidth: infoWidth * 0.30, halign: 'left' },
        1: { cellWidth: infoWidth * 0.44, halign: 'left' },
        2: { cellWidth: infoWidth * 0.12, halign: 'center' },
        3: { cellWidth: infoWidth * 0.14, halign: 'center' },
        [colCount - 1]: { cellWidth: ketWidth, halign: 'left' },
      };
      for (let i = 4; i < colCount - 1; i++) {
        styles[i] = { cellWidth: weekW, halign: 'center' };
      }
      return styles;
    }
    return {};
  }

  const styles: Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }> = {};
  let fixedWidthSum = 0;
  const flexIndices: number[] = [];

  headerRow.forEach((cell, idx) => {
    const h = cell.content.toLowerCase().trim();
    if (h === 'no' || h === 'no.' || h === 'l/p') {
      styles[idx] = { cellWidth: 10, halign: 'center' };
      fixedWidthSum += 10;
    } else if (h === 'skor' || h === 'jp' || h === 'no soal' || h === 'no. soal' || h === 'kode') {
      styles[idx] = { cellWidth: 13, halign: 'center' };
      fixedWidthSum += 13;
    } else if (h === 'semester' || h === 'pert. ke-' || h === 'alokasi waktu' || h === 'alokasi (jp)' || h === 'no bab/atp' || h === 'fase' || h === 'kunci') {
      styles[idx] = { cellWidth: 18, halign: 'center' };
      fixedWidthSum += 18;
    } else if (h.includes('level') || h.includes('taksonomi') || h.includes('bentuk soal') || h.includes('bulan') || h === 'status' || h === 'tanggal') {
      styles[idx] = { cellWidth: 22, halign: 'center' };
      fixedWidthSum += 22;
    } else {
      flexIndices.push(idx);
    }
  });

  // Only assign fixed widths if enough room remains for flex columns
  if (flexIndices.length > 0 && contentWidth - fixedWidthSum >= flexIndices.length * 22) {
    return styles;
  }

  // Otherwise clear cellWidth overrides and keep alignment hints
  Object.keys(styles).forEach((k) => {
    delete styles[Number(k)].cellWidth;
  });
  return styles;
}

export async function downloadPdfFromHtml({
  filename,
  title,
  htmlContent,
  paperSize = 'A4',
  orientation = 'portrait',
}: {
  filename: string;
  title?: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  const cfg = PAPER_SIZES[paperSize];
  const format: [number, number] = [cfg.widthMm, cfg.heightMm];

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format,
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const marginTop = 13;
  const marginBottom = 14;
  const contentWidth = pageWidth - marginX * 2;

  let cursorY = marginTop;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  };

  const renderTextBlock = (
    text: string,
    options: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold' | 'italic';
      align?: 'left' | 'center' | 'right';
      color?: [number, number, number];
      spaceBefore?: number;
      spaceAfter?: number;
      indent?: number;
      drawBottomRule?: boolean;
      leftAccent?: boolean;
    } = {}
  ) => {
    const clean = sanitizePdfText(text);
    if (!clean) return;

    const fontSize = options.fontSize ?? 10;
    const fontStyle = options.fontStyle ?? 'normal';
    const align = options.align ?? 'left';
    const color = options.color ?? [15, 23, 42];
    const indent = options.indent ?? 0;

    cursorY += options.spaceBefore ?? 0;

    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lineHeight = fontSize * 0.42;
    const maxW = contentWidth - indent;
    const lines = doc.splitTextToSize(clean, maxW) as string[];

    const blockHeight = lines.length * lineHeight;
    ensureSpace(Math.min(blockHeight, 40));

    if (options.leftAccent) {
      doc.setDrawColor(15, 118, 110);
      doc.setLineWidth(0.9);
      doc.line(marginX, cursorY - 2, marginX, cursorY + blockHeight - 1);
    }

    lines.forEach((line) => {
      ensureSpace(lineHeight + 1);
      const xPos =
        align === 'center'
          ? pageWidth / 2
          : align === 'right'
            ? pageWidth - marginX
            : marginX + indent;
      doc.text(line, xPos, cursorY, { align });
      cursorY += lineHeight;
    });

    if (options.drawBottomRule) {
      cursorY += 1.5;
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      doc.setLineWidth(0.2);
      doc.line(marginX, cursorY + 1, pageWidth - marginX, cursorY + 1);
      cursorY += 3;
    }

    cursorY += options.spaceAfter ?? 2;
  };

  // Parse HTML body
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(htmlContent, 'text/html');
  const root = parsedDoc.body;

  // Walk DOM nodes cleanly
  const processElement = (el: Element) => {
    const tag = el.tagName.toLowerCase();
    const cls = (el.className || '').toLowerCase();
    const styleStr = (el.getAttribute('style') || '').toLowerCase();

    if (tag === 'style' || tag === 'script' || tag === 'xml') return;

    // Handle explicit page breaks
    if (
      styleStr.includes('page-break-before: always') ||
      styleStr.includes('page-break-before:always') ||
      cls.includes('page-break')
    ) {
      doc.addPage();
      cursorY = marginTop;
    }

    if (tag === 'br') {
      if (styleStr.includes('page-break-before')) return;
      cursorY += 3;
      return;
    }

    if (tag === 'hr') {
      ensureSpace(4);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 4;
      return;
    }

    if (tag === 'table') {
      const tableEl = el as HTMLTableElement;
      const { head, body, borderless, colCount } = extractTableData(tableEl);
      if (head.length === 0 && body.length === 0) return;

      ensureSpace(14);
      const dynamicFontSize = borderless
        ? 9.5
        : colCount >= 18
          ? 6
          : colCount >= 10
            ? 7
            : colCount >= 7
              ? 8
              : 8.8;
      const dynamicPad = borderless
        ? { top: 1.3, right: 2.5, bottom: 1.3, left: 1.5 }
        : colCount >= 18
          ? { top: 1.2, right: 1, bottom: 1.2, left: 1 }
          : colCount >= 9
            ? { top: 1.6, right: 1.6, bottom: 1.6, left: 1.6 }
            : { top: 2.2, right: 2.5, bottom: 2.2, left: 2.5 };

      const colStyles = buildSmartColumnStyles(head, colCount, contentWidth, borderless);

      autoTable(doc, {
        startY: cursorY,
        head: head.length > 0 ? (head as never) : undefined,
        body: body as never,
        margin: { left: marginX, right: marginX, top: marginTop, bottom: marginBottom },
        theme: borderless ? 'plain' : 'grid',
        showHead: 'everyPage',
        rowPageBreak: 'avoid',
        tableWidth: contentWidth,
        columnStyles: colStyles as never,
        styles: {
          font: 'helvetica',
          fontSize: dynamicFontSize,
          cellPadding: dynamicPad,
          textColor: [15, 23, 42],
          lineColor: [30, 41, 59],
          lineWidth: borderless ? 0 : 0.22,
          overflow: 'linebreak',
          valign: 'top',
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          lineColor: [30, 41, 59],
          lineWidth: 0.28,
        },
        alternateRowStyles: borderless
          ? undefined
          : {
              fillColor: [248, 250, 252],
            },
      });

      const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
      cursorY = (lastTable?.finalY ?? cursorY) + 4;
      return;
    }

    // Kop Surat / Document Title Block
    if (
      cls.includes('kop') ||
      cls.includes('header-doc') ||
      cls.includes('judul-doc') ||
      (tag === 'div' && styleStr.includes('text-align: center') && el.querySelectorAll('table').length === 0)
    ) {
      const hasBorder = cls.includes('kop') || styleStr.includes('border-bottom');
      const innerLines = Array.from(el.children)
        .map((c) => sanitizePdfText(c.textContent || ''))
        .filter(Boolean);
      if (innerLines.length > 0) {
        innerLines.forEach((line, idx) => {
          renderTextBlock(line, {
            fontSize: idx === 0 ? 12.5 : idx === 1 ? 11.5 : 10,
            fontStyle: idx <= 1 ? 'bold' : 'normal',
            align: 'center',
            spaceAfter: idx === innerLines.length - 1 ? 2 : 1,
            drawBottomRule: hasBorder && idx === innerLines.length - 1,
          });
        });
      } else {
        renderTextBlock(el.textContent || '', {
          fontSize: 12,
          fontStyle: 'bold',
          align: 'center',
          drawBottomRule: hasBorder,
        });
      }
      return;
    }

    if (tag === 'h1' || tag === 'h2') {
      renderTextBlock(el.textContent || '', {
        fontSize: tag === 'h1' ? 13 : 11.5,
        fontStyle: 'bold',
        align: styleStr.includes('center') ? 'center' : 'left',
        spaceBefore: 3,
        spaceAfter: 2,
      });
      return;
    }

    if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || cls.includes('section-title') || cls.includes('section-heading')) {
      renderTextBlock(el.textContent || '', {
        fontSize: 10.5,
        fontStyle: 'bold',
        align: styleStr.includes('center') ? 'center' : 'left',
        spaceBefore: 3,
        spaceAfter: 2,
        leftAccent: cls.includes('section-title'),
        indent: cls.includes('section-title') ? 3 : 0,
      });
      return;
    }

    if (tag === 'strong' || tag === 'b') {
      renderTextBlock(el.textContent || '', {
        fontSize: 9.5,
        fontStyle: 'bold',
        spaceBefore: 1,
        spaceAfter: 1,
      });
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li');
      items.forEach((li, idx) => {
        const prefix = tag === 'ol' ? `${idx + 1}. ` : '- ';
        renderTextBlock(`${prefix}${li.textContent || ''}`, {
          fontSize: 9.5,
          indent: 4,
          spaceAfter: 1,
        });
      });
      cursorY += 1.5;
      return;
    }

    if (tag === 'p') {
      const isBold = el.querySelector('strong, b') !== null && el.textContent?.trim() === el.querySelector('strong, b')?.textContent?.trim();
      renderTextBlock(el.textContent || '', {
        fontSize: 9.5,
        fontStyle: isBold ? 'bold' : styleStr.includes('italic') ? 'italic' : 'normal',
        align: styleStr.includes('center') ? 'center' : styleStr.includes('right') ? 'right' : 'left',
        spaceAfter: 2,
      });
      return;
    }

    // Container elements: walk childNodes preserving inline text/bold runs between block children
    const blockTags = new Set(['div', 'p', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'hr', 'section', 'article', 'blockquote']);
    const hasBlockChildren = Array.from(el.children).some((c) => blockTags.has(c.tagName.toLowerCase()));

    if (hasBlockChildren) {
      let inlineBuffer = '';
      let inlineAllBold = true;

      const flushInlineBuffer = () => {
        const trimmed = inlineBuffer.trim();
        if (trimmed) {
          renderTextBlock(trimmed, {
            fontSize: 9.5,
            fontStyle: inlineAllBold ? 'bold' : cls.includes('stimulus') ? 'italic' : 'normal',
            indent: cls.includes('stimulus') ? 3 : 0,
            spaceAfter: 1.5,
          });
        }
        inlineBuffer = '';
        inlineAllBold = true;
      };

      Array.from(el.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const val = node.textContent || '';
          if (val.trim()) {
            inlineAllBold = false;
            inlineBuffer += val;
          } else if (inlineBuffer) {
            inlineBuffer += ' ';
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const childEl = node as Element;
          const cTag = childEl.tagName.toLowerCase();
          if (blockTags.has(cTag)) {
            flushInlineBuffer();
            processElement(childEl);
          } else if (cTag === 'br') {
            inlineBuffer += '\n';
          } else {
            const cText = childEl.textContent || '';
            if (cText.trim()) {
              if (cTag !== 'strong' && cTag !== 'b') {
                inlineAllBold = false;
              }
              inlineBuffer += cText;
            }
          }
        }
      });
      flushInlineBuffer();
    } else if ((el.textContent || '').trim()) {
      const cloneEl = el.cloneNode(true) as HTMLElement;
      cloneEl.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      const isStrongOnly = el.querySelector('strong, b') !== null && el.textContent?.trim() === el.querySelector('strong, b')?.textContent?.trim();
      renderTextBlock(cloneEl.textContent || '', {
        fontSize: 9.5,
        fontStyle: isStrongOnly ? 'bold' : cls.includes('stimulus') ? 'italic' : 'normal',
        align: styleStr.includes('center') ? 'center' : styleStr.includes('right') ? 'right' : 'left',
        indent: cls.includes('stimulus') ? 3 : 0,
        spaceAfter: 1.5,
      });
    }
  };

  if (title && !root.querySelector('h1, h2, .kop, .judul-doc, .title-doc')) {
    renderTextBlock(title, {
      fontSize: 13,
      fontStyle: 'bold',
      align: 'center',
      spaceAfter: 4,
      drawBottomRule: true,
    });
  }

  Array.from(root.children).forEach((child) => processElement(child));

  // Add subtle page numbering footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `SADARPJOK - Format ${paperSize} (${PAPER_SIZES[paperSize].widthMm}x${PAPER_SIZES[paperSize].heightMm}mm) - Halaman ${p} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
  }

  const safeName = filename.replace(/\.pdf$/i, '').replace(/[^\w\-]+/g, '_');
  doc.save(`${safeName}_${paperSize}.pdf`);
}

export interface ExtractedTable {
  index: number;
  titleHint: string;
  borderless: boolean;
  headers: string[];
  rows: string[][];
  markdownTable: string;
}

export interface JsonPromptExportPayload {
  schemaVersion: string;
  aplikasi: string;
  metadataDokumen: {
    judul: string;
    ukuranKertas: PaperSize;
    labelUkuranKertas: string;
    dimensiMm: { width: number; height: number };
    orientasi: PageOrientation;
    marginCm: number;
    jumlahTabelData: number;
    tanggalEkspor: string;
  };
  instruksiCetakSiapPakai: {
    formatKertas: string;
    aturanTataLetak: string[];
    aturanKerapianTabel: string[];
  };
  promptAiSiapCetak: string;
  kontenTerstruktur: {
    teksMarkdown: string;
    daftarTabel: Array<{
      nomorTabel: number;
      judulBagian: string;
      kolom: string[];
      jumlahBaris: number;
      baris: string[][];
      tabelMarkdown: string;
    }>;
  };
}

function cleanSingleLineCell(text: string): string {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function flattenTableRowsForMarkdown(
  parsedRows: ParsedCell[][]
): Array<Array<{ text: string; halign: 'left' | 'center' | 'right' }>> {
  const expanded: Array<Array<{ text: string; halign: 'left' | 'center' | 'right' }>> = [];
  parsedRows.forEach((row) => {
    const outRow: Array<{ text: string; halign: 'left' | 'center' | 'right' }> = [];
    row.forEach((cell) => {
      const span = Math.max(1, cell.colSpan || 1);
      const halign = cell.styles?.halign || 'left';
      const cleaned = cleanSingleLineCell(cell.content);
      outRow.push({ text: cleaned, halign });
      for (let i = 1; i < span; i++) {
        outRow.push({ text: '', halign });
      }
    });
    if (outRow.some((c) => c.text !== '')) {
      expanded.push(outRow);
    }
  });
  return expanded;
}

function formatNeatMarkdownTable(
  headers: string[],
  rows: string[][],
  aligns: Array<'left' | 'center' | 'right'>
): string {
  const colCount = Math.max(
    headers.length,
    ...rows.map((r) => r.length),
    1
  );

  const normHeaders = [...headers];
  while (normHeaders.length < colCount) normHeaders.push(`Kolom ${normHeaders.length + 1}`);

  const normRows = rows.map((r) => {
    const copy = [...r];
    while (copy.length < colCount) copy.push('');
    return copy;
  });

  const colWidths = Array.from({ length: colCount }, (_, cIdx) => {
    const headerLen = normHeaders[cIdx].length;
    const maxRowLen = normRows.reduce((max, r) => Math.max(max, r[cIdx].length), 0);
    return Math.min(44, Math.max(3, headerLen, maxRowLen));
  });

  const padCell = (val: string, width: number, align: 'left' | 'center' | 'right') => {
    if (val.length >= width) return val;
    const diff = width - val.length;
    if (align === 'right') return `${' '.repeat(diff)}${val}`;
    if (align === 'center') {
      const left = Math.floor(diff / 2);
      const right = diff - left;
      return `${' '.repeat(left)}${val}${' '.repeat(right)}`;
    }
    return `${val}${' '.repeat(diff)}`;
  };

  const makeSep = (width: number, align: 'left' | 'center' | 'right') => {
    const dashCount = Math.max(3, width);
    if (align === 'center') return `:${'-'.repeat(Math.max(1, dashCount - 2))}:`;
    if (align === 'right') return `${'-'.repeat(Math.max(2, dashCount - 1))}:`;
    return `${'-'.repeat(dashCount)}`;
  };

  const headerLine = `| ${normHeaders
    .map((h, i) => padCell(h, colWidths[i], aligns[i] || 'center'))
    .join(' | ')} |`;

  const sepLine = `| ${colWidths
    .map((w, i) => makeSep(w, aligns[i] || 'left'))
    .join(' | ')} |`;

  const bodyLines = normRows.map(
    (r) =>
      `| ${r
        .map((c, i) => padCell(c, colWidths[i], aligns[i] || 'left'))
        .join(' | ')} |`
  );

  return [headerLine, sepLine, ...bodyLines].join('\n');
}

function tableElementToExtracted(
  tableEl: HTMLTableElement,
  index: number,
  titleHint: string
): ExtractedTable | null {
  const { head, body, borderless } = extractTableData(tableEl);
  if (head.length === 0 && body.length === 0) return null;

  const flatHead = flattenTableRowsForMarkdown(head);
  const flatBody = flattenTableRowsForMarkdown(body);

  let headerCells: Array<{ text: string; halign: 'left' | 'center' | 'right' }> = [];
  let dataRows = flatBody;

  if (flatHead.length > 0) {
    // Combine multi-row header cleanly if more than 1 header row
    const colCount = Math.max(
      ...flatHead.map((r) => r.length),
      ...flatBody.map((r) => r.length),
      1
    );
    headerCells = Array.from({ length: colCount }, (_, cIdx) => {
      const parts = flatHead
        .map((r) => r[cIdx]?.text || '')
        .filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));
      return {
        text: uniqueParts.join(' / ') || `Kolom ${cIdx + 1}`,
        halign: flatHead[flatHead.length - 1]?.[cIdx]?.halign || 'center',
      };
    });
  } else if (flatBody.length > 0) {
    if (borderless) {
      headerCells = flatBody[0].map((_, idx) => ({
        text: idx === 0 ? 'Keterangan' : idx === 1 ? 'Isian' : `Kolom ${idx + 1}`,
        halign: 'left' as const,
      }));
    } else {
      headerCells = flatBody[0];
      dataRows = flatBody.slice(1);
    }
  }

  const headers = headerCells.map((h) => h.text);
  const aligns = headerCells.map((h, idx) => {
    if (isAutoCenterHeader(h.text)) return 'center';
    const sampleCell = dataRows[0]?.[idx];
    return sampleCell?.halign || 'left';
  });

  const rows = dataRows.map((r) => r.map((c) => c.text));
  const markdownTable = formatNeatMarkdownTable(headers, rows, aligns);

  return {
    index,
    titleHint,
    borderless,
    headers,
    rows,
    markdownTable,
  };
}

export function extractDocumentForPrompt(
  htmlContent: string,
  fallbackTitle: string = 'Dokumen SADARPJOK'
): { markdownContent: string; dataTables: ExtractedTable[] } {
  if (typeof DOMParser === 'undefined') {
    const stripped = String(htmlContent || '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { markdownContent: stripped || fallbackTitle, dataTables: [] };
  }

  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(htmlContent || '', 'text/html');
  const root = parsedDoc.body;

  const lines: string[] = [];
  const dataTables: ExtractedTable[] = [];
  let currentHeading = fallbackTitle;
  let tableCounter = 0;

  const blockTags = new Set([
    'div',
    'p',
    'table',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'hr',
    'section',
    'article',
    'blockquote',
  ]);

  const walk = (el: Element) => {
    const tag = el.tagName.toLowerCase();
    const cls = (el.className || '').toLowerCase();
    const styleStr = (el.getAttribute('style') || '').toLowerCase();

    if (tag === 'style' || tag === 'script' || tag === 'xml') return;

    if (tag === 'hr') {
      lines.push('---');
      return;
    }

    if (tag === 'table') {
      const tableEl = el as HTMLTableElement;
      const extracted = tableElementToExtracted(tableEl, tableCounter + 1, currentHeading);
      if (!extracted) return;

      if (extracted.borderless && !cls.includes('ttd')) {
        // Format metadata/identity borderless tables cleanly as bulleted pairs or clean table
        const isMetaGrid = extracted.rows.every((r) => r.length >= 2);
        if (isMetaGrid && extracted.rows.length <= 8) {
          extracted.rows.forEach((r) => {
            const cleanParts = r.filter(Boolean);
            if (cleanParts.length >= 2) {
              if (cleanParts.length === 4) {
                lines.push(`- **${cleanParts[0]}** ${cleanParts[1]} | **${cleanParts[2]}** ${cleanParts[3]}`);
              } else {
                lines.push(`- **${cleanParts[0]}** ${cleanParts.slice(1).join(' ')}`);
              }
            }
          });
          lines.push('');
          return;
        }
      }

      if (!extracted.borderless) {
        tableCounter += 1;
        extracted.index = tableCounter;
        dataTables.push(extracted);
      }
      lines.push('');
      lines.push(extracted.markdownTable);
      lines.push('');
      return;
    }

    if (cls.includes('kop') || cls.includes('header-doc') || cls.includes('judul-doc')) {
      const kopLines = Array.from(el.children)
        .map((c) => sanitizePdfText(c.textContent || ''))
        .filter(Boolean);
      if (kopLines.length > 0) {
        lines.push(`# ${kopLines[0]}`);
        kopLines.slice(1).forEach((l) => lines.push(`**${l}**`));
        lines.push('');
        currentHeading = kopLines[kopLines.length - 1] || currentHeading;
      }
      return;
    }

    if (tag === 'h1' || tag === 'h2') {
      const txt = sanitizePdfText(el.textContent || '');
      if (txt) {
        currentHeading = txt;
        lines.push(`\n## ${txt}`);
      }
      return;
    }

    if (
      tag === 'h3' ||
      tag === 'h4' ||
      tag === 'h5' ||
      tag === 'h6' ||
      cls.includes('section-title') ||
      cls.includes('section-heading')
    ) {
      const txt = sanitizePdfText(el.textContent || '');
      if (txt) {
        currentHeading = txt;
        lines.push(`\n### ${txt}`);
      }
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li');
      items.forEach((li, idx) => {
        const txt = sanitizePdfText(li.textContent || '');
        if (txt) {
          lines.push(tag === 'ol' ? `${idx + 1}. ${txt}` : `- ${txt}`);
        }
      });
      lines.push('');
      return;
    }

    if (tag === 'p') {
      const txt = sanitizePdfText(el.textContent || '');
      if (txt) {
        lines.push(styleStr.includes('italic') ? `*${txt}*` : txt);
      }
      return;
    }

    const hasBlockChildren = Array.from(el.children).some((c) =>
      blockTags.has(c.tagName.toLowerCase())
    );
    if (hasBlockChildren) {
      Array.from(el.children).forEach((child) => walk(child));
    } else {
      const cloneEl = el.cloneNode(true) as HTMLElement;
      cloneEl.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      const txt = sanitizePdfText(cloneEl.textContent || '');
      if (txt) {
        lines.push(txt);
      }
    }
  };

  Array.from(root.children).forEach((child) => walk(child));

  const markdownContent = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { markdownContent: markdownContent || fallbackTitle, dataTables };
}

export function buildAiPrintPrompt({
  title,
  htmlContent,
  paperSize = 'F4',
  orientation = 'portrait',
}: {
  title: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): string {
  const { markdownContent, dataTables } = extractDocumentForPrompt(htmlContent, title);
  const paperCfg = PAPER_SIZES[paperSize];
  const dimText =
    orientation === 'landscape'
      ? `${paperCfg.heightMm / 10} cm x ${paperCfg.widthMm / 10} cm (Landscape)`
      : `${paperCfg.widthMm / 10} cm x ${paperCfg.heightMm / 10} cm (Portrait)`;

  const tableGuidance =
    dataTables.length > 0
      ? `Dokumen ini memuat ${dataTables.length} tabel terstruktur. WAJIB tampilkan seluruh tabel dengan sangat rapi:
   - Gunakan batas sel lengkap dan header kolom yang tegas (ditebalkan).
   - Kolom pendek (No, JP, Skor, Kunci, Semester, Kode, Level) dibuat ringkas dan rata tengah; kolom deskripsi/uraian rata kiri.
   - Pastikan lebar seluruh kolom proporsional agar muat utuh di kertas ${paperSize} (${dimText}) tanpa terpotong ke samping.
   - Jangan mengubah tabel menjadi daftar teks biasa dan jangan meninggalkan baris/kolom kosong yang berantakan.`
      : `Jika terdapat bagian yang lebih tepat disajikan sebagai tabel (misalnya rubrik, jadwal, rincian skor, atau daftar isian), sajikan dalam format tabel yang rapi, berbatas tegas, dengan perataan kolom yang presisi untuk kertas ${paperSize}.`;

  return `Anda adalah Asisten Profesional Administrasi Sekolah & Kurikulum Merdeka.
Susun dan rapikan dokumen "${title}" di bawah ini menjadi dokumen resmi yang LANGSUNG SIAP CETAK pada ukuran kertas **${paperCfg.label}** dengan spesifikasi sebagai berikut:

1. SPESIFIKASI HALAMAN & CETAK (${paperSize}):
   - Ukuran Kertas: ${paperCfg.label} (${dimText}).
   - Margin: Atas 1,5 cm, Bawah 1,5 cm, Kiri 1,5 cm, Kanan 1,5 cm.
   - Tata Letak Resmi: KOP sekolah/judul rata tengah dengan garis bawah ganda, tabel identitas sejajar tanda titik dua (:), isi dokumen lengkap tanpa terpotong, dan blok pengesahan/tanda tangan Kepala Sekolah & Guru di bagian akhir.

2. STANDAR KERAPIAN TABEL & KETERBACAAN:
   ${tableGuidance}

3. KETENTUAN OUTPUT:
   - Langsung tampilkan isi dokumen final yang rapi dan siap disalin ke Microsoft Word / Google Docs atau dicetak ke PDF ukuran ${paperSize}.
   - Jangan menambahkan kalimat pembuka, basa-basi, atau penjelasan teknis di luar isi dokumen.

=== DATA & KONTEN DOKUMEN ===
${markdownContent}`;
}

export function buildJsonPromptPayload({
  title,
  htmlContent,
  paperSize = 'F4',
  orientation = 'portrait',
}: {
  title: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): JsonPromptExportPayload {
  const { markdownContent, dataTables } = extractDocumentForPrompt(htmlContent, title);
  const paperCfg = PAPER_SIZES[paperSize];
  const promptAi = buildAiPrintPrompt({ title, htmlContent, paperSize, orientation });

  return {
    schemaVersion: '1.0',
    aplikasi: 'SADARPJOK',
    metadataDokumen: {
      judul: title,
      ukuranKertas: paperSize,
      labelUkuranKertas: paperCfg.label,
      dimensiMm: {
        width: orientation === 'portrait' ? paperCfg.widthMm : paperCfg.heightMm,
        height: orientation === 'portrait' ? paperCfg.heightMm : paperCfg.widthMm,
      },
      orientasi: orientation,
      marginCm: 1.5,
      jumlahTabelData: dataTables.length,
      tanggalEkspor: new Date().toISOString(),
    },
    instruksiCetakSiapPakai: {
      formatKertas: `${paperCfg.label} (${orientation === 'landscape' ? 'Landscape / Mendatar' : 'Portrait / Tegak'})`,
      aturanTataLetak: [
        `Susun dokumen agar siap cetak langsung pada ukuran kertas ${paperCfg.label} dengan margin 1,5 cm di semua sisi.`,
        'Tampilkan KOP surat / judul dokumen di bagian atas, tabel identitas tanpa garis tepi yang sejajar, isi dokumen lengkap, dan blok tanda tangan resmi di bagian bawah.',
        'Jangan memotong isi atau menyertakan komentar tambahan di luar naskah cetak.',
      ],
      aturanKerapianTabel: [
        'Jika output berupa tabel, wajib disajikan dalam bentuk tabel rapi bergaris tegas (1px solid) dengan header tebal.',
        'Kolom No, JP, Skor, Kunci, dan Semester wajib rata tengah; kolom materi/indikator/uraian rata kiri dengan pembungkusan teks rapi (word-wrap).',
        'Pastikan lebar seluruh kolom proporsional sesuai lebar kertas F4 agar tabel tidak terpotong saat dicetak.',
      ],
    },
    promptAiSiapCetak: promptAi,
    kontenTerstruktur: {
      teksMarkdown: markdownContent,
      daftarTabel: dataTables.map((t) => ({
        nomorTabel: t.index,
        judulBagian: t.titleHint,
        kolom: t.headers,
        jumlahBaris: t.rows.length,
        baris: t.rows,
        tabelMarkdown: t.markdownTable,
      })),
    },
  };
}

export function downloadJsonPrompt({
  filename,
  title,
  htmlContent,
  paperSize = 'F4',
  orientation = 'portrait',
}: {
  filename: string;
  title: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): void {
  const payload = buildJsonPromptPayload({ title, htmlContent, paperSize, orientation });
  const jsonText = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
  const safeName = filename.replace(/\.(json|docx?|pdf|txt)$/i, '').replace(/[^\w\-]+/g, '_');
  triggerDownload(blob, `${safeName}_${paperSize}_prompt.json`);
}

export function downloadAiPromptTxt({
  filename,
  title,
  htmlContent,
  paperSize = 'F4',
  orientation = 'portrait',
}: {
  filename: string;
  title: string;
  htmlContent: string;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): void {
  const promptText = buildAiPrintPrompt({ title, htmlContent, paperSize, orientation });
  const blob = new Blob([promptText], { type: 'text/plain;charset=utf-8' });
  const safeName = filename.replace(/\.(json|docx?|pdf|txt)$/i, '').replace(/[^\w\-]+/g, '_');
  triggerDownload(blob, `${safeName}_${paperSize}_prompt_AI.txt`);
}

export function restorePlainCellText(cellText: string): string {
  return String(cellText || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\\\|/g, '|')
    .trim();
}

export function extractSelectableTablesForColumns(
  htmlContent: string,
  fallbackTitle: string = 'Dokumen SADARPJOK'
): ExtractedTable[] {
  const { markdownContent, dataTables } = extractDocumentForPrompt(htmlContent, fallbackTitle);
  if (dataTables.length > 0) {
    return dataTables;
  }

  const lines = markdownContent.split('\n');
  const sections: Array<{ heading: string; contentLines: string[] }> = [];
  let currentHeading = 'Informasi Umum / Pembuka';
  let currentLines: string[] = [];

  const pushCurrent = () => {
    const content = currentLines.join('\n').trim();
    if (content) {
      sections.push({ heading: currentHeading, contentLines: currentLines });
    }
    currentLines = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '---') {
      if (currentLines.length > 0 && currentLines[currentLines.length - 1] !== '') {
        currentLines.push('');
      }
      continue;
    }
    const hMatch = line.match(/^#{1,4}\s+(.*)$/);
    if (hMatch) {
      pushCurrent();
      currentHeading = hMatch[1].replace(/\*\*/g, '').trim() || 'Bagian Dokumen';
      continue;
    }
    currentLines.push(raw.trimEnd());
  }
  pushCurrent();

  const rows: string[][] =
    sections.length > 0
      ? sections.map((sec, idx) => [
          String(idx + 1),
          cleanSingleLineCell(sec.heading),
          cleanSingleLineCell(sec.contentLines.join('\n').replace(/\*\*/g, '')),
        ])
      : [['1', cleanSingleLineCell(fallbackTitle), cleanSingleLineCell(markdownContent)]];

  const headers = ['No', 'Bagian Dokumen', 'Isi Konten'];
  return [
    {
      index: 1,
      titleHint: fallbackTitle || 'Ringkasan Bagian Dokumen',
      borderless: false,
      headers,
      rows,
      markdownTable: formatNeatMarkdownTable(headers, rows, ['center', 'left', 'left']),
    },
  ];
}

export interface ColumnSubsetData {
  headers: string[];
  rows: string[][];
  selectedColIndices: number[];
}

export function buildColumnSubsetData(
  table: ExtractedTable,
  selectedColIndices: number[]
): ColumnSubsetData {
  const validIndices = Array.from(
    new Set(
      selectedColIndices.filter(
        (idx) => Number.isInteger(idx) && idx >= 0 && idx < table.headers.length
      )
    )
  ).sort((a, b) => a - b);

  const effectiveIndices =
    validIndices.length > 0 ? validIndices : table.headers.map((_, idx) => idx);

  const headers = effectiveIndices.map((idx) =>
    restorePlainCellText(table.headers[idx] || `Kolom ${idx + 1}`)
  );

  const rows = table.rows.map((row) =>
    effectiveIndices.map((idx) => restorePlainCellText(row[idx] ?? ''))
  );

  return {
    headers,
    rows,
    selectedColIndices: effectiveIndices,
  };
}

export function buildColumnSubsetHtml({
  title,
  tableTitle,
  headers,
  rows,
  paperSize = 'F4',
  orientation = 'portrait',
}: {
  title: string;
  tableTitle?: string;
  headers: string[];
  rows: string[][];
  paperSize?: PaperSize;
  orientation?: PageOrientation;
}): string {
  const theadCells = headers
    .map((h) => `<th>${escapeHtml(h).replace(/\n/g, '<br/>')}</th>`)
    .join('');

  const tbodyRows = rows
    .map((row) => {
      const tds = row
        .map((cell, idx) => {
          const headerName = headers[idx] || '';
          const trimmed = cell.trim();
          const align =
            isAutoCenterHeader(headerName) || /^\d{1,3}\.?$/.test(trimmed)
              ? 'center'
              : 'left';
          const alignAttr = align === 'center' ? ' style="text-align:center;"' : '';
          return `<td${alignAttr}>${escapeHtml(cell).replace(/\n/g, '<br/>')}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n');

  const subtitleParts = [
    tableTitle && tableTitle !== title ? `Bagian: ${escapeHtml(tableTitle)}` : '',
    `Kolom Terpilih: ${headers.map((h) => escapeHtml(h)).join(', ')}`,
    `Format Cetak: ${escapeHtml(PAPER_SIZES[paperSize].label)}`,
  ].filter(Boolean);

  const bodyHtml = `
    <h1>${escapeHtml(title)}</h1>
    <p style="text-align:center;font-size:9.5pt;color:#475569;margin-bottom:10px;">
      ${subtitleParts.join(' &bull; ')}
    </p>
    <table class="data-table" border="1" cellpadding="6" cellspacing="0">
      <thead><tr>${theadCells}</tr></thead>
      <tbody>${tbodyRows}</tbody>
    </table>
  `;

  return buildStandardWordHtml({
    title,
    bodyHtml,
    paperSize,
    orientation,
  });
}

function sanitizeColumnSuffix(colLabel?: string): string {
  if (!colLabel) return 'PerKolom';
  const cleaned = colLabel
    .replace(/[^\w\-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 36);
  return cleaned || 'PerKolom';
}

export function downloadExcelFromTable({
  filename,
  title,
  tableTitle,
  headers,
  rows,
  colLabel,
}: {
  filename: string;
  title: string;
  tableTitle?: string;
  headers: string[];
  rows: string[][];
  colLabel?: string;
}): void {
  const thead = headers
    .map(
      (h) =>
        `<th style="background-color:#0f766e;color:#ffffff;font-weight:bold;border:1px solid #000000;padding:6px 8px;text-align:center;vertical-align:middle;">${escapeHtml(h).replace(/\n/g, '<br style="mso-data-placement:same-cell;" />')}</th>`
    )
    .join('');

  const tbody = rows
    .map((row, rIdx) => {
      const bg = rIdx % 2 === 1 ? '#f8fafc' : '#ffffff';
      const tds = row
        .map((cell, cIdx) => {
          const headerName = headers[cIdx] || '';
          const trimmed = cell.trim();
          const isPureNum = /^\d+(\.\d+)?$/.test(trimmed);
          const align =
            isAutoCenterHeader(headerName) || /^\d{1,3}\.?$/.test(trimmed)
              ? 'center'
              : 'left';
          const numFmt = isPureNum ? '' : "mso-number-format:'\\@';";
          return `<td style="background-color:${bg};border:1px solid #000000;padding:5px 8px;text-align:${align};vertical-align:top;${numFmt}">${escapeHtml(cell).replace(/\n/g, '<br style="mso-data-placement:same-cell;" />')}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('\n');

  const metaLine = tableTitle ? `<p style="font-size:10pt;color:#334155;">${escapeHtml(tableTitle)}</p>` : '';

  const excelHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Data Per Kolom</x:Name>
          <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <h3 style="margin:0 0 4px 0;">${escapeHtml(title)}</h3>
  ${metaLine}
  <table border="1">
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(['\ufeff', excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const safeName = filename.replace(/\.(xlsx?|csv|docx?|pdf|json|txt)$/i, '').replace(/[^\w\-]+/g, '_');
  const suffix = sanitizeColumnSuffix(colLabel);
  triggerDownload(blob, `${safeName}_${suffix}.xls`);
}

export function downloadCsvFromTable({
  filename,
  headers,
  rows,
  colLabel,
}: {
  filename: string;
  headers: string[];
  rows: string[][];
  colLabel?: string;
}): void {
  const csvEscape = (val: string) => {
    const str = String(val ?? '');
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ];

  const blob = new Blob(['\ufeff', lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const safeName = filename.replace(/\.(xlsx?|csv|docx?|pdf|json|txt)$/i, '').replace(/[^\w\-]+/g, '_');
  const suffix = sanitizeColumnSuffix(colLabel);
  triggerDownload(blob, `${safeName}_${suffix}.csv`);
}

export function formatColumnSubsetForClipboard(headers: string[], rows: string[][]): string {
  if (headers.length === 1) {
    const header = headers[0];
    const values = rows.map((r) => (r[0] || '').replace(/\n+/g, ' ').trim());
    return [header, ...values].join('\n');
  }
  return [
    headers.map((h) => h.replace(/\t|\n+/g, ' ').trim()).join('\t'),
    ...rows.map((r) => r.map((c) => (c || '').replace(/\t|\n+/g, ' ').trim()).join('\t')),
  ].join('\n');
}
