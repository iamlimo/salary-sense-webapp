
import * as XLSX from 'xlsx';

export type ExcelPayrollData = {
  employeeName: string;
  baseSalary: number; // Will map to basic_salary
  housingAllowance?: number;
  transportAllowance?: number;
  utilityAllowance?: number;
  lunchAllowance?: number;
  entertainmentAllowance?: number;
  leaveAllowance?: number;
  otherAllowances?: number;
  bonusAmount?: number; // Will map to bonus
  overtime?: number;
  employeeDeductions?: number;
  loanRepayment?: number;
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
            baseSalary: Number(row['Basic Salary'] || row['BasicSalary'] || row['Base Salary'] || row['BaseSalary'] || 0),
            housingAllowance: Number(row['Housing Allowance'] || row['HousingAllowance'] || 0),
            transportAllowance: Number(row['Transport Allowance'] || row['TransportAllowance'] || 0),
            utilityAllowance: Number(row['Utility Allowance'] || row['UtilityAllowance'] || 0),
            lunchAllowance: Number(row['Lunch Allowance'] || row['LunchAllowance'] || 0),
            entertainmentAllowance: Number(row['Entertainment Allowance'] || row['EntertainmentAllowance'] || 0),
            leaveAllowance: Number(row['Leave Allowance'] || row['LeaveAllowance'] || 0),
            otherAllowances: Number(row['Other Allowances'] || row['OtherAllowances'] || 0),
            bonusAmount: Number(row['Bonus'] || row['BonusAmount'] || 0),
            overtime: Number(row['Overtime'] || 0),
            employeeDeductions: Number(row['Employee Deductions'] || row['EmployeeDeductions'] || 0),
            loanRepayment: Number(row['Loan Repayment'] || row['LoanRepayment'] || 0),
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
      'Basic Salary': 50000,
      'Housing Allowance': 10000,
      'Transport Allowance': 5000,
      'Utility Allowance': 2000,
      'Lunch Allowance': 1000,
      'Entertainment Allowance': 1000,
      'Leave Allowance': 0,
      'Other Allowances': 0,
      'Bonus': 1000,
      'Overtime': 0,
      'Employee Deductions': 0,
      'Loan Repayment': 0
    },
    {
      'Employee Name': 'Jane Smith',
      'Basic Salary': 60000,
      'Housing Allowance': 12000,
      'Transport Allowance': 6000,
      'Utility Allowance': 2400,
      'Lunch Allowance': 1200,
      'Entertainment Allowance': 1200,
      'Leave Allowance': 0,
      'Other Allowances': 0,
      'Bonus': 500,
      'Overtime': 0,
      'Employee Deductions': 0,
      'Loan Repayment': 0
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nigerian Payroll Template');
  
  XLSX.writeFile(workbook, 'nigeria_payroll_template.xlsx');
};
