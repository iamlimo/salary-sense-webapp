
import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmployeesSoon = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[80vh] p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 w-full max-w-2xl text-center">
          <div className="flex justify-center mb-6">
            <Clock className="h-16 w-16 text-payroll-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Employee Management Coming Soon
          </h1>
          
          <p className="text-gray-600 mb-6 text-lg">
            We're currently building a comprehensive employee management system to help you
            manage your workforce more efficiently. Stay tuned for exciting features including
            employee onboarding, document management, and detailed employee profiles.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Features to expect:</h3>
            <ul className="text-gray-600 space-y-2 text-left list-disc list-inside">
              <li>Employee profiles and document management</li>
              <li>Onboarding and offboarding workflows</li>
              <li>Time off and attendance tracking</li>
              <li>Performance reviews and career development</li>
            </ul>
          </div>
          
          <Button onClick={() => navigate("/")} className="bg-payroll-600 hover:bg-payroll-700">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesSoon;
