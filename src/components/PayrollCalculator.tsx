import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Trash2, Save, Calculator } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FieldValues = {
  baseSalary: number;
  hoursWorked?: number;
  hourlyRate?: number;
  taxRate: number;
  bonusAmount?: number;
  employeeName: string;
  paymentDate: string;
  [key: string]: string | number | undefined;
};

type CalculatedPayroll = {
  grossSalary: number;
  deductions: number;
  netSalary: number;
  details: Record<string, number>;
};

export function PayrollCalculator() {
  const { customFields, addCustomField, removeCustomField } = useCustomFields();
  const [calculatedPayroll, setCalculatedPayroll] = useState<CalculatedPayroll | null>(null);
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
      baseSalary: 0,
      hoursWorked: 0,
      hourlyRate: 0,
      taxRate: 20,
      bonusAmount: 0,
      employeeName: '',
      paymentDate: formatDate(defaultPaymentDate),
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
    
    // Set values from Excel data
    form.setValue('employeeName', employeeData.employeeName || '');
    form.setValue('baseSalary', employeeData.baseSalary || 0);
    
    if (employeeData.hoursWorked !== undefined) {
      form.setValue('hoursWorked', Number(employeeData.hoursWorked));
    }
    
    if (employeeData.hourlyRate !== undefined) {
      form.setValue('hourlyRate', Number(employeeData.hourlyRate));
    }
    
    if (employeeData.bonusAmount !== undefined) {
      form.setValue('bonusAmount', Number(employeeData.bonusAmount));
    }
    
    if (employeeData.taxRate !== undefined) {
      form.setValue('taxRate', Number(employeeData.taxRate));
    }
    
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
    // Base calculation
    let grossSalary = Number(data.baseSalary);
    
    // Add hourly calculations if provided
    if (data.hoursWorked && data.hourlyRate) {
      grossSalary += Number(data.hoursWorked) * Number(data.hourlyRate);
    }
    
    // Add bonus if provided
    if (data.bonusAmount) {
      grossSalary += Number(data.bonusAmount);
    }
    
    // Process custom fields
    const details: Record<string, number> = {};
    
    customFields.forEach(field => {
      const value = data[field.id];
      if (field.type === 'number' && value !== undefined) {
        grossSalary += Number(value);
        details[field.name] = Number(value);
      } else if (field.type === 'percentage' && value !== undefined) {
        const amount = (grossSalary * Number(value)) / 100;
        details[field.name] = amount;
        grossSalary += amount;
      }
    });
    
    // Calculate tax
    const taxRate = Number(data.taxRate) || 0;
    const deductions = (grossSalary * taxRate) / 100;
    const netSalary = grossSalary - deductions;
    
    const calculatedResult = {
      grossSalary,
      deductions,
      netSalary,
      details
    };
    
    setCalculatedPayroll(calculatedResult);
    
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
      
      // Create payroll period with explicit status type
      const period = {
        start_date: currentDate, // Use current date as start date
        end_date: currentDate,   // Use current date as end date
        payment_date: values.paymentDate,
        status: 'draft' as 'draft' | 'processing' | 'paid' | 'cancelled', // Fixed status type
        total_amount: calculatedPayroll.grossSalary
      };
      
      // Create payroll entry
      const entry = {
        employee_name: values.employeeName,
        base_salary: Number(values.baseSalary),
        taxes: calculatedPayroll.deductions,
        net_pay: calculatedPayroll.netSalary,
        additional_details: calculatedPayroll.details
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
        // Prepare data for calculation
        const calculationData: FieldValues = {
          baseSalary: employee.baseSalary || 0,
          hoursWorked: employee.hoursWorked !== undefined ? Number(employee.hoursWorked) : 0,
          hourlyRate: employee.hourlyRate !== undefined ? Number(employee.hourlyRate) : 0,
          taxRate: employee.taxRate !== undefined ? Number(employee.taxRate) : 20, // Default tax rate
          bonusAmount: employee.bonusAmount !== undefined ? Number(employee.bonusAmount) : 0,
          employeeName: employee.employeeName || `Employee ${index + 1}`,
          paymentDate: form.getValues().paymentDate,
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
          <CardTitle className="text-xl font-semibold text-gray-800">Payroll Calculator</CardTitle>
          <CardDescription>Calculate employee payroll with customizable fields</CardDescription>
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
                      name="baseSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Salary</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormDescription>Monthly base salary</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="20" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormDescription>Percentage of tax to deduct</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hoursWorked"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours Worked (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormDescription>For hourly employees</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (optional)</FormLabel>
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
                      name="bonusAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonus Amount (optional)</FormLabel>
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
                  
                  <Button type="submit" className="w-full">Calculate Payroll</Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="excel">
              <div className="space-y-6">
                <ExcelUploader onDataImported={handleExcelDataImported} />
                
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
                        Base Salary: {formatCurrency(form.getValues().baseSalary || 0)}
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
            <CardTitle className="text-xl font-semibold text-gray-800">Payroll Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Gross Salary</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculatedPayroll.grossSalary)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Net Salary</div>
                  <div className="text-2xl font-bold text-payroll-700">{formatCurrency(calculatedPayroll.netSalary)}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Tax Deductions</div>
                <div className="text-xl font-semibold text-red-600">{formatCurrency(calculatedPayroll.deductions)}</div>
              </div>
              
              {Object.keys(calculatedPayroll.details).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Custom Field Details</h3>
                  <div className="space-y-2">
                    {Object.entries(calculatedPayroll.details).map(([name, value]) => (
                      <div key={name} className="flex justify-between bg-gray-50 p-2 rounded-md">
                        <span>{name}</span>
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
