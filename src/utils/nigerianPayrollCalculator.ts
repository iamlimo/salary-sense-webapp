
/**
 * Nigerian Payroll Calculator
 * Calculates monthly payroll for employees in Nigeria, including PAYE (Lagos), Pension, and NHIS deductions.
 */

export interface NigerianPayrollInput {
  basic_salary: number;
  housing_allowance?: number;
  transport_allowance?: number;
  utility_allowance?: number;
  lunch_allowance?: number;
  entertainment_allowance?: number;
  leave_allowance?: number;
  other_allowances?: number;
  bonus?: number;
  overtime?: number;
  employee_deductions?: number;
  loan_repayment?: number;
}

export interface NigerianPayrollOutput {
  gross_income: number;
  employee_pension: number;
  employer_pension: number;
  nhis: number;
  monthly_paye: number;
  net_pay: number;
  details?: Record<string, number>;
}

export const calculateNigerianPayroll = (input: NigerianPayrollInput): NigerianPayrollOutput => {
  const {
    basic_salary,
    housing_allowance = 0,
    transport_allowance = 0,
    utility_allowance = 0,
    lunch_allowance = 0,
    entertainment_allowance = 0,
    leave_allowance = 0,
    other_allowances = 0,
    bonus = 0,
    overtime = 0,
    employee_deductions = 0,
    loan_repayment = 0
  } = input;

  const pensionBase = basic_salary + housing_allowance + transport_allowance;
  const grossIncome = basic_salary + housing_allowance + transport_allowance + 
    utility_allowance + lunch_allowance + entertainment_allowance + 
    leave_allowance + other_allowances + bonus + overtime;

  const employeePension = 0.08 * pensionBase;
  const employerPension = 0.10 * pensionBase;
  const nhis = 0.05 * basic_salary;

  const annualGross = grossIncome * 12;
  const cra = Math.max(200000, 0.01 * annualGross) + 0.20 * annualGross;
  const annualTaxable = Math.max(0, annualGross - cra - (employeePension * 12) - (nhis * 12));

  // PAYE Calculation
  let remaining = annualTaxable;
  let annualPaye = 0;
  const bands = [
    { limit: 300000, rate: 0.07 },
    { limit: 300000, rate: 0.11 },
    { limit: 500000, rate: 0.15 },
    { limit: 500000, rate: 0.19 },
    { limit: 1600000, rate: 0.21 },
    { limit: Infinity, rate: 0.24 }
  ];

  for (let band of bands) {
    const taxable = Math.min(remaining, band.limit);
    annualPaye += taxable * band.rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }

  const monthlyPaye = annualPaye / 12;
  const netPay = grossIncome - monthlyPaye - employeePension - nhis - employee_deductions - loan_repayment;

  // Create details object for a breakdown of calculations
  const details: Record<string, number> = {
    basic_salary,
    housing_allowance,
    transport_allowance,
    utility_allowance,
    lunch_allowance,
    entertainment_allowance,
    leave_allowance,
    other_allowances,
    bonus,
    overtime,
    employee_pension: employeePension,
    employer_pension: employerPension,
    nhis,
    monthly_paye: monthlyPaye,
    employee_deductions,
    loan_repayment
  };

  return {
    gross_income: parseFloat(grossIncome.toFixed(2)),
    employee_pension: parseFloat(employeePension.toFixed(2)),
    employer_pension: parseFloat(employerPension.toFixed(2)),
    nhis: parseFloat(nhis.toFixed(2)),
    monthly_paye: parseFloat(monthlyPaye.toFixed(2)),
    net_pay: parseFloat(netPay.toFixed(2)),
    details
  };
};
