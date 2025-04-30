
import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';

const Payroll = () => {
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
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Period</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Total</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4">Mar 16-31, 2025</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span>
                    </td>
                    <td className="py-3 px-4">$24,500.00</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Mar 1-15, 2025</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span>
                    </td>
                    <td className="py-3 px-4">$24,350.00</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Feb 16-28, 2025</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span>
                    </td>
                    <td className="py-3 px-4">$23,900.00</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
