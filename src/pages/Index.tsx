
import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardStats } from '@/components/DashboardStats';
import { EmployeeTable } from '@/components/EmployeeTable';
import { PayrollCalendar } from '@/components/PayrollCalendar';
import { SalaryChart } from '@/components/SalaryChart';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <DashboardHeader />
        
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <DashboardStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SalaryChart />
            </div>
            <div>
              <PayrollCalendar />
            </div>
          </div>
          
          <EmployeeTable />
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Index;
