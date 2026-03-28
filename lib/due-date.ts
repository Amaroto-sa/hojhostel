// Due-date automation utilities

export function calculateDueDate(
  checkInDate: Date,
  duration: "DAILY" | "WEEKLY" | "MONTHLY",
  count: number = 1
): Date {
  const due = new Date(checkInDate);

  switch (duration) {
    case "DAILY":
      due.setDate(due.getDate() + count);
      break;
    case "WEEKLY":
      due.setDate(due.getDate() + count * 7);
      break;
    case "MONTHLY":
      due.setMonth(due.getMonth() + count);
      break;
  }

  return due;
}

export function isOverdue(dueDate: Date): boolean {
  return new Date() > new Date(dueDate);
}

export function isDueSoon(dueDate: Date, daysThreshold: number = 7): boolean {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  const due = new Date(dueDate);
  return due <= threshold && due >= new Date();
}

export function formatDuration(duration: "DAILY" | "WEEKLY" | "MONTHLY", count: number): string {
  const unit = duration === "DAILY" ? "day" : duration === "WEEKLY" ? "week" : "month";
  return `${count} ${unit}${count > 1 ? "s" : ""}`;
}
