import React from "react";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Users,
  BadgeInfo,
  Badge,
  HandCoins,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  icon: React.ReactNode;
};

const StatCard = ({ title, value, change, icon }: StatCardProps) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>

            {change && (
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs font-medium flex items-center ₦{
                  change.positive ? 'text-green-600' : 'text-red-600'
                }`}
                >
                  {change.positive ? (
                    <ArrowUp size={12} />
                  ) : (
                    <ArrowDown size={12} />
                  )}
                  {change.value}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            )}
          </div>

          <div className="p-3 bg-payroll-50 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Employees"
        value="32"
        change={{ value: "2.5%", positive: true }}
        icon={<Users className="text-payroll-600" />}
      />

      <StatCard
        title="Monthly Payroll"
        value="₦45,833"
        change={{ value: "1.8%", positive: true }}
        icon={<BadgeInfo className="text-payroll-600" />}
      />

      <StatCard
        title="Avg. Salary"
        value="₦109,714"
        change={{ value: "0.5%", positive: false }}
        icon={<Banknote className="text-payroll-600" />}
      />

      <StatCard
        title="Next Payday"
        value="May 28"
        icon={<HandCoins className="text-payroll-600" />}
      />
    </div>
  );
}
