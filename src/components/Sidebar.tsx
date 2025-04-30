
import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  BarChart, 
  DollarSign, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-colors',
        active 
          ? 'bg-payroll-100 text-payroll-700' 
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  
  const items = [
    { icon: BarChart, label: 'Dashboard' },
    { icon: Users, label: 'Employees' },
    { icon: DollarSign, label: 'Payroll' },
    { icon: Calendar, label: 'Schedule' },
    { icon: FileText, label: 'Reports' },
    { icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={cn(
      'border-r border-gray-200 bg-white h-screen flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="text-xl font-bold text-payroll-700">SalarySense</div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={collapsed ? '' : item.label}
            active={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
          />
        ))}
      </div>
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-payroll-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-payroll-700">JS</span>
            </div>
            <div>
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-gray-500">admin@company.com</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
