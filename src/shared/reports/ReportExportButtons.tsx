import { useState } from 'react';
import { FileDown, FileSpreadsheet, LoaderCircle } from 'lucide-react';
import type { ExportReport } from './reportExport';
import { useToast } from '../ui';

export function ReportExportButtons({
  load,
  disabled = false,
}: {
  load: () => Promise<ExportReport> | ExportReport;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<'pdf' | 'excel' | null>(null);
  const toast = useToast();
  async function run(format: 'pdf' | 'excel') {
    setBusy(format);
    try {
      const report = await load();
      const exporter = await import('./reportExport');
      await (format === 'pdf' ? exporter.exportPdf(report) : exporter.exportExcel(report));
      toast('Raporti u përgatit për shkarkim.');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="export-buttons">
      <button
        className="button secondary"
        disabled={disabled || !!busy}
        onClick={() => void run('pdf')}
      >
        {busy === 'pdf' ? <LoaderCircle size={17} className="spin" /> : <FileDown size={17} />} PDF
      </button>
      <button
        className="button secondary"
        disabled={disabled || !!busy}
        onClick={() => void run('excel')}
      >
        {busy === 'excel' ? (
          <LoaderCircle size={17} className="spin" />
        ) : (
          <FileSpreadsheet size={17} />
        )}{' '}
        Excel
      </button>
    </div>
  );
}
