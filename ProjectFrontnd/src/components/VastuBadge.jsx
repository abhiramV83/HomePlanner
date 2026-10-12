export default function VastuBadge({ rating }) {
  const badgeStyles = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  const labels = {
    green: "Compliant",
    amber: "Acceptable",
    red: "Non-Compliant",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md border ${badgeStyles[rating] || badgeStyles.amber}`}
    >
      {labels[rating] || labels.amber}
    </span>
  );
}

