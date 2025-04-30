
import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PayrollCalculator } from '@/components/PayrollCalculator';
import { CustomFieldsProvider } from '@/contexts/CustomFieldsContext';

const Calculator = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payroll Calculator</h1>
        <CustomFieldsProvider>
          <PayrollCalculator />
        </CustomFieldsProvider>
      </div>
    </DashboardLayout>
  );
};

export default Calculator;
