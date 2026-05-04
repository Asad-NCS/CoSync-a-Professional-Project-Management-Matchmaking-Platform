import React from 'react';
import { PROJECT_STATUS, APP_STATUS } from '../../lib/utils';

const StatusBadge = ({ status, type = 'project' }) => {
  const lookup = type === 'application' ? APP_STATUS : PROJECT_STATUS;
  const fallback = type === 'application' ? APP_STATUS.pending : PROJECT_STATUS.open;
  const s = lookup[status] || fallback;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{
        background: "rgba(0,0,0,0.2)",
        border: `1px solid ${s.color || "rgba(139,92,246,0.2)"}`,
        color: s.color || "#a78bfa",
      }}
    >
      ● {s.label || status}
    </span>
  );
};

export default StatusBadge;
