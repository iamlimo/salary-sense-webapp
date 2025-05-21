
import * as XLSX from 'xlsx';

export type ExcelPayrollData = {
  employeeName: string;
  baseSalary: number;
  hoursWorked?: number;
  hourlyRate?: number;
  bonusAmount?: number;
  taxRate?: number;
  [key: string]: string | number | undefined;
};

export const parsePayrollExcel = (file: File): Promise<ExcelPayrollData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert Excel data to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel columns to our expected data structure
        const payrollData: ExcelPayrollData[] = jsonData.map((row: any) => {
          return {
            employeeName: row['Employee Name'] || row['EmployeeName'] || row['Name'] || '',
            baseSalary: Number(row['Base Salary'] || row['BaseSalary'] || row['Salary'] || 0),
            hoursWorked: row['Hours Worked'] || row['HoursWorked'] || undefined,
            hourlyRate: row['Hourly Rate'] || row['HourlyRate'] || undefined,
            bonusAmount: row['Bonus'] || row['BonusAmount'] || undefined,
            taxRate: row['Tax Rate'] || row['TaxRate'] || undefined,
            // Additional fields might be present and will be handled by the [key: string] type
            ...row
          };
        });
        
        resolve(payrollData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Create a sample Excel template that users can download
export const generateExcelTemplate = (): void => {
  const data = [
    {
      'Employee Name': 'John Doe',
      'Base Salary': 50000,
      'Hours Worked': 40,
      'Hourly Rate': 0,
      'Bonus Amount': 1000,
      'Tax Rate': 20
    },
    {
      'Employee Name': 'Jane Smith',
      'Base Salary': 60000,
      'Hours Worked': 0,
      'Hourly Rate': 0,
      'Bonus Amount': 500,
      'Tax Rate': 20
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Template');
  
  XLSX.writeFile(workbook, 'payroll_template.xlsx');
};
