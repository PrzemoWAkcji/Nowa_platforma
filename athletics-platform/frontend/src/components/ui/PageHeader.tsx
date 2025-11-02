"use client";

import { BackButton } from "./BackButton";
import { BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonFallback?: string;
  showBreadcrumbs?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  showBackButton = true,
  backButtonFallback = "/dashboard",
  showBreadcrumbs = true,
  breadcrumbItems,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {showBreadcrumbs && <Breadcrumbs items={breadcrumbItems} />}

      {showBackButton && (
        <div className="mb-4">
          <BackButton fallbackHref={backButtonFallback} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>

        {children && (
          <div className="flex items-center space-x-2">{children}</div>
        )}
      </div>
    </div>
  );
}
