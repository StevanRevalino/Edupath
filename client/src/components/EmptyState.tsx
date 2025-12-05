import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionButton,
  className = "",
}) => {
  return (
    <div
      className={`text-center py-16 bg-white rounded-2xl shadow-md ${className}`}
    >
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}

      <h3 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h3>

      <p className="text-gray-500 mb-4">{description}</p>

      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="mt-4 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
