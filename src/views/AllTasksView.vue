<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskModal from '../components/tasks/TaskModal.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'

const taskStore = useTaskStore()
const searchQuery = ref('')
const selectedStatus = ref('Alle')
const viewMode = ref<'grid' | 'table'>('table')

const isDrawerOpen = ref(false)
const isModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)

onMounted(() => {
  if (taskStore.tasks.length === 0) {
    taskStore.fetchTasks()
  }
})

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
      const suchWort = searchQuery.value.toLowerCase()
      const matchTitle = task.title.toLowerCase().includes(suchWort)
      const matchDesc = task.description?.toLowerCase().includes(suchWort) || false
      if (!matchTitle && !matchDesc) return false
    }

    if (selectedStatus.value === 'Offen' && task.completed) {
      return false
    }
    if (selectedStatus.value === 'Erledigt' && !task.completed) {
      return false
    }

    return true
  })
})
</script>

<template>
  <div class="all-tasks-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Alle Tasks</h1>
        <p class="page-subtitle">Alle einmaligen und wiederkehrenden Tasks zentral verwalten.</p>
      </div>
      <button type="button" class="primary-button" @click="isModalOpen = true">＋ Neuer Task</button>
    </div>

    <div class="alltasks-summary">
      <div class="summary-left">
        <span class="summary-badge">
          <strong>{{ taskStore.tasks.length }}</strong> Tasks gesamt
        </span>
        <span class="summary-badge open-badge">
          <strong>{{ taskStore.openTasks.length }}</strong> offen
        </span>
        <span class="summary-badge recurring-badge">
          <strong>{{ taskStore.tasks.filter(t => !!t.recurrence).length }}</strong> wiederkehrend
        </span>
      </div>
      <div class="summary-right">
        <span>Letzte Aktualisierung: heute</span>
      </div>
    </div>

    <div class="filter-controls">
      <div class="search-field">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94A3B8" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tasks durchsuchen ..." 
        />
      </div>

      <div class="filter-group">
        <select v-model="selectedStatus" class="dropdown-select">
          <option value="Alle">Alle Status</option>
          <option value="Offen">Nur Offen</option>
          <option value="Erledigt">Nur Erledigt</option>
        </select>

        <div class="view-toggle">
          <button 
            type="button" 
            class="toggle-btn" 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
            title="Tabellenansicht"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button 
            type="button" 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="Kachelansicht"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="taskStore.loading" class="empty-state">
      <p>Tasks werden geladen...</p>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <p>Keine Tasks entsprechen den Suchkriterien.</p>
    </div>

    <div v-else-if="viewMode === 'grid'" class="tasks-cards-grid">
      <TaskCard 
        v-for="t in filteredTasks" 
        :key="t.instanceId" 
        :task="t" 
        @toggle="taskStore.toggleTask"
        @click="openDetail(t)"
      />
    </div>

    <div v-else class="task-table-wrapper">
      <div class="task-table">
        <div class="task-table-header">
          <div>Task</div>
          <div>Termin</div>
          <div>Wiederholung</div>
          <div>Zugewiesen</div>
          <div>Status</div>
          <div class="text-right">Aktion</div>
        </div>

        <div 
          v-for="t in filteredTasks" 
          :key="t.instanceId"
          class="task-table-row"
          :class="{ 'is-completed': t.completed }"
          @click="openDetail(t)"
        >
          <div class="task-cell-main">
            <div class="task-row-title">{{ t.title }}</div>
            <div class="task-row-sub">
              <span class="label-badge" :class="`label-${(t.labels?.[0] || t.label)?.color || 'development'}`">
                {{ (t.labels?.[0] || t.label)?.name || 'Task' }}
              </span>
              <span v-if="t.reminder" class="row-meta">♢ {{ t.reminder }}</span>
            </div>
          </div>

          <div>
            <div class="date-chip" :class="{ urgent: t.dueDate === 'Heute' }">
              <span>{{ t.dueDate }}{{ t.dueTime ? ` · ${t.dueTime}` : '' }}</span>
            </div>
          </div>

          <div>
            <span v-if="t.recurrence" class="repeat-chip">↻ {{ t.recurrence }}</span>
            <span v-else class="repeat-chip once">Einmalig</span>
          </div>

          <div class="table-assignee">
            <span class="avatar small">{{ t.assignee?.initials || 'TS' }}</span>
            <span>{{ t.assignee?.name || 'Nicht zugewiesen' }}</span>
          </div>

          <div>
            <span class="status-badge" :class="t.completed ? 'done' : 'open'">
              <span class="status-dot"></span>
              {{ t.completed ? 'Erledigt' : 'Offen' }}
            </span>
          </div>

          <div class="table-actions">
            <button 
              type="button" 
              class="row-check-button" 
              :class="{ checked: t.completed }"
              @click.stop="taskStore.toggleTask(t.instanceId)"
              title="Status ändern"
            >
              ✓
            </button>
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
.all-tasks-page {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
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

.primary-button {
  background: var(--primary);
  color: #FFFFFF;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 14px rgba(82, 67, 224, 0.3);
  transition: all 0.2s;
}

.primary-button:hover {
  background: var(--primary-hover);
}

.alltasks-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #64748B;
}

