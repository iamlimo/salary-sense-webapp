
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { paydaySchedule } from '@/data/mock';
import { format } from 'date-fns';

export function PayrollCalendar() {
  // Get current date
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  
  // Generate payday dates for highlighting in calendar
  const paydays = paydaySchedule.map(schedule => schedule.date);
  
  // Function to highlight payday dates
  const isDayHighlighted = (date: Date) => {
    return paydays.some(payday => 
      payday.getDate() === date.getDate() && 
      payday.getMonth() === date.getMonth() && 
      payday.getFullYear() === date.getFullYear()
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Payroll Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={today}
          month={month}
          year={year}
          className="rounded-md border"
          modifiers={{
            payday: (date) => isDayHighlighted(date),
          }}
          modifiersClassNames={{
            payday: "bg-payroll-100 text-payroll-700 font-semibold",
          }}
        />
        
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Upcoming Paydays</h3>
          
          {paydaySchedule.map((schedule, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50">
              <div>
                <div className="font-medium">{format(schedule.date, 'MMMM d, yyyy')}</div>
                <div className="text-xs text-gray-500">{schedule.employeeCount} employees</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-payroll-700">{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(schedule.totalAmount)}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
