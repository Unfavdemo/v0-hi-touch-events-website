export type TaskStatusName = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
export type TaskPriorityName = "LOW" | "MEDIUM" | "HIGH"

export const TASK_STATUS_LABELS: Record<TaskStatusName, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
}

export const TASK_PRIORITY_LABELS: Record<TaskPriorityName, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}
