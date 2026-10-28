<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import { useLabelStore } from '../stores/labelStore'
import { useTeamStore } from '../stores/teamStore'
import TaskModal from '../components/tasks/TaskModal.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'

const taskStore = useTaskStore()
const labelStore = useLabelStore()
const teamStore = useTeamStore()

onMounted(() => {
  if (taskStore.tasks.length === 0) taskStore.fetchTasks()
  if (labelStore.labels.length === 0) labelStore.fetchLabels()
  if (teamStore.users.length === 0) teamStore.fetchTeams()
})

const isModalOpen = ref(false)
const isDrawerOpen = ref(false)
const selectedTask = ref<Task | null>(null)
const editingTask = ref<Task | null>(null)

const searchQuery = ref('')
const selectedUser = ref('Alle')
const selectedLabel = ref('Alle')

const currentDate = ref(new Date())

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

// Montag der aktuellen Woche
const startOfWeek = computed(() => {
  const d = new Date(currentDate.value)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
})

// Wochentage Mo-Fr berechnen
const weekDays = computed(() => {
  const days: Array<{
    isoDate: string
    name: string
    formatted: string
    isToday: boolean
  }> = []

  const monday = new Date(startOfWeek.value)
  const todayIso = new Date().toISOString().slice(0, 10)
  const weekdayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const isoDate = d.toISOString().slice(0, 10)

    const formatted = d.toLocaleDateString('de-CH', { 
      day: '2-digit', 
      month: 'short' 
    })

    days.push({
      isoDate,
      name: weekdayNames[i] ?? '',
      formatted,
      isToday: isoDate === todayIso
    })
  }
  return days
})

const weekRangeText = computed(() => {
  const first = weekDays.value[0]?.formatted
  const last = weekDays.value[4]?.formatted
  if (!first || !last) return ''
  const year = startOfWeek.value.getFullYear()
  return `${first} – ${last} ${year}`
})

// Navigation
function prevWeek() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 7)
  currentDate.value = d
}

function nextWeek() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 7)
  currentDate.value = d
}

function goToToday() {
  currentDate.value = new Date()
}

// Drawer & Aktionen
function openDetail(task: Task) {
  selectedTask.value = task
  isDrawerOpen.value = true
}

function closeDrawer() {
  isDrawerOpen.value = false
  selectedTask.value = null
}

function editTask(task: Task) {
  closeDrawer()
  editingTask.value = task
}

function deleteTask(id: number) {
  if (!confirm('Task wirklich löschen?')) return
  closeDrawer()
  taskStore.deleteTask(id)
}

// Filter
const filteredTasks = computed(() => {
  return taskStore.tasks.filter(task => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchTitle = task.title.toLowerCase().includes(q)
      const matchDesc = task.description?.toLowerCase().includes(q) || false
      if (!matchTitle && !matchDesc) return false
    }

    if (selectedUser.value !== 'Alle') {
      if (task.assignee?.name !== selectedUser.value) return false
    }

    if (selectedLabel.value !== 'Alle') {
      const labelName = task.labels?.[0]?.name || task.label?.name
      if (labelName !== selectedLabel.value) return false
    }

    return true
  })
})

// Tasks nach Tag und Uhrzeit zuordnen
function getTasksForSlot(dayIsoDate: string, slotTime: string): Task[] {
  const slotHour = slotTime.slice(0, 2)
  const todayIso = new Date().toISOString().slice(0, 10)

  return filteredTasks.value.filter(task => {
    const isMatchingDay = task.dueDate === dayIsoDate || 
      (dayIsoDate === todayIso && task.dueDate === 'Heute')

    if (!isMatchingDay) return false

    const taskHour = task.dueTime ? task.dueTime.slice(0, 2) : '12'
    return taskHour === slotHour
  })
}

// Überfällige Tasks prüfen
function isTaskOverdue(task: Task): boolean {
  if (task.completed) return false
  const now = new Date()
  const todayIso = now.toISOString().slice(0, 10)

  if (task.dueDate === 'Heute') return false
  if (task.dueDate < todayIso) return true
  
  if (task.dueDate === todayIso && task.dueTime) {
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    return task.dueTime < currentHourMin
  }
  return false
}

