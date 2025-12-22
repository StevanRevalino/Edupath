interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

const PageHeader = ({
  title,
  description,
  className = "",
}: PageHeaderProps) => {
  return (
    <div className={`mb-3 sm:mb-6 flex-shrink-0 ${className}`}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;
