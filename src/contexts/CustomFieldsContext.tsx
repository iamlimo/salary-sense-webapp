
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CustomField = {
  id: string;
  name: string;
  type: 'number' | 'text' | 'percentage';
  defaultValue?: string | number;
};

type CustomFieldsContextType = {
  customFields: CustomField[];
  addCustomField: (field: CustomField) => void;
  removeCustomField: (id: string) => void;
  updateCustomField: (id: string, field: Partial<CustomField>) => void;
};

const CustomFieldsContext = createContext<CustomFieldsContextType | undefined>(undefined);

export const useCustomFields = () => {
  const context = useContext(CustomFieldsContext);
  if (!context) {
    throw new Error('useCustomFields must be used within a CustomFieldsProvider');
  }
  return context;
};

export const CustomFieldsProvider = ({ children }: { children: ReactNode }) => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const addCustomField = (field: CustomField) => {
    setCustomFields((prev) => [...prev, field]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateCustomField = (id: string, updatedField: Partial<CustomField>) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, ...updatedField } : field
      )
    );
  };

  return (
    <CustomFieldsContext.Provider
      value={{ customFields, addCustomField, removeCustomField, updateCustomField }}
    >
      {children}
    </CustomFieldsContext.Provider>
  );
};
