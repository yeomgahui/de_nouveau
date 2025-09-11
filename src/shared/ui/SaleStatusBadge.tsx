import {
  SaleStatus,
  SALE_STATUS_LABELS,
  SALE_STATUS_COLORS,
} from "@/shared/types/product";

interface SaleStatusBadgeProps {
  status: SaleStatus;
  className?: string;
}

export function SaleStatusBadge({
  status,
  className = "",
}: SaleStatusBadgeProps) {
  const label = SALE_STATUS_LABELS[status];
  const colorClass = SALE_STATUS_COLORS[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${colorClass}
        ${className}
      `.trim()}
    >
      {label}
    </span>
  );
}

// 상태별 아이콘을 포함한 인라인 표시 컴포넌트
interface SaleStatusInlineProps {
  status: SaleStatus;
  showLabel?: boolean;
  className?: string;
}

export function SaleStatusInline({
  status,
  showLabel = true,
  className = "",
}: SaleStatusInlineProps) {
  const label = SALE_STATUS_LABELS[status];

  const getIcon = () => {
    switch (status) {
      case "SELLING":
        return <span className="text-green-600">●</span>;
      case "SOLD_OUT":
        return <span className="text-orange-600">●</span>;
      case "HIDDEN":
        return <span className="text-gray-600">●</span>;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center space-x-1 ${className}`}>
      {getIcon()}
      {showLabel && <span className="text-sm">{label}</span>}
    </span>
  );
}
