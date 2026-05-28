"use client"

import { CrmWorkspace } from "@/components/admin/crm-workspace"
import { PROJECT_WORKFLOW_STEPS } from "@/lib/crm/workflows"
import type { ProjectStepId } from "@/lib/project-workflow"

export function ProjectWorkspace({
  projectId,
  initialStep,
  stepDone,
  children,
}: {
  projectId: string
  initialStep: ProjectStepId
  stepDone: Record<ProjectStepId, boolean>
  children: Record<ProjectStepId, React.ReactNode>
}) {
  return (
    <CrmWorkspace
      basePath={`/admin/projects/${projectId}`}
      steps={PROJECT_WORKFLOW_STEPS}
      initialStep={initialStep}
      stepDone={stepDone}
      children={children}
    />
  )
}
