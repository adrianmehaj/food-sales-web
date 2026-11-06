import { api } from '../api';
import type { Page } from '../types';
import reportFont from '../../assets/fonts/Lato-Regular.ttf?url';

export interface ExportTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  moneyColumns?: number[];
}
export interface ExportReport {
  title: string;
  subtitle: string;
  filename: string;
  tables: ExportTable[];
}

export async function allReportPages<T>(path: string): Promise<T[]> {
  const rows: T[] = [];
  let page = 1;
  do {
    const result = await api<Page<T>>(
      path + (path.includes('?') ? '&' : '?') + `page=${page}&pageSize=100`
    );
    if (result.totalCount > 5000)
      throw new Error(
        'Eksporti mbështet deri në 5,000 rreshta. Ngushtoni filtrin ose eksportoni klientin veçmas.'
      );
    rows.push(...result.items);
    if (page >= result.totalPages) return rows;
    page++;
  } while (page <= 50);
  throw new Error('Raporti është shumë i madh për eksport nga shfletuesi.');
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export async function exportExcel(report: ExportReport) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tryeza - Produkte Bio';
  workbook.created = new Date();
  for (const table of report.tables) {
    const sheet = workbook.addWorksheet(table.title.slice(0, 31), {
      views: [{ state: 'frozen', ySplit: 5 }],
    });
    const count = Math.max(2, table.headers.length);
    sheet.mergeCells(1, 1, 1, count);
    sheet.getCell(1, 1).value = 'Tryeza - Produkte Bio';
    sheet.getCell(1, 1).font = { size: 20, bold: true, color: { argb: 'FF234D38' } };
    sheet.getRow(1).height = 36;
    sheet.mergeCells(2, 1, 2, count);
    sheet.getCell(2, 1).value = report.title;
    sheet.mergeCells(3, 1, 3, count);
    sheet.getCell(3, 1).value = report.subtitle;
    sheet.getRow(5).values = table.headers;
    sheet.getRow(5).height = 26;
    sheet.getRow(5).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF234D38' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });
    table.rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column, index) => {
      column.width = index === 0 ? 28 : 22;
    });
    for (let row = 6; row <= sheet.rowCount; row++) {
      sheet.getRow(row).height = 24;
      sheet.getRow(row).eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (row % 2 === 0)
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F5EE' } };
      });
      table.moneyColumns?.forEach((index) => {
        sheet.getCell(row, index + 1).numFmt = '#,##0.00 "€"';
      });
    }
    if (table.rows.length)
      sheet.autoFilter = {
        from: { row: 5, column: 1 },
        to: { row: sheet.rowCount, column: table.headers.length },
      };
    sheet.pageSetup = {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };
  }
  const buffer = await workbook.xlsx.writeBuffer();
  download(
    new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    report.filename + '.xlsx'
  );
}
export async function exportPdf(report: ExportReport) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const response = await fetch(reportFont);
  if (!response.ok) throw new Error('Fonti i raportit nuk u ngarkua. Provoni përsëri.');
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.addFileToVFS('Lato.ttf', btoa(binary));
  doc.addFont('Lato.ttf', 'Lato', 'normal');
  doc.addFont('Lato.ttf', 'Lato', 'bold');
  doc.setFont('Lato');
  doc.setProperties({ title: report.title, author: 'Tryeza - Produkte Bio' });
  report.tables.forEach((table, index) => {
    if (index) doc.addPage();
    doc.setTextColor('#234d38');
    doc.setFontSize(21);
    doc.text('Tryeza - Produkte Bio', 15, 18);
    doc.setFontSize(14);
    const titleLines = doc.splitTextToSize(report.title + ' · ' + table.title, 265);
    doc.text(titleLines, 15, 29);
    const subtitleY = 32 + titleLines.length * 6;
    doc.setTextColor('#6f786e');
    doc.setFontSize(10);
    const subtitleLines = doc.splitTextToSize(report.subtitle, 265);
    doc.text(subtitleLines, 15, subtitleY);
    autoTable(doc, {
      startY: subtitleY + subtitleLines.length * 4.5 + 6,
      margin: { top: 18, left: 15, right: 15, bottom: 18 },
      head: [table.headers],
      body: table.rows.map((row) =>
        row.map((cell, column) =>
          table.moneyColumns?.includes(column) && typeof cell === 'number'
            ? `${cell.toFixed(2)} €`
            : cell
        )
      ),
      styles: { font: 'Lato', fontSize: 9, cellPadding: 3.2, overflow: 'linebreak' },
      headStyles: { fillColor: [35, 77, 56] },
      alternateRowStyles: { fillColor: [244, 247, 240] },
    });
  });
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    doc.setFont('Lato');
    doc.setFontSize(9);
    doc.setTextColor('#7c827a');
    doc.text('Raport informues · Shitjet dhe arkëtimet mbahen veçmas.', 15, 202);
    doc.text(`${page} / ${total}`, 280, 202, { align: 'right' });
  }
  download(doc.output('blob'), report.filename + '.pdf');
}
