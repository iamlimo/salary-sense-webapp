import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type PayrollDetail = {
  name: string;
  baseSalary: number;
  taxes: number;
  net: number;
};

type Payroll = {
  id: number;
  period: string;
  status: string;
  total: number;
  details: PayrollDetail[];
};

export const exportPayrollToExcel = (payroll: Payroll) => {
  const data = [
    ['Employee', 'Base Salary', 'Taxes', 'Net Pay'],
    ...payroll.details.map(detail => [
      detail.name,
      detail.baseSalary,
      detail.taxes,
      detail.net
    ])
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Details');

  // Add summary information
  const summaryWorksheet = XLSX.utils.aoa_to_sheet([
    ['Period', payroll.period],
    ['Status', payroll.status],
    ['Total', payroll.total]
  ]);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  // Generate and download file
  XLSX.writeFile(workbook, `Payroll-${payroll.period}.xlsx`);
};

export const exportPayrollToCsv = (payroll: Payroll) => {
  const headers = 'Employee,Base Salary,Taxes,Net Pay\n';
  const rows = payroll.details.map(detail => 
    `${detail.name},${detail.baseSalary},${detail.taxes},${detail.net}`
  ).join('\n');
  
  const csvContent = headers + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Payroll-${payroll.period}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPayrollToPdf = (payroll: Payroll) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Payroll Report: ${payroll.period}`, 14, 22);
  
  // Add summary
  doc.setFontSize(12);
  doc.text(`Status: ${payroll.status}`, 14, 32);
  doc.text(`Total: $${payroll.total.toLocaleString()}`, 14, 38);
  
  // Create table
  autoTable(doc, {
    head: [['Employee', 'Base Salary', 'Taxes', 'Net Pay']],
    body: payroll.details.map(detail => [
      detail.name, 
      `$${detail.baseSalary.toLocaleString()}`, 
      `$${detail.taxes.toLocaleString()}`, 
      `$${detail.net.toLocaleString()}`
    ]),
    startY: 45
  });
  
  // Save PDF
  doc.save(`Payroll-${payroll.period}.pdf`);
};
