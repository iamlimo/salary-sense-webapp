
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Files, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  exportPayrollToExcel,
  exportPayrollToCsv,
  exportPayrollToPdf,
} from "@/utils/exportUtils";
import {
  fetchPayrollPeriods,
  fetchPayrollWithEntries,
  formatPayrollPeriod,
  type PayrollPeriod,
  type PayrollEntry,
  type PayrollWithEntries,
} from "@/services/payrollService";
import { useQuery } from "@tanstack/react-query";

const Payroll = () => {
  const [selectedPayroll, setSelectedPayroll] = useState<string | null>(null);
  const [currentPayrollData, setCurrentPayrollData] = useState<PayrollWithEntries | null>(null);

  // Fetch all payroll periods
  const { 
    data: payrollPeriods, 
    isLoading: isLoadingPayrolls,
    error: payrollError 
  } = useQuery({
    queryKey: ['payrollPeriods'],
    queryFn: fetchPayrollPeriods
  });

  // Fetch details for the selected payroll
  const {
    data: payrollDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useQuery({
    queryKey: ['payrollDetails', selectedPayroll],
    queryFn: () => selectedPayroll ? fetchPayrollWithEntries(selectedPayroll) : null,
    enabled: !!selectedPayroll
  });

  // Update current payroll data when selection changes
  useEffect(() => {
    if (payrollDetails) {
      setCurrentPayrollData(payrollDetails);
    }
  }, [payrollDetails]);

  // Handle errors
  useEffect(() => {
    if (payrollError) {
      toast.error("Failed to load payrolls");
      console.error("Payroll error:", payrollError);
    }
    if (detailsError) {
      toast.error("Failed to load payroll details");
      console.error("Detail error:", detailsError);
    }
  }, [payrollError, detailsError]);

  const handleExport = (format: "excel" | "csv" | "pdf", payrollId: string) => {
    if (!currentPayrollData && selectedPayroll !== payrollId) {
      toast.loading("Loading payroll data for export...");
      fetchPayrollWithEntries(payrollId)
        .then((data) => {
          performExport(format, data);
        })
        .catch((err) => {
          console.error("Export error:", err);
          toast.error(`Failed to export payroll as ${format.toUpperCase()}`);
        });
    } else if (currentPayrollData) {
      performExport(format, currentPayrollData);
    }
  };

  const performExport = (format: "excel" | "csv" | "pdf", payrollData: PayrollWithEntries) => {
    try {
      const exportData = {
        id: payrollData.id,
        period: formatPayrollPeriod(payrollData.start_date, payrollData.end_date),
        status: payrollData.status,
        total: payrollData.total_amount,
        details: payrollData.entries.map(entry => ({
          name: entry.employee_name,
          baseSalary: entry.base_salary,
          taxes: entry.taxes,
          net: entry.net_pay
        }))
      };
      
      switch (format) {
        case "excel":
          exportPayrollToExcel(exportData);
          break;
        case "csv":
          exportPayrollToCsv(exportData);
          break;
        case "pdf":
          exportPayrollToPdf(exportData);
          break;
      }
      toast.success(`Payroll exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export payroll as ${format.toUpperCase()}`);
    }
  };

  const viewPayrollDetails = (payrollId: string) => {
    setSelectedPayroll(payrollId === selectedPayroll ? null : payrollId);
  };

  // Find the next upcoming payroll period
  const findCurrentPayPeriod = () => {
    if (!payrollPeriods || payrollPeriods.length === 0) return null;

    const today = new Date();
    const upcoming = payrollPeriods
      .filter(period => new Date(period.payment_date) >= today)
      .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())[0];

    if (upcoming) {
      return {
        startDate: new Date(upcoming.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        endDate: new Date(upcoming.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        payDate: new Date(upcoming.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
    }
    
    // If no upcoming payroll, use the most recent one for the UI
    const latest = [...payrollPeriods].sort((a, b) => 
      new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    )[0];
    
    // Get the next period after the most recent one
    const start = new Date(latest.end_date);
    start.setDate(start.getDate() + 1);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 14); // Assuming 15-day periods
    
    const payDate = new Date(end);
    payDate.setDate(payDate.getDate() + 5); // Assuming payment 5 days after period end
    
    return {
      startDate: start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      endDate: end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      payDate: payDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const currentPeriod = findCurrentPayPeriod();

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
                <p className="font-medium">
                  {isLoadingPayrolls ? "Loading..." : currentPeriod?.startDate || "Not available"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">
                  {isLoadingPayrolls ? "Loading..." : currentPeriod?.endDate || "Not available"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Pay Date</p>
                <p className="font-medium">
                  {isLoadingPayrolls ? "Loading..." : currentPeriod?.payDate || "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Recent Payrolls</h2>
            {isLoadingPayrolls ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-lg text-gray-500">Loading payrolls...</span>
              </div>
            ) : payrollError ? (
              <div className="text-center py-8 text-red-500">
                Failed to load payrolls. Please try again later.
              </div>
            ) : !payrollPeriods || payrollPeriods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payroll periods found.
              </div>
            ) : (
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
                    {payrollPeriods.map((payroll) => (
                      <React.Fragment key={payroll.id}>
                        <TableRow>
                          <TableCell>
                            {formatPayrollPeriod(payroll.start_date, payroll.end_date)}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {payroll.status}
                            </span>
                          </TableCell>
                          <TableCell>₦{payroll.total_amount.toLocaleString()}</TableCell>
                          <TableCell className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewPayrollDetails(payroll.id)}
                              disabled={isLoadingDetails && selectedPayroll === payroll.id}
                            >
                              {isLoadingDetails && selectedPayroll === payroll.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                selectedPayroll === payroll.id ? "Hide" : "View"
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Export
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleExport("excel", payroll.id)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Excel (.xlsx)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExport("csv", payroll.id)}
                                >
                                  <Files className="h-4 w-4 mr-2" />
                                  CSV (.csv)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExport("pdf", payroll.id)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  PDF (.pdf)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>

                        {selectedPayroll === payroll.id && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-gray-50 p-0">
                              {detailsError ? (
                                <div className="p-4 text-red-500">
                                  Failed to load payroll details. Please try again later.
                                </div>
                              ) : isLoadingDetails ? (
                                <div className="p-4 flex justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                </div>
                              ) : payrollDetails ? (
                                <div className="p-4">
                                  <h3 className="font-medium mb-2">
                                    Payroll Details
                                  </h3>
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
                                      {payrollDetails.entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                          <TableCell>{entry.employee_name}</TableCell>
                                          <TableCell>
                                            ₦{entry.base_salary.toLocaleString()}
                                          </TableCell>
                                          <TableCell>
                                            ₦{entry.taxes.toLocaleString()}
                                          </TableCell>
                                          <TableCell>
                                            ₦{entry.net_pay.toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
