<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import TaskModal from '../components/tasks/TaskModal.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'

const taskStore = useTaskStore()

const isModalOpen = ref(false)
const isDrawerOpen = ref(false)
const selectedTask = ref<Task | null>(null)

const searchQuery = ref('')
const selectedUser = ref('Alle')
const selectedLabel = ref('Alle')
const viewMode = ref<'week' | 'month'>('week')

onMounted(() => {
  if (taskStore.tasks.length === 0) {
    taskStore.fetchTasks()
  }
})

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

const weekDays = [
  { key: 'mo', label: 'Mo', date: '12. Okt.', isToday: false },
  { key: 'di', label: 'Di', date: '13. Okt.', isToday: false },
  { key: 'mi', label: 'Mi', date: '14. Okt.', isToday: true },
  { key: 'do', label: 'Do', date: '15. Okt.', isToday: false },
  { key: 'fr', label: 'Fr', date: '16. Okt.', isToday: false }
]

function openDetail(task: Task) {
  selectedTask.value = task
  isDrawerOpen.value = true
}

function closeDrawer() {
  isDrawerOpen.value = false
  selectedTask.value = null
}

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

function getTasksForSlot(dayKey: string, slotTime: string): Task[] {
  return filteredTasks.value.filter(task => {
    const taskHour = task.dueTime ? task.dueTime.slice(0, 2) : ''
    const slotHour = slotTime.slice(0, 2)

    if (taskHour !== slotHour) return false

    if (dayKey === 'mi' && (task.dueDate === 'Heute' || task.dueDate.includes('14'))) {
      return true
    }
    if (dayKey === 'mo' && (task.dueDate.includes('12') || task.title.includes('Mockup'))) {
      return true
    }
    if (dayKey === 'di' && (task.dueDate.includes('13') || task.title.includes('Sprint-Planning'))) {
      return true
    }
    if (dayKey === 'do' && (task.dueDate.includes('15') || task.title.includes('Review'))) {
      return true
    }
    if (dayKey === 'fr' && (task.dueDate.includes('16') || task.title.includes('Abschluss'))) {
      return true
    }

    return false
  })
}

function getCardColorClass(task: Task): string {
  const color = task.labels?.[0]?.color || task.label?.color || 'development'
  return `accent-${color}`
}
</script>

