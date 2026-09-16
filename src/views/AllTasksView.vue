<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'

const taskStore = useTaskStore()
const searchQuery = ref('')
const selectedStatus = ref('Alle')
const viewMode = ref<'grid' | 'table'>('grid')

const isDrawerOpen = ref(false)
const selectedTask = ref<Task | null>(null)

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
      if (!task.title.toLowerCase().includes(suchWort)) {
        return false
      }
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
      <button type="button" class="primary-button">＋ Neuer Task</button>
    </div>

    <div class="alltasks-summary">
      <div class="summary-left">
        <span class="summary-badge">
          <strong>{{ taskStore.tasks.length }}</strong> Tasks gesamt
        </span>
        <span class="summary-badge open">
          <strong>{{ taskStore.openTasks.length }}</strong> offen
        </span>
        <span class="summary-badge recurring">
          <strong>{{ taskStore.tasks.filter(t => !!t.recurrence).length }}</strong> wiederkehrend
        </span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tasks durchsuchen ..." 
        />
      </div>

      <select v-model="selectedStatus" class="filter-select">
        <option value="Alle">Status: Alle</option>
        <option value="Offen">Status: Offen</option>
        <option value="Erledigt">Status: Erledigt</option>
      </select>

      <div class="toolbar-spacer"></div>

      <div class="view-toggle">
        <button 
          type="button" 
          :class="{ active: viewMode === 'grid' }" 
          @click="viewMode = 'grid'"
          title="Kacheln"
        >
          ▦
        </button>
        <button 
          type="button" 
          :class="{ active: viewMode === 'table' }" 
          @click="viewMode = 'table'"
          title="Tabelle"
        >
          ≡
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'grid'" class="task-grid">
      <TaskCard 
        v-for="task in filteredTasks" 
        :key="task.id" 
        :task="task" 
        @toggle="taskStore.toggleTask" 
        @click="openDetail"
      />
    </div>

    <div v-else class="task-table-card">
      <div class="task-table-head">
        <div>Task</div>
        <div>Termin</div>
        <div>Wiederholung</div>
        <div>Zugewiesen</div>
        <div>Status</div>
        <div></div>
      </div>

      <div class="task-table-body">
        <div 
          v-for="t in filteredTasks" 
          :key="t.id"
          class="task-table-row"
          :class="{ 'is-completed': t.completed }"
          @click="openDetail(t)"
        >
          <div class="task-cell-main">
            <div class="task-row-title">{{ t.title }}</div>
            <div class="task-row-sub">
              <span class="label-badge" :class="`label-${t.label.color}`">{{ t.label.name }}</span>
              <span v-if="t.reminder" class="row-meta">♢ {{ t.reminder }}</span>
            </div>
          </div>

          <div>
            <div class="date-chip" :class="{ urgent: t.isDueToday }">
              <span>{{ t.dueDate }}{{ t.dueTime ? ` · ${t.dueTime}` : '' }}</span>
            </div>
          </div>

          <div>
            <span v-if="t.recurrence" class="repeat-chip">↻ {{ t.recurrence }}</span>
            <span v-else class="repeat-chip once">Einmalig</span>
          </div>

          <div class="table-assignee">
            <span class="avatar small">{{ t.assignee.initials }}</span>
            <span>{{ t.assignee.name }}</span>
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
              @click.stop="taskStore.toggleTask(t.id)"
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
  </div>
</template>

<style scoped>
.all-tasks-page {
  max-width: 1300px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 22px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: #1E293B;
}

.page-subtitle {
  color: #64748B;
  font-size: 0.9rem;
  margin-top: 4px;
}

.primary-button {
  background: #5243E0;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  height: 42px;
  padding: 0 18px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(82, 67, 224, 0.2);
  transition: all 0.15s;
}

.primary-button:hover {
  background: #4333D0;
  transform: translateY(-1px);
}

.alltasks-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-left {
  display: flex;
  gap: 10px;
}

.summary-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  font-size: 0.8rem;
  color: #475569;
}

.summary-badge.open {
  background: #F7F5FF;
  border-color: #E4DFFF;
}

.summary-badge.open strong {
  color: #5243E0;
}

.summary-badge.recurring {
  background: #F0FDF4;
  border-color: #DCFCE7;
}

.summary-badge.recurring strong {
  color: #16A34A;
}

.toolbar {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 0 12px;
  max-width: 380px;
  flex: 1;
}

.search-box:focus-within {
  border-color: #5243E0;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.85rem;
  color: #1E293B;
  background: transparent;
}

.search-icon {
  font-size: 0.9rem;
  opacity: 0.6;
}

.filter-select {
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  background-color: #FFFFFF;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #5243E0;
}

.toolbar-spacer {
  margin-left: auto;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 9px;
}

.view-toggle button {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  background: transparent;
}

.view-toggle button.active {
  background: #FFFFFF;
  color: #5243E0;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.task-table-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
}

.task-table-head,
.task-table-row {
  display: grid;
  grid-template-columns: minmax(280px, 1.9fr) minmax(150px, 1fr) minmax(140px, 0.85fr) minmax(150px, 0.9fr) 115px 44px;
  align-items: center;
  column-gap: 18px;
}

.task-table-head {
  min-height: 48px;
  padding: 0 20px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  color: #64748B;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.task-table-row {
  min-height: 80px;
  padding: 14px 20px;
  border-bottom: 1px solid #F1F5F9;
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.task-table-row:last-child {
  border-bottom: none;
}

.task-table-row:hover {
  background-color: #FAFBFF;
}

.task-table-row.is-completed {
  opacity: 0.6;
}

.task-table-row.is-completed .task-row-title {
  text-decoration: line-through;
  color: #94A3B8;
}

.task-cell-main {
  min-width: 0;
}

.task-row-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-row-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.row-meta {
  color: #94A3B8;
  font-size: 0.75rem;
}

.date-chip {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 500;
}

.date-chip.urgent {
  color: #D97706;
  font-weight: 600;
}

.repeat-chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #F1F5FF;
  color: #4F46E5;
  font-size: 0.72rem;
  font-weight: 600;
}

.repeat-chip.once {
  background: #F8FAFC;
  color: #64748B;
  border: 1px solid #E2E8F0;
}

.table-assignee {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.82rem;
  min-width: 0;
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #5243E0;
  color: #FFFFFF;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar.small {
  width: 24px;
  height: 24px;
  font-size: 0.65rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
}

.status-badge.open {
  color: #475569;
  background: #F1F5F9;
}

.status-badge.done {
  color: #16A34A;
  background: #ECFDF5;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94A3B8;
}

.status-badge.done .status-dot {
  background: #22C55E;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
}

.row-check-button {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.row-check-button:hover {
  border-color: #5243E0;
  color: #5243E0;
}

.row-check-button.checked {
  background: #5243E0;
  border-color: #5243E0;
  color: #FFFFFF;
}

.label-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}

.label-development { background-color: #EEF2FF; color: #4F46E5; }
.label-schule { background-color: #F3E8FF; color: #9333EA; }
.label-it { background-color: #E0F2FE; color: #0284C7; }
.label-design { background-color: #FEE2E2; color: #EF4444; }
.label-organisation { background-color: #FEF3C7; color: #D97706; }
</style>