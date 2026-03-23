import React, { useState } from 'react';
import { FaDownload, FaCalendarAlt, FaCheckSquare, FaRegSquare, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import api from '../../lib/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AVAILABLE_FIELDS = [
  'Tracking ID',
  'Buyer Name',
  'Buyer Mobile',
  'Address',
  'PinCode',
  'Order Status',
  'Order Date',
  'Weight (kg)',
  'Type',
  'COD Amount',
  'Product Value',
  'Last Updated',
];

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selectedFields, setSelectedFields] = useState([...AVAILABLE_FIELDS]);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const toggleField = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const toggleAll = () => {
    if (selectedFields.length === AVAILABLE_FIELDS.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...AVAILABLE_FIELDS]);
    }
  };

  const executeDownload = async (format) => {
    if (selectedFields.length === 0) {
      alert("Please select at least one field to export.");
      return;
    }

    const isPdf = format === 'pdf';
    isPdf ? setDownloadingPdf(true) : setDownloadingCsv(true);

    try {
      const params = new URLSearchParams();
      params.append('fields', selectedFields.join(','));
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('export_format', format);

      if (isPdf) {
        // Fetch JSON data for PDF
        const response = await api.get(`/api/orders/export/?${params.toString()}`);
        const { header, data } = response.data;

        // Generate PDF
        const doc = new jsPDF('landscape');
        
        // Add Title
        doc.setFontSize(18);
        doc.text('Roadoz Courier Dashboard - Orders Report', 14, 22);
        
        // Add Metadata
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        if (startDate || endDate) {
            const rangeStr = `Date Range: ${startDate || 'Start'} to ${endDate || 'Present'}`;
            doc.text(rangeStr, 14, 36);
        }

        // Prepare table data mapping JSON array of objects to array of arrays based on header
        const tableBody = data.map(item => header.map(h => item[h] || ''));

        // Draw Table
        autoTable(doc, {
          startY: (startDate || endDate) ? 42 : 36,
          head: [header],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 38], textColor: 255 }, // Roadoz gold color
          styles: { fontSize: 8, cellPadding: 2 },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`roadoz_orders_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        // Fetch CSV string text
        const response = await api.get(`/api/orders/export/?${params.toString()}`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `roadoz_orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        
        window.URL.revokeObjectURL(url);
        link.remove();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      isPdf ? setDownloadingPdf(false) : setDownloadingCsv(false);
    }
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <FaFileCsv className="text-[#d4af26]" /> 
            Generate Report
          </h1>
          <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
            Export your shipping and order data. Customize the date range and exactly which columns you need.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Setup & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-5">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--color-border)] pb-2">
              Report Configuration
            </h2>

            <div>
              <label className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-bold mb-2 block">
                Start Date (Optional)
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm" />
                <input 
                  type="date" 
                  className={`${inputClass} w-full pl-9`} 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-bold mb-2 block">
                End Date (Optional)
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm" />
                <input 
                  type="date" 
                  className={`${inputClass} w-full pl-9`} 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex flex-col gap-3">
              <button 
                onClick={() => executeDownload('csv')}
                disabled={downloadingCsv || selectedFields.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-3 rounded-md transition-colors disabled:opacity-50"
              >
                {downloadingCsv ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaFileCsv />
                )}
                {downloadingCsv ? 'Generating CSV...' : 'Download CSV Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Field Selection */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] h-full">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-2">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                Select Columns to Export
              </h2>
              <button 
                onClick={toggleAll}
                className="text-xs font-semibold text-[#d4af26] hover:text-[#c39f19] transition-colors"
              >
                {selectedFields.length === AVAILABLE_FIELDS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-6">
              Choose the specific data points you want included in your export. Unchecked columns will be omitted. Depending on the amount of columns, PDF will auto-scale to fit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {AVAILABLE_FIELDS.map((field) => {
                const isSelected = selectedFields.includes(field);
                return (
                  <div 
                    key={field} 
                    onClick={() => toggleField(field)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-[#d4af26] bg-[#d4af26]/10' 
                        : 'border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {isSelected ? (
                      <FaCheckSquare className="text-[#d4af26] text-lg flex-shrink-0" />
                    ) : (
                      <FaRegSquare className="text-[var(--color-text-secondary)] text-lg flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {field}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedFields.length === 0 && (
              <div className="mt-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
                You must select at least one column to generate a report.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;