.summary-left {
  display: flex;
  gap: 8px;
}

.summary-badge {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 500;
}

.summary-badge strong {
  color: #1E293B;
}

.open-badge {
  color: #4F46E5;
}

.recurring-badge {
  color: #0284C7;
}

.filter-controls {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.search-field input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #1E293B;
  font-family: inherit;
}

.search-field input::placeholder {
  color: #94A3B8;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-select {
  padding: 7px 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.82rem;
  color: #475569;
  font-family: inherit;
  outline: none;
}

.view-toggle {
  display: flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
}

.toggle-btn {
  padding: 5px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
}

.toggle-btn.active {
  background: #FFFFFF;
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state {
  background: #FFFFFF;
  border: 1px dashed #CBD5E1;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  color: #64748B;
}

.tasks-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.task-table-wrapper {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.task-table-header {
  display: grid;
  grid-template-columns: 2.2fr 1.2fr 1fr 1.4fr 1fr 0.6fr;
  padding: 14px 24px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.task-table-row {
  display: grid;
  grid-template-columns: 2.2fr 1.2fr 1fr 1.4fr 1fr 0.6fr;
  padding: 16px 24px;
  align-items: center;
  border-bottom: 1px solid #F1F5F9;
  cursor: pointer;
  transition: background-color 0.15s;
}

.task-table-row:last-child {
  border-bottom: none;
}

.task-table-row:hover {
  background-color: #F8FAFC;
}

.task-table-row.is-completed {
  opacity: 0.65;
}

.task-table-row.is-completed .task-row-title {
  text-decoration: line-through;
}

.task-row-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1E293B;
  margin-bottom: 6px;
}

.task-row-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-meta {
  font-size: 0.75rem;
  color: #64748B;
}

.date-chip {
  font-size: 0.82rem;
  color: #475569;
  font-weight: 500;
}

.date-chip.urgent {
  color: #D97706;
  font-weight: 600;
}

.repeat-chip {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  background: #F1F5F9;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 500;
}

.repeat-chip.once {
  color: #94A3B8;
  background: transparent;
}

.table-assignee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #334155;
  font-weight: 500;
}

.avatar.small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: #FFF;
  font-size: 0.68rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.status-badge.open {
  background: #FEF3C7;
  color: #D97706;
}

.status-badge.done {
  background: #DCFCE7;
  color: #16A34A;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
}

.row-check-button {
  width: 26px;
  height: 26px;
  border: 2px solid #CBD5E1;
  border-radius: 8px;
  background: #FFFFFF;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.15s;
}

.row-check-button:hover {
  border-color: var(--primary);
}

.row-check-button.checked {
  background: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
}

.text-right {
  text-align: right;
}

.label-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}

.label-development { background-color: #EEF2FF; color: #4F46E5; }
.label-schule { background-color: #F3E8FF; color: #9333EA; }
.label-it { background-color: #E0F2FE; color: #0284C7; }
.label-design { background-color: #FEE2E2; color: #EF4444; }
.label-organisation { background-color: #FEF3C7; color: #D97706; }
</style>
