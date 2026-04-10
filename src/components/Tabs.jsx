import React from 'react';

import { Button } from "../components/ui/button";

const Tabs = ({ children, value, onChange }) => {
  return <div className="w-full">{children}</div>;
};

const TabsList = ({ children }) => {
  return (
    <div className="flex rounded-lg bg-[#1a2234] p-1 mb-4">
      {children}
    </div>
  );
};

const TabTrigger = ({ value, selected, onClick, children }) => {
  return (
    <Button
      onClick={() => onClick(value)}
      className={`flex-1 px-4 py-2 rounded-md transition-all ${
        selected 
          ? 'bg-[#95ff00]/20 border border-[#95ff00]/50 text-[#95ff00]' 
          : 'text-gray-400 hover:text-[#95ff00]'
      }`}
      variant="ghost"
      size="icon">
      {children}
    </Button>
  );
};

const TabContent = ({ value, selected, children }) => {
  if (!selected) return null;
  return <div>{children}</div>;
};

export { Tabs, TabsList, TabTrigger, TabContent };