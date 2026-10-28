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
    scheduleYear?: number | null
    scheduleMonth?: number | null
    scheduleWeekOfMonth?: number | null
    scheduleWeekday?: number | null
    recurrence?: RecurrenceRule | string | null
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
    scheduleYear?: number | null
    scheduleMonth?: number | null
    scheduleWeekOfMonth?: number | null
    scheduleWeekday?: number | null
    dueTime?: string
    createdByUserId: number
    assignedUserId: number | null
    assignedTeamId: number | null
    labelIds: number[]
    recurrence?: RecurrenceRule | null
    reminder?: {
        amount: number
        unit: string
    } | null
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly_day' | 'monthly_weekday' | 'yearly'

export interface RecurrenceRule {
    type: RecurrenceType
    startDate?: string | null
    endDate?: string | null
    weekdays?: number[]
    dayOfMonth?: number
    weekOfMonth?: number
    weekday?: number
    monthOfYear?: number
}
