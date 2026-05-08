import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const PROJECT_STATUS = {
  open:      { label: 'Recruiting', color: '#4ade80' },
  closed:    { label: 'Full',       color: '#6b7280' },
  completed: { label: 'Completed',  color: '#3291FF' }
}

export const APP_STATUS = {
  pending:  { label: 'Pending',  color: '#fbbf24' },
  accepted: { label: 'Accepted', color: '#4ade80' },
  rejected: { label: 'Rejected', color: '#f87171' }
}

export const ROLE_COLORS = [
  '#3B82F6', '#0070F3', '#EC4899', '#F97316', '#14B8A6', '#06B6D4'
]

export const SKILL_COLORS = [
  '#61dafb', '#3291FF', '#4ade80', '#fb923c', '#f472b6',
  '#34d399', '#60a5fa', '#fbbf24', '#e879f9', '#38bdf8'
]
