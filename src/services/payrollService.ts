
import { supabase } from "@/integrations/supabase/client";

export type PayrollPeriod = {
  id: string;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: 'draft' | 'processing' | 'paid' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export type PayrollEntry = {
  id: string;
  payroll_period_id: string;
  employee_name: string;
  base_salary: number;
  taxes: number;
  net_pay: number;
  additional_details?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type PayrollWithEntries = PayrollPeriod & {
  entries: PayrollEntry[];
};

/**
 * Fetches all payroll periods
 */
export const fetchPayrollPeriods = async (): Promise<PayrollPeriod[]> => {
  const { data, error } = await supabase
    .from('payroll_periods')
    .select('*')
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching payroll periods:', error);
    throw error;
  }

  return data || [];
};

/**
 * Fetches a specific payroll period with its entries
 */
export const fetchPayrollWithEntries = async (payrollId: string): Promise<PayrollWithEntries> => {
  // Fetch the payroll period
  const { data: periodData, error: periodError } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('id', payrollId)
    .single();

  if (periodError) {
    console.error('Error fetching payroll period:', periodError);
    throw periodError;
  }

  // Fetch the entries for this period
  const { data: entriesData, error: entriesError } = await supabase
    .from('payroll_entries')
    .select('*')
    .eq('payroll_period_id', payrollId);

  if (entriesError) {
    console.error('Error fetching payroll entries:', entriesError);
    throw entriesError;
  }

  return {
    ...periodData,
    entries: entriesData || [],
  };
};

/**
 * Saves a new payroll period and its entries
 */
export const savePayroll = async (payroll: Omit<PayrollPeriod, 'id' | 'created_at' | 'updated_at'>, 
                                entries: Omit<PayrollEntry, 'id' | 'created_at' | 'updated_at' | 'payroll_period_id'>[]) => {
  // Start a transaction
  const { data: periodData, error: periodError } = await supabase
    .from('payroll_periods')
    .insert(payroll)
    .select()
    .single();

  if (periodError) {
    console.error('Error saving payroll period:', periodError);
    throw periodError;
  }

  const payrollId = periodData.id;
  
  // Add payroll_period_id to all entries
  const entriesWithPayrollId = entries.map(entry => ({
    ...entry,
    payroll_period_id: payrollId
  }));

  const { error: entriesError } = await supabase
    .from('payroll_entries')
    .insert(entriesWithPayrollId);

  if (entriesError) {
    console.error('Error saving payroll entries:', entriesError);
    throw entriesError;
  }

  return payrollId;
};

/**
 * Formats a date range for display
 */
export const formatPayrollPeriod = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endMonth = end.toLocaleString('default', { month: 'short' });
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay}-${endMonth} ${endDay}, ${year}`;
  }
};
