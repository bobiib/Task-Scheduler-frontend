import { computed, ref } from 'vue'
import { useLabelStore } from '../stores/labelStore'
import { useTaskStore } from '../stores/taskStore'
import { useTeamStore } from '../stores/teamStore'

function dateKey(date: Date) {
  return date.toLocaleDateString('sv-SE')
}

export function useTaskFilters() {
  const taskStore = useTaskStore()
  const labelStore = useLabelStore()
  const teamStore = useTeamStore()
  const searchQuery = ref('')
  const selectedStatus = ref('Alle')
  const selectedLabel = ref('Alle')
  const selectedAssignee = ref('Alle')
  const selectedTimeframe = ref('Alle')

  const labelOptions = computed(() => [
    'Alle',
    ...labelStore.labels.map(label => ({ value: String(label.id), label: label.name })),
  ])

  const assigneeGroups = computed(() => [
    { name: '', options: ['Alle'] },
    {
      name: 'Personen',
      options: teamStore.users.map(user => ({ value: `user:${user.id}`, label: user.name })),
    },
    {
      name: 'Teams',
      options: teamStore.teams.map(team => ({ value: `team:${team.id}`, label: team.name })),
    },
  ])

  const timeframeOptions = ['Alle', 'Heute fällig', 'Diese Woche', 'Überfällig']
  const selections = [selectedStatus, selectedLabel, selectedAssignee, selectedTimeframe]
  const hasActiveFilters = computed(() =>
    searchQuery.value.trim() !== '' || selections.some(selection => selection.value !== 'Alle')
  )

  function resetFilters() {
    searchQuery.value = ''
    selections.forEach(selection => { selection.value = 'Alle' })
  }

  function loadFilterOptions() {
    void labelStore.fetchLabels()
    void teamStore.fetchTeams()
  }

  const filteredTasks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const now = new Date()
    const today = dateKey(now)
    const monday = new Date(now)
    monday.setDate(now.getDate() - (now.getDay() + 6) % 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const weekStart = dateKey(monday)
    const weekEnd = dateKey(sunday)
    const currentTime = now.toTimeString().slice(0, 8)

    return taskStore.tasks.filter(task => {
      if (!task.title.toLowerCase().includes(query)) return false
      if (selectedStatus.value === 'Offen' && task.completed) return false
      if (selectedStatus.value === 'Erledigt' && !task.completed) return false
      if (selectedLabel.value !== 'Alle' &&
          !(task.labels ?? (task.label ? [task.label] : [])).some(label => String(label.id) === selectedLabel.value)) return false
      if (selectedAssignee.value !== 'Alle' &&
          (!task.assignee || `${task.assignee.type}:${task.assignee.id}` !== selectedAssignee.value)) return false

      switch (selectedTimeframe.value) {
        case 'Heute fällig':
          return task.dueDate === today
        case 'Diese Woche':
          return task.dueDate >= weekStart && task.dueDate <= weekEnd
        case 'Überfällig':
          return !task.completed && (task.dueDate < today ||
            (task.dueDate === today && (task.dueTime ?? '23:59:00').padEnd(8, ':00') < currentTime))
        default:
          return true
      }
    })
  })

  return {
    searchQuery,
    selectedStatus,
    selectedLabel,
    selectedAssignee,
    selectedTimeframe,
    labelOptions,
    assigneeGroups,
    timeframeOptions,
    hasActiveFilters,
    resetFilters,
    loadFilterOptions,
    filteredTasks,
  }
}
