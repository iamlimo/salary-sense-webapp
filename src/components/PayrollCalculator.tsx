import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Trash2, Save, Calculator, Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useCustomFields } from '@/contexts/CustomFieldsContext';
import { savePayroll } from '@/services/payrollService';
import { ExcelUploader } from './ExcelUploader';
import { ExcelPayrollData } from '@/utils/excelUtils';
import { calculateNigerianPayroll, NigerianPayrollOutput } from '@/utils/nigerianPayrollCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FieldValues = {
  employeeName: string;
  paymentDate: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  utility_allowance: number;
  lunch_allowance: number;
  entertainment_allowance: number;
  leave_allowance: number;
  other_allowances: number;
  bonus: number;
  overtime: number;
  employee_deductions: number;
  loan_repayment: number;
  [key: string]: string | number | undefined;
};

export function PayrollCalculator() {
  const { customFields, addCustomField, removeCustomField } = useCustomFields();
  const [calculatedPayroll, setCalculatedPayroll] = useState<NigerianPayrollOutput | null>(null);
  const [importedData, setImportedData] = useState<ExcelPayrollData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState<number>(0);
  
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'number' | 'text' | 'percentage'>('number');
  const [newFieldDefault, setNewFieldDefault] = useState('');
  
  // Get current date in YYYY-MM-DD format for default form values
  const today = new Date();
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Default payment date (today + 14 days)
  const defaultPaymentDate = new Date(today);
  defaultPaymentDate.setDate(today.getDate() + 14);
  
  const form = useForm<FieldValues>({
    defaultValues: {
      employeeName: '',
      paymentDate: formatDate(defaultPaymentDate),
      basic_salary: 0,
      housing_allowance: 0,
      transport_allowance: 0,
      utility_allowance: 0,
      lunch_allowance: 0,
      entertainment_allowance: 0,
      leave_allowance: 0,
      other_allowances: 0,
      bonus: 0,
      overtime: 0,
      employee_deductions: 0,
      loan_repayment: 0,
    },
  });

  const handleExcelDataImported = (data: ExcelPayrollData[]) => {
    setImportedData(data);
    setCurrentEmployeeIndex(0);
    
    if (data.length > 0) {
      // Load the first employee data into the form
      loadEmployeeDataToForm(data[0]);
      setActiveTab('excel');
    }
  };
  
  const loadEmployeeDataToForm = (employeeData: ExcelPayrollData) => {
    // Reset form first
    form.reset();
    
    // Set employee name
    form.setValue('employeeName', employeeData.employeeName || '');
    
    // Map standard fields from Excel to our form fields
    const fieldMappings: Record<keyof ExcelPayrollData, keyof FieldValues> = {
      baseSalary: 'basic_salary',
      housingAllowance: 'housing_allowance',
      transportAllowance: 'transport_allowance',
      utilityAllowance: 'utility_allowance',
      lunchAllowance: 'lunch_allowance',
      entertainmentAllowance: 'entertainment_allowance',
      leaveAllowance: 'leave_allowance',
      otherAllowances: 'other_allowances',
      bonusAmount: 'bonus',
      overtime: 'overtime',
      employeeDeductions: 'employee_deductions',
      loanRepayment: 'loan_repayment',
      employeeName: 'employeeName'
    } as const;
    
    // Set values from Excel data using mappings
    Object.entries(fieldMappings).forEach(([excelField, formField]) => {
      const value = employeeData[excelField as keyof ExcelPayrollData];
      if (value !== undefined) {
        form.setValue(formField, Number(value));
      }
    });
    
    // Handle custom fields if they exist in the data
    customFields.forEach(field => {
      const fieldValue = employeeData[field.name];
      if (fieldValue !== undefined) {
        form.setValue(field.id, field.type === 'number' ? Number(fieldValue) : fieldValue);
      }
    });
  };
  
  const navigateEmployees = (direction: 'next' | 'prev') => {
    if (importedData.length === 0) return;
    
    let newIndex = currentEmployeeIndex;
    if (direction === 'next') {
      newIndex = (currentEmployeeIndex + 1) % importedData.length;
    } else {
      newIndex = currentEmployeeIndex > 0 ? currentEmployeeIndex - 1 : importedData.length - 1;
    }
    
    setCurrentEmployeeIndex(newIndex);
    loadEmployeeDataToForm(importedData[newIndex]);
  };

  const calculatePayroll = (data: FieldValues) => {
    // Get all form values
    const payrollInput = {
      basic_salary: Number(data.basic_salary) || 0,
      housing_allowance: Number(data.housing_allowance) || 0,
      transport_allowance: Number(data.transport_allowance) || 0,
      utility_allowance: Number(data.utility_allowance) || 0,
      lunch_allowance: Number(data.lunch_allowance) || 0,
      entertainment_allowance: Number(data.entertainment_allowance) || 0,
      leave_allowance: Number(data.leave_allowance) || 0,
      other_allowances: Number(data.other_allowances) || 0,
      bonus: Number(data.bonus) || 0,
      overtime: Number(data.overtime) || 0,
      employee_deductions: Number(data.employee_deductions) || 0,
      loan_repayment: Number(data.loan_repayment) || 0,
    };
    
    // Add custom fields if they're numeric
    customFields.forEach(field => {
      const value = data[field.id];
      if (field.type === 'number' && value !== undefined) {
        payrollInput.other_allowances = (payrollInput.other_allowances || 0) + Number(value);
      } else if (field.type === 'percentage' && value !== undefined) {
        // For percentage fields, we calculate the amount based on the gross income
        const percentage = Number(value) / 100;
        const baseAmount = payrollInput.basic_salary;
        const amount = baseAmount * percentage;
        payrollInput.other_allowances = (payrollInput.other_allowances || 0) + amount;
      }
    });
    
    // Calculate payroll using Nigerian tax rules
    const result = calculateNigerianPayroll(payrollInput);
    
    setCalculatedPayroll(result);
    toast.success("Payroll calculated successfully!");
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }
    
    const fieldId = `custom_${Date.now()}`;
    
    addCustomField({
      id: fieldId,
      name: newFieldName,
      type: newFieldType,
      defaultValue: newFieldDefault || undefined,
    });
    
    // Reset form
    setNewFieldName('');
    setNewFieldDefault('');
    
    // Set default value in the form
    if (newFieldDefault) {
      form.setValue(fieldId, newFieldType === 'number' ? Number(newFieldDefault) : newFieldDefault);
    }
    
    toast.success("Custom field added");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const saveCalculatedPayroll = async () => {
    if (!calculatedPayroll) {
      toast.error("You need to calculate a payroll first");
      return;
    }
    
    const values = form.getValues();
    
    try {
      // Create current date for start_date and end_date
      const currentDate = formatDate(new Date());
      
      // Create payroll period
      const period = {
        start_date: currentDate,
        end_date: currentDate,
        payment_date: values.paymentDate,
        status: 'draft' as 'draft' | 'processing' | 'paid' | 'cancelled',
        total_amount: calculatedPayroll.gross_income
      };
      
      // Create payroll entry
      const entry = {
        employee_name: values.employeeName,
        base_salary: Number(values.basic_salary),
        taxes: calculatedPayroll.monthly_paye,
        net_pay: calculatedPayroll.net_pay,
        additional_details: calculatedPayroll.details || {}
      };
      
      await savePayroll(period, [entry]);
      
      toast.success("Payroll saved to database");
      
      // Reset form after saving
      form.reset({
        ...form.getValues(),
        employeeName: '',
      });
      
      setCalculatedPayroll(null);
      
    } catch (error) {
      console.error("Error saving payroll:", error);
      toast.error("Failed to save payroll");
    }
  };

  const batchCalculate = () => {
    if (importedData.length === 0) {
      toast.error("No data available for batch calculation");
      return;
    }
    
    let successCount = 0;
    
    // Process each employee in the imported data
    importedData.forEach((employee, index) => {
      try {
        // Map employee data to our new field structure
        const calculationData: FieldValues = {
          employeeName: employee.employeeName || `Employee ${index + 1}`,
          paymentDate: form.getValues().paymentDate,
          basic_salary: employee.baseSalary || 0,
          housing_allowance: Number(employee.housingAllowance) || 0,
          transport_allowance: Number(employee.transportAllowance) || 0,
          utility_allowance: Number(employee.utilityAllowance) || 0,
          lunch_allowance: Number(employee.lunchAllowance) || 0,
          entertainment_allowance: Number(employee.entertainmentAllowance) || 0,
          leave_allowance: Number(employee.leaveAllowance) || 0,
          other_allowances: Number(employee.otherAllowances) || 0,
          bonus: Number(employee.bonusAmount) || 0,
          overtime: Number(employee.overtime) || 0,
          employee_deductions: Number(employee.employeeDeductions) || 0,
          loan_repayment: Number(employee.loanRepayment) || 0,
        };
        
        // Add any custom fields from the data
        customFields.forEach(field => {
          const fieldValue = employee[field.name];
          if (fieldValue !== undefined) {
            calculationData[field.id] = field.type === 'number' ? Number(fieldValue) : fieldValue;
          }
        });
        
        // Calculate payroll for this employee
        calculatePayroll(calculationData);
        successCount++;
      } catch (error) {
        console.error(`Error calculating payroll for employee ${index + 1}:`, error);
      }
    });
    
    toast.success(`Successfully calculated payroll for ${successCount} out of ${importedData.length} employees`);
  };

  // Update excel template to match our new fields
  const generateUpdatedExcelTemplate = () => {
    const downloadTemplateLink = document.createElement('a');
    downloadTemplateLink.href = '/nigeria_payroll_template.xlsx';
    downloadTemplateLink.download = 'nigeria_payroll_template.xlsx';
    downloadTemplateLink.click();
    toast.success('Template downloaded successfully');
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Add Custom Fields</CardTitle>
          <CardDescription>Create custom fields for your payroll calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fieldName">Field Name</Label>
                <Input 
                  id="fieldName" 
                  value={newFieldName} 
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g., Health Insurance"
                />
              </div>
              <div>
                <Label htmlFor="fieldType">Field Type</Label>
                <select
                  id="fieldType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as 'number' | 'text' | 'percentage')}
                >
                  <option value="number">Number (Fixed Amount)</option>
                  <option value="percentage">Percentage (of Gross)</option>
                  <option value="text">Text (Information Only)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="defaultValue">Default Value (optional)</Label>
                <Input 
                  id="defaultValue" 
                  value={newFieldDefault} 
                  onChange={(e) => setNewFieldDefault(e.target.value)}
                  placeholder="Default value"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddCustomField} 
              type="button" 
              className="w-full md:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
          
          {customFields.length > 0 && (
            <div className="mt-4">
              <Separator className="my-4" />
              <h3 className="text-sm font-medium mb-2">Current Custom Fields</h3>
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div>
                      <span className="font-medium">{field.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                      {field.defaultValue && <span className="text-xs text-gray-500 ml-2">Default: {field.defaultValue}</span>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCustomField(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Nigerian Payroll Calculator</CardTitle>
          <CardDescription>Calculate employee payroll with PAYE, Pension and NHIS deductions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
              <TabsTrigger value="excel">Excel Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(calculatePayroll)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employeeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter employee name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="basic_salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Basic Salary</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormDescription>Monthly basic salary</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="housing_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Housing Allowance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="transport_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transport Allowance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="utility_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Utility Allowance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lunch_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lunch Allowance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="entertainment_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entertainment Allowance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="leave_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leave Allowance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="other_allowances"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Allowances</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonus</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="overtime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overtime</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="employee_deductions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Deductions</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="loan_repayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Repayment</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {customFields.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customFields.map((field) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={field.id}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>{field.name} {field.type === 'percentage' && '(%)'}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type={field.type === 'text' ? 'text' : 'number'} 
                                    placeholder={field.defaultValue?.toString() || '0'} 
                                    {...formField} 
                                    onChange={(e) => formField.onChange(
                                      field.type === 'text' ? e.target.value : e.target.valueAsNumber
                                    )}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  <Button type="submit" className="w-full">Calculate Nigerian Payroll</Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="excel">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <ExcelUploader onDataImported={handleExcelDataImported} />
                  <Button 
                    variant="outline" 
                    onClick={generateUpdatedExcelTemplate}
                    className="w-full md:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Nigerian Template
                  </Button>
                </div>
                
                {importedData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Employee {currentEmployeeIndex + 1} of {importedData.length}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigateEmployees('prev')}
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigateEmployees('next')}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h4 className="text-sm font-semibold mb-2">Current Employee: {form.getValues().employeeName}</h4>
                      <p className="text-sm text-gray-600">
                        Basic Salary: {formatCurrency(form.getValues().basic_salary || 0)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => form.handleSubmit(calculatePayroll)()}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Current Employee
                      </Button>
                      
                      <Button 
                        onClick={batchCalculate}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate All Employees
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {calculatedPayroll && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Nigerian Payroll Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Gross Income</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculatedPayroll.gross_income)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Total Deductions</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      calculatedPayroll.employee_pension + 
                      calculatedPayroll.nhis + 
                      calculatedPayroll.monthly_paye
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Net Salary</div>
                  <div className="text-2xl font-bold text-payroll-700">{formatCurrency(calculatedPayroll.net_pay)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Employee Pension (8%)</div>
                  <div className="text-xl font-semibold text-red-600">{formatCurrency(calculatedPayroll.employee_pension)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Employer Pension (10%)</div>
                  <div className="text-xl font-semibold text-blue-600">{formatCurrency(calculatedPayroll.employer_pension)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">NHIS (5%)</div>
                  <div className="text-xl font-semibold text-red-600">{formatCurrency(calculatedPayroll.nhis)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Monthly PAYE Tax</div>
                  <div className="text-xl font-semibold text-red-600">{formatCurrency(calculatedPayroll.monthly_paye)}</div>
                </div>
              </div>
              
              {calculatedPayroll.details && Object.keys(calculatedPayroll.details).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Payroll Breakdown</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {Object.entries(calculatedPayroll.details).map(([name, value]) => (
                      <div key={name} className="flex justify-between bg-gray-50 p-2 rounded-md">
                        <span className="capitalize">{name.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCalculatedPayroll(null)}
            >
              Reset
            </Button>
            <Button 
              onClick={saveCalculatedPayroll}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Payroll
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
