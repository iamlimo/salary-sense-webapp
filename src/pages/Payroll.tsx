
import React, { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCsv, FileExcel, FilePdf, Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { exportPayrollToExcel, exportPayrollToCsv, exportPayrollToPdf } from '@/utils/exportUtils';

const Payroll = () => {
  const [selectedPayroll, setSelectedPayroll] = useState<number | null>(null);
  
  // Mock payroll data
  const payrollData = [
    {
      id: 1,
      period: 'Mar 16-31, 2025',
      status: 'Paid',
      total: 24500.00,
      details: [
        { name: 'Employee A', baseSalary: 10000, taxes: 2000, net: 8000 },
        { name: 'Employee B', baseSalary: 12000, taxes: 2400, net: 9600 },
        { name: 'Employee C', baseSalary: 8000, taxes: 1600, net: 6400 },
      ]
    },
    {
      id: 2,
      period: 'Mar 1-15, 2025',
      status: 'Paid',
      total: 24350.00,
      details: [
        { name: 'Employee A', baseSalary: 10000, taxes: 2000, net: 8000 },
        { name: 'Employee B', baseSalary: 12000, taxes: 2400, net: 9600 },
        { name: 'Employee C', baseSalary: 7500, taxes: 1500, net: 6000 },
      ]
    },
    {
      id: 3,
      period: 'Feb 16-28, 2025',
      status: 'Paid',
      total: 23900.00,
      details: [
        { name: 'Employee A', baseSalary: 9800, taxes: 1960, net: 7840 },
        { name: 'Employee B', baseSalary: 12000, taxes: 2400, net: 9600 },
        { name: 'Employee C', baseSalary: 8200, taxes: 1640, net: 6560 },
      ]
    },
  ];
  
  const handleExport = (format: 'excel' | 'csv' | 'pdf', payrollId: number) => {
    const payroll = payrollData.find(p => p.id === payrollId);
    if (!payroll) return;
    
    try {
      switch(format) {
        case 'excel':
          exportPayrollToExcel(payroll);
          break;
        case 'csv':
          exportPayrollToCsv(payroll);
          break;
        case 'pdf':
          exportPayrollToPdf(payroll);
          break;
      }
      toast.success(`Payroll exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export payroll as ${format.toUpperCase()}`);
    }
  };
  
  const viewPayrollDetails = (payrollId: number) => {
    setSelectedPayroll(payrollId === selectedPayroll ? null : payrollId);
  };
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payroll Management</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Current Pay Period</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">April 15, 2025</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">April 30, 2025</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Pay Date</p>
                <p className="font-medium">May 5, 2025</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Recent Payrolls</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((payroll) => (
                    <React.Fragment key={payroll.id}>
                      <TableRow>
                        <TableCell>{payroll.period}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {payroll.status}
                          </span>
                        </TableCell>
                        <TableCell>${payroll.total.toLocaleString()}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewPayrollDetails(payroll.id)}
                          >
                            {selectedPayroll === payroll.id ? 'Hide' : 'View'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Export
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleExport('excel', payroll.id)}>
                                <FileExcel className="h-4 w-4 mr-2" />
                                Excel (.xlsx)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport('csv', payroll.id)}>
                                <FileCsv className="h-4 w-4 mr-2" />
                                CSV (.csv)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport('pdf', payroll.id)}>
                                <FilePdf className="h-4 w-4 mr-2" />
                                PDF (.pdf)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                      {selectedPayroll === payroll.id && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <h3 className="font-medium mb-2">Payroll Details</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Base Salary</TableHead>
                                    <TableHead>Taxes</TableHead>
                                    <TableHead>Net Pay</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {payroll.details.map((detail, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{detail.name}</TableCell>
                                      <TableCell>${detail.baseSalary.toLocaleString()}</TableCell>
                                      <TableCell>${detail.taxes.toLocaleString()}</TableCell>
                                      <TableCell>${detail.net.toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
