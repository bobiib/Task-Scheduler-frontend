export type LabelColor = 'development' | 'schule' | 'it' | 'design' | 'organisation'
export interface TaskLabel {
    id: string
    name: string
    color: LabelColor
}
export interface TaskAssignee {
    id: string
    name: string
    initials: string
    color?: string
}
export interface Task {
    id: string
    title: string
    description?: string
    dueDate: string
    dueTime?: string
    isDueToday?: boolean
    label: TaskLabel
    recurrence?: string
    reminder?: string
    assignee: TaskAssignee
    completed: boolean
}