<template>
  <div class="timeline-page">
    <div class="timeline-header">
      <div>
        <h1 class="page-title">Timeline</h1>
        <p class="page-subtitle">Behalte alle Tasks auf einer Zeitachse im Blick.</p>
      </div>

      <button type="button" class="btn-primary" @click="isModalOpen = true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Neuer Task</span>
      </button>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94A3B8" stroke-width="2">
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
        <select v-model="selectedUser" class="filter-select">
          <option value="Alle">Alle User</option>
          <option value="Fabio">Fabio</option>
          <option value="Liam">Liam</option>
          <option value="Dmytro">Dmytro</option>
          <option value="Boris">Boris</option>
          <option value="Projektteam">Projektteam</option>
        </select>

        <select v-model="selectedLabel" class="filter-select">
          <option value="Alle">Labels</option>
          <option value="Development">Development</option>
          <option value="Schule">Schule</option>
          <option value="IT">IT</option>
          <option value="Design">Design</option>
          <option value="Organisation">Organisation</option>
        </select>
      </div>
    </div>

    <div class="timeline-nav-row">
      <div class="date-controls">
        <div class="nav-arrows">
          <button type="button" class="arrow-btn">‹</button>
          <button type="button" class="today-btn">Heute</button>
          <button type="button" class="arrow-btn">›</button>
        </div>
        <span class="range-text">12.–16. Oktober 2026</span>
      </div>

      <div class="view-switch">
        <button 
          type="button" 
          class="switch-btn" 
          :class="{ active: viewMode === 'week' }"
          @click="viewMode = 'week'"
        >
          Woche
        </button>
        <button 
          type="button" 
          class="switch-btn" 
          :class="{ active: viewMode === 'month' }"
          @click="viewMode = 'month'"
        >
          Monat
        </button>
      </div>
    </div>

    <div class="timeline-grid-wrapper">
      <div class="timeline-grid">
        <div class="grid-header-row">
          <div class="time-header-cell"></div>
          <div 
            v-for="day in weekDays" 
            :key="day.key" 
            class="day-header-cell"
            :class="{ 'is-today': day.isToday }"
          >
            <span class="day-name">{{ day.label }}</span>
            <span class="day-date">{{ day.date }}</span>
          </div>
        </div>

        <div 
          v-for="slot in timeSlots" 
          :key="slot" 
          class="grid-time-row"
        >
          <div class="time-cell">{{ slot }}</div>

          <div 
            v-for="day in weekDays" 
            :key="day.key" 
            class="slot-cell"
            :class="{ 'is-today-col': day.isToday }"
          >
            <div 
              v-for="task in getTasksForSlot(day.key, slot)" 
              :key="task.instanceId" 
              class="timeline-card"
              :class="getCardColorClass(task)"
              @click="openDetail(task)"
            >
              <div class="card-title">{{ task.title }}</div>
              <div class="card-meta">
                <span>{{ task.dueTime || slot }}</span>
                <span>·</span>
                <span>{{ task.assignee?.name || 'Liam' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TaskDetailDrawer 
      :is-open="isDrawerOpen" 
      :task="selectedTask" 
      @close="closeDrawer" 
      @toggle="taskStore.toggleTask" 
    />

    <TaskModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
      @create="taskStore.addTask"
    />
  </div>
</template>

<style scoped>
.timeline-page {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  box-shadow: 0 4px 14px rgba(82, 67, 224, 0.3);
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.filter-bar {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #1E293B;
  font-family: inherit;
}

.search-input::placeholder {
  color: #94A3B8;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 7px 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.82rem;
  color: #475569;
  font-family: inherit;
  outline: none;
}

.timeline-nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-arrows {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 4px;
}

.arrow-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  font-size: 1.1rem;
}

.arrow-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.today-btn {
  padding: 4px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1E293B;
  border-radius: 8px;
}

.today-btn:hover {
  background: #F8FAFC;
}

.range-text {
  font-size: 1rem;
  font-weight: 700;
  color: #1E293B;
}

.view-switch {
  display: flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
}

.switch-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748B;
  transition: all 0.15s;
}

.switch-btn.active {
  background: #FFFFFF;
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-grid-wrapper {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.timeline-grid {
  display: flex;
  flex-direction: column;
}

.grid-header-row {
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr);
  border-bottom: 1px solid #E2E8F0;
  background: #FFFFFF;
}

.time-header-cell {
  border-right: 1px solid #E2E8F0;
}

.day-header-cell {
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #E2E8F0;
}

.day-header-cell:last-child {
  border-right: none;
}

.day-header-cell.is-today {
  background: #F8F9FF;
  border-bottom: 2px solid var(--primary);
}

.day-header-cell.is-today .day-name {
  color: var(--primary);
}

.day-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1E293B;
}

.day-date {
  font-size: 0.75rem;
  color: #94A3B8;
}

.grid-time-row {
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr);
  min-height: 68px;
  border-bottom: 1px solid #F1F5F9;
}

.grid-time-row:last-child {
  border-bottom: none;
}

.time-cell {
  padding: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94A3B8;
  border-right: 1px solid #E2E8F0;
  text-align: center;
}

.slot-cell {
  border-right: 1px solid #F1F5F9;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.slot-cell:last-child {
  border-right: none;
}

.slot-cell.is-today-col {
  background: #FAFAFF;
}

.timeline-card {
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.15s;
  border-left-width: 4px;
  border-left-style: solid;
}

.timeline-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 0.72rem;
  color: #64748B;
  display: flex;
  gap: 4px;
}

.accent-development {
  background: #F5F3FF;
  border-left-color: #6366F1;
}

.accent-schule {
  background: #FAF5FF;
  border-left-color: #9333EA;
}

.accent-it {
  background: #F0F9FF;
  border-left-color: #0284C7;
}

.accent-design {
  background: #FEF2F2;
  border-left-color: #EF4444;
}

.accent-organisation {
  background: #FFFBEB;
  border-left-color: #F59E0B;
}
</style>
