
export type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  joiningDate: Date;
  status: 'active' | 'onLeave' | 'terminated';
};

export type PayrollRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  grossAmount: number;
  netAmount: number;
  taxes: number;
  deductions: number;
  status: 'pending' | 'processed' | 'failed';
};

export const employees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    position: 'Software Engineer',
    department: 'Engineering',
    salary: 120000,
    joiningDate: new Date('2020-05-15'),
    status: 'active',
  },
  {
    id: '2',
    name: 'Alice Johnson',
    position: 'UX Designer',
    department: 'Design',
    salary: 95000,
    joiningDate: new Date('2021-02-10'),
    status: 'active',
  },
  {
    id: '3',
    name: 'Robert Wilson',
    position: 'Project Manager',
    department: 'Management',
    salary: 140000,
    joiningDate: new Date('2019-11-05'),
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Clark',
    position: 'Marketing Specialist',
    department: 'Marketing',
    salary: 85000,
    joiningDate: new Date('2022-01-20'),
    status: 'onLeave',
  },
  {
    id: '5',
    name: 'Michael Brown',
    position: 'Finance Analyst',
    department: 'Finance',
    salary: 110000,
    joiningDate: new Date('2020-08-12'),
    status: 'active',
  },
  {
    id: '6',
    name: 'Sophia Garcia',
    position: 'HR Manager',
    department: 'HR',
    salary: 125000,
    joiningDate: new Date('2019-06-23'),
    status: 'active',
  },
  {
    id: '7',
    name: 'David Martinez',
    position: 'Sales Executive',
    department: 'Sales',
    salary: 92000,
    joiningDate: new Date('2021-07-14'),
    status: 'terminated',
  },
];

export const payrollRecords: PayrollRecord[] = [
  {
    id: 'pr1',
    employeeId: '1',
    employeeName: 'John Smith',
    date: new Date('2024-04-28'),
    grossAmount: 10000,
    netAmount: 7200,
    taxes: 2500,
    deductions: 300,
    status: 'processed',
  },
  {
    id: 'pr2',
    employeeId: '2',
    employeeName: 'Alice Johnson',
    date: new Date('2024-04-28'),
    grossAmount: 7916.67,
    netAmount: 5850,
    taxes: 1850,
    deductions: 216.67,
    status: 'processed',
  },
  {
    id: 'pr3',
    employeeId: '3',
    employeeName: 'Robert Wilson',
    date: new Date('2024-04-28'),
    grossAmount: 11666.67,
    netAmount: 8500,
    taxes: 2900,
    deductions: 266.67,
    status: 'processed',
  },
  {
    id: 'pr4',
    employeeId: '4',
    employeeName: 'Emily Clark',
    date: new Date('2024-04-28'),
    grossAmount: 7083.33,
    netAmount: 5300,
    taxes: 1600,
    deductions: 183.33,
    status: 'processed',
  },
  {
    id: 'pr5',
    employeeId: '5',
    employeeName: 'Michael Brown',
    date: new Date('2024-04-28'),
    grossAmount: 9166.67,
    netAmount: 6700,
    taxes: 2200,
    deductions: 266.67,
    status: 'processed',
  },
  {
    id: 'pr6',
    employeeId: '1',
    employeeName: 'John Smith',
    date: new Date('2024-05-28'),
    grossAmount: 10000,
    netAmount: 7200,
    taxes: 2500,
    deductions: 300,
    status: 'pending',
  },
  {
    id: 'pr7',
    employeeId: '2',
    employeeName: 'Alice Johnson',
    date: new Date('2024-05-28'),
    grossAmount: 7916.67,
    netAmount: 5850,
    taxes: 1850,
    deductions: 216.67,
    status: 'pending',
  },
];

export const paydaySchedule = [
  {
    date: new Date('2024-05-28'),
    employeeCount: 6,
    totalAmount: 45833.34,
  },
  {
    date: new Date('2024-06-28'),
    employeeCount: 6,
    totalAmount: 45833.34,
  },
  {
    date: new Date('2024-07-28'),
    employeeCount: 6,
    totalAmount: 45833.34,
  },
];

export const departmentSalaryData = [
  { name: 'Engineering', value: 120000 },
  { name: 'Design', value: 95000 },
  { name: 'Management', value: 140000 },
  { name: 'Marketing', value: 85000 },
  { name: 'Finance', value: 110000 },
  { name: 'HR', value: 125000 },
  { name: 'Sales', value: 92000 },
];

export const monthlySalaryExpense = [
  { name: 'Jan', amount: 43000 },
  { name: 'Feb', amount: 45000 },
  { name: 'Mar', amount: 45000 },
  { name: 'Apr', amount: 45833 },
  { name: 'May', amount: 45833 },
];
