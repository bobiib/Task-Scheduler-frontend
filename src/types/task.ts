export type LabelColor = 'development' | 'schule' | 'it' | 'design' | 'organisation'

export interface TaskLabel {
    id: number
    name: string
    color: LabelColor
}

export interface TaskAssignee {
    type: 'user' | 'team'
    id: number
    name: string
    initials: string
}

export interface Task {
    id: number
    instanceId: number
    title: string
    description?: string | null
    dueDate: string
    dueTime?: string | null
    scheduleType: string
    recurrence?: string | null
    reminder?: string | null
    labels: TaskLabel[]
    label?: TaskLabel
    assignee: TaskAssignee
    completed: boolean
    isDueToday?: boolean
}

export interface CreateTaskPayload {
    title: string
    description?: string
    scheduleType: string
    dueDate: string
    scheduleDate?: string
    dueTime?: string
    createdByUserId: number
    assignedUserId: number | null
    assignedTeamId: number | null
    labelIds: number[]
    recurrence?: string | null
    reminder?: {
        amount: number
        unit: string
    } | null
}