function getLabelColor(task: Task): string {
  const color = task.labels?.[0]?.color || task.label?.color || 'development'
  return `label-${color}`
}
</script>

<template>
  <div class="timeline-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Timeline</h1>
        <p class="page-subtitle">Behalte alle Tasks auf einer Zeitachse im Blick.</p>
      </div>

      <button type="button" class="btn-primary" @click="isModalOpen = true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Neuer Task</span>
      </button>
    </div>

    <!-- Toolbar: Suche & Filter -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tasks durchsuchen ..." 
          class="search-input"
        />
      </div>

      <div class="filter-actions">
        <div class="select-wrapper">
          <select v-model="selectedUser" class="filter-select">
            <option value="Alle">User: Alle</option>
            <option v-for="user in teamStore.users" :key="user.id" :value="user.name">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div class="select-wrapper">
          <select v-model="selectedLabel" class="filter-select">
            <option value="Alle">Label: Alle</option>
            <option v-for="label in labelStore.labels" :key="label.id" :value="label.name">
              {{ label.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Datums-Navigation -->
    <div class="timeline-nav-bar">
      <div class="nav-left">
        <div class="nav-controls">
          <button type="button" class="nav-arrow-btn" @click="prevWeek" title="Vorherige Woche">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button type="button" class="today-btn" @click="goToToday">Heute</button>
          <button type="button" class="nav-arrow-btn" @click="nextWeek" title="Nächste Woche">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <strong class="range-label">{{ weekRangeText }}</strong>
      </div>
    </div>

    <!-- Kalender-Raster -->
    <div class="calendar-card">
      <!-- Kopfzeile: Wochentage -->
      <div class="calendar-head">
        <div class="time-col-header">Zeit</div>
        <div 
          v-for="day in weekDays" 
          :key="day.isoDate"
          class="day-col-header"
          :class="{ 'is-today': day.isToday }"
        >
          <span class="day-name">{{ day.name }}</span>
          <span class="day-date">{{ day.formatted }}</span>
        </div>
      </div>

      <!-- Zeilen: 08:00 bis 18:00 -->
      <div class="calendar-body">
        <div 
          v-for="slot in timeSlots" 
          :key="slot" 
          class="calendar-row"
        >
          <!-- Spalte links: Uhrzeit -->
          <div class="time-label-cell">{{ slot }}</div>

          <!-- 5 Spalten für Mo bis Fr -->
          <div 
            v-for="day in weekDays" 
            :key="day.isoDate"
            class="slot-cell"
            :class="{ 'today-col': day.isToday }"
          >
            <!-- Task-Karten in diesem Slot -->
            <div 
              v-for="task in getTasksForSlot(day.isoDate, slot)" 
              :key="task.id"
              class="timeline-card"
              :class="[
                getLabelColor(task),
                { 'is-overdue': isTaskOverdue(task), 'is-completed': task.completed }
              ]"
              @click="openDetail(task)"
            >
              <div class="card-main">
                <span class="card-title">{{ task.title }}</span>
                <span v-if="task.completed" class="completed-check">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </div>

              <div class="card-meta">
                <span class="time-badge">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>{{ task.dueTime || '12:00' }}</span>
                </span>

                <span v-if="task.assignee" class="assignee-badge">
                  {{ task.assignee.initials || task.assignee.name.slice(0, 2).toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals & Drawer -->
    <TaskDetailDrawer 
      :is-open="isDrawerOpen" 
      :task="selectedTask" 
      @close="closeDrawer"
      @toggle="taskStore.toggleTask"
      @edit="editTask"
      @delete="deleteTask"
    />

    <TaskModal
      :is-open="isModalOpen || editingTask !== null"
      :task="editingTask"
      @close="isModalOpen = false; editingTask = null"
      @create="taskStore.addTask"
      @update="taskStore.updateTask"
    />
  </div>
</template>

<style scoped>
.timeline-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748B;
  margin-top: 4px;
  font-size: 0.95rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 10px 20px;
  border-radius: 12px;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(82, 67, 224, 0.3);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 6px 20px rgba(82, 67, 224, 0.4);
}

/* Toolbar */
.toolbar {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.search-icon {
  color: #94A3B8;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #1E293B;
  font-family: inherit;
  background: transparent;
}

.search-input::placeholder {
  color: #94A3B8;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-wrapper {
  position: relative;
}

.filter-select {
  padding: 8px 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #475569;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.filter-select:hover {
  border-color: #CBD5E1;
}

/* Navigation Bar */
.timeline-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-controls {
  display: inline-flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 3px;
  gap: 4px;
}

.nav-arrow-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  transition: all 0.15s;
}

.nav-arrow-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.today-btn {
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1E293B;
  border-radius: 8px;
  transition: background 0.15s;
}

.today-btn:hover {
  background: #F8FAFC;
}

.range-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1E293B;
}

/* Kalender-Card */
.calendar-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.calendar-head {
  display: grid;
  grid-template-columns: 75px repeat(5, 1fr);
  border-bottom: 1px solid #E2E8F0;
  background: #FFFFFF;
}

.time-col-header {
  padding: 16px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94A3B8;
  text-align: center;
  border-right: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-col-header {
  padding: 14px 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-right: 1px solid #E2E8F0;
  transition: background 0.15s;
}

.day-col-header:last-child {
  border-right: none;
}

.day-col-header.is-today {
  background: #F8FAFF;
  border-bottom: 3px solid var(--primary);
}

.day-col-header.is-today .day-name {
  color: var(--primary);
}

.day-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1E293B;
}

.day-date {
  font-size: 0.78rem;
  color: #94A3B8;
}

/* Calendar Body */
.calendar-body {
  display: flex;
  flex-direction: column;
}

.calendar-row {
  display: grid;
  grid-template-columns: 75px repeat(5, 1fr);
  min-height: 84px;
  border-bottom: 1px solid #F1F5F9;
}

.calendar-row:last-child {
  border-bottom: none;
}

.time-label-cell {
  padding: 12px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #94A3B8;
  border-right: 1px solid #E2E8F0;
  text-align: center;
  background: #FAFBFD;
}

.slot-cell {
  border-right: 1px solid #F1F5F9;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 84px;
  transition: background 0.15s;
}

.slot-cell:last-child {
  border-right: none;
}

.slot-cell.today-col {
  background: #FDFDFF;
}

/* Task Kacheln */
.timeline-card {
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-left-width: 4px;
  border-left-style: solid;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  border-right: 1px solid #E2E8F0;
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.timeline-card.is-completed {
  opacity: 0.65;
  background: #F8FAFC;
}

.timeline-card.is-completed .card-title {
  text-decoration: line-through;
  color: #64748B;
}

/* Pflichtenheft F015: Rote Fälligkeitsdarstellung bei Überfälligkeit */
.timeline-card.is-overdue {
  border-left-color: #EF4444 !important;
  background: #FEF2F2 !important;
}

.timeline-card.is-overdue .card-title {
  color: #B91C1C !important;
  font-weight: 700;
}

.timeline-card.is-overdue .time-badge {
  color: #DC2626 !important;
  font-weight: 700;
}

/* Label Farben */
.timeline-card.label-development {
  border-left-color: #6366F1;
}

.timeline-card.label-schule {
  border-left-color: #9333EA;
}

.timeline-card.label-it {
  border-left-color: #0284C7;
}

.timeline-card.label-design {
  border-left-color: #EC4899;
}

.timeline-card.label-organisation {
  border-left-color: #F59E0B;
}

.card-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1E293B;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.completed-check {
  color: #10B981;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #64748B;
  margin-top: 4px;
}

.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.assignee-badge {
  background: #F1F5F9;
  color: #475569;
  padding: 2px 5px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
}
</style>
