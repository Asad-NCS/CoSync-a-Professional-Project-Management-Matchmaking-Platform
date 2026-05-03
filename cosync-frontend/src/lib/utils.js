import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const PROJECT_STATUS = {
  open:   { label: 'Recruiting', color: 'green' },
  closed: { label: 'Full',       color: 'gray'  }
}

export const APP_STATUS = {
  pending:  { label: 'Pending',  color: 'yellow' },
  accepted: { label: 'Accepted', color: 'green'  },
  rejected: { label: 'Rejected', color: 'red'    }
}

export const ROLE_COLORS = [
  'blue', 'purple', 'pink', 'orange', 'teal', 'cyan'
]
