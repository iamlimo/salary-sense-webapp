
import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { generateExcelTemplate, parsePayrollExcel, ExcelPayrollData } from '@/utils/excelUtils';

interface ExcelUploaderProps {
  onDataImported: (data: ExcelPayrollData[]) => void;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataImported }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's an Excel file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await parsePayrollExcel(file);
      if (data.length === 0) {
        toast.error('No data found in the Excel file');
        return;
      }
      
      onDataImported(data);
      toast.success(`Successfully imported ${data.length} employee records`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      toast.error('Failed to parse Excel file. Please check the format.');
    } finally {
      setIsLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };
  
  const downloadTemplate = () => {
    try {
      generateExcelTemplate();
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to download template');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-auto flex-1">
          <Button 
            variant="outline" 
            className="w-full relative overflow-hidden"
            disabled={isLoading}
          >
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              disabled={isLoading}
            />
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? 'Processing...' : 'Upload Excel'}
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={downloadTemplate}
          className="w-full md:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center">
        <FileSpreadsheet className="mr-2 h-4 w-4 text-gray-400" />
        Upload an Excel file with employee payroll details (.xlsx or .xls)
      </div>
    </div>
  );
};
