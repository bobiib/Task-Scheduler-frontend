<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'
import TaskModal from '../components/tasks/TaskModal.vue'
import FilterDropdown from '../components/tasks/FilterDropdown.vue'
import { useTaskFilters } from '../composables/useTaskFilters'

const taskStore = useTaskStore()
const {
  selectedStatus, searchQuery, selectedLabel, selectedAssignee, selectedTimeframe,
  labelOptions, assigneeGroups, timeframeOptions, hasActiveFilters,
  resetFilters, loadFilterOptions, filteredTasks,
} = useTaskFilters()
const viewMode = ref<'grid' | 'table'>('table')

const isDrawerOpen = ref(false)
const isCreateModalOpen = ref(false)
const selectedInstanceId = ref<number | null>(null)
const editingTask = ref<Task | null>(null)
const selectedTask = computed(() =>
  taskStore.tasks.find(task => task.instanceId === selectedInstanceId.value) ?? null
)

onMounted(() => {
  taskStore.fetchTasks()
  loadFilterOptions()
})

function formatRecurrence(recurrence: NonNullable<Task['recurrence']>) {
  const labels: Record<string, string> = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    monthly_day: 'Monatlich',
    monthly_weekday: 'Monatlich',
    yearly: 'Jährlich',
  }
  const type = typeof recurrence === 'string' ? recurrence : recurrence.type
  return labels[type] ?? type
}

function openDetail(task: Task) {
  selectedInstanceId.value = task.instanceId
  isDrawerOpen.value = true
}

function closeDrawer() {
  isDrawerOpen.value = false
  selectedInstanceId.value = null
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
</script>

<template>
  <div class="all-tasks-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Alle Tasks</h1>
        <p class="page-subtitle">Alle einmaligen und wiederkehrenden Tasks zentral verwalten.</p>
      </div>
      <button type="button" class="primary-button" @click="isCreateModalOpen = true">＋ Neuer Task</button>
    </div>

    <p v-if="taskStore.error" class="error-message">{{ taskStore.error }}</p>

    <dl class="alltasks-summary" aria-label="Aufgabenübersicht">
      <div class="summary-open">
        <dt>Offen</dt>
        <dd>{{ taskStore.openTasks.length }}</dd>
      </div>
      <div>
        <dt>Gesamt</dt>
        <dd>{{ taskStore.tasks.length }}</dd>
      </div>
      <div>
        <dt>Wiederkehrend</dt>
        <dd>{{ taskStore.tasks.filter(task => !!task.recurrence).length }}</dd>
      </div>
    </dl>

    <div class="toolbar">
      <div class="search-box">
        <svg class="search-icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tasks durchsuchen ..." aria-label="Tasks durchsuchen"
        />
      </div>

      <FilterDropdown
        v-model="selectedStatus"
        prefix="Status"
        :options="['Alle', 'Offen', 'Erledigt']"
      />

      <FilterDropdown
        v-model="selectedLabel"
        prefix="Label"
        :options="labelOptions"
      />

      <FilterDropdown
        v-model="selectedAssignee"
        prefix="Zuweisung"
        :groups="assigneeGroups"
      />

      <FilterDropdown
        v-model="selectedTimeframe"
        prefix="Zeitraum"
        :options="timeframeOptions"
      />

      <button 
        v-if="hasActiveFilters" 
        type="button" 
        class="btn-reset-filters" 
        @click="resetFilters"
        title="Filter zurücksetzen"
      >
        Filter zurücksetzen ✕
      </button>

      <div class="toolbar-spacer"></div>

      <div class="view-toggle">
        <button 
          type="button" 
          :class="{ active: viewMode === 'grid' }" 
          @click="viewMode = 'grid'"
          title="Kacheln" aria-label="Kacheln" :aria-pressed="viewMode === 'grid'"
        >
          ▦
        </button>
        <button 
          type="button" 
          :class="{ active: viewMode === 'table' }" 
          @click="viewMode = 'table'"
          title="Tabelle" aria-label="Tabelle" :aria-pressed="viewMode === 'table'"
        >
          ≡
        </button>
      </div>
    </div>

    <p v-if="taskStore.loading">Tasks werden geladen...</p>
    <p v-else-if="filteredTasks.length === 0">Keine Tasks gefunden.</p>
    <div v-else-if="viewMode === 'grid'" class="task-grid">
      <TaskCard 
        v-for="task in filteredTasks" 
        :key="task.instanceId"
        :task="task" 
        @toggle="taskStore.toggleTask" 
        @click="openDetail"
      />
    </div>

    <div v-else class="task-table-card" role="table" aria-label="Alle Tasks">
      <div class="task-table-head" role="row">
        <div role="columnheader">Task</div>
        <div role="columnheader">Termin</div>
        <div role="columnheader">Wiederholung</div>
        <div role="columnheader">Zugewiesen</div>
        <div role="columnheader">Status</div>
        <div role="columnheader" aria-label="Aktionen"></div>
      </div>

      <div class="task-table-body" role="rowgroup">
        <div 
          v-for="t in filteredTasks" 
          :key="t.instanceId"
          class="task-table-row" role="row"
          :class="{ 'is-completed': t.completed }"
          @click="openDetail(t)"
        >
          <div class="task-cell-main" role="cell">
            <button type="button" class="task-row-title" @click.stop="openDetail(t)">{{ t.title }}</button>
            <div class="task-row-sub">
              <span class="label-badge" :class="`label-${(t.labels?.[0] || t.label)?.color || 'development'}`">
                {{ (t.labels?.[0] || t.label)?.name || 'Task' }}
              </span>
              <span v-if="t.reminder" class="row-meta">♢ {{ t.reminder }}</span>
            </div>
          </div>

          <div role="cell">
            <div class="date-chip" :class="{ urgent: t.isDueToday }">
              <span>{{ t.dueDate }}{{ t.dueTime ? ` · ${t.dueTime.slice(0, 5)}` : '' }}</span>
            </div>
          </div>

          <div role="cell">
            <span v-if="t.recurrence" class="repeat-chip">{{ formatRecurrence(t.recurrence) }}</span>
            <span v-else class="repeat-chip once">Einmalig</span>
          </div>

          <div class="table-assignee" role="cell">
            <span v-if="t.assignee" class="avatar small" aria-hidden="true">{{ t.assignee.initials }}</span>
            <span>{{ t.assignee?.name || 'Nicht zugewiesen' }}</span>
          </div>

          <div role="cell">
            <span class="status-badge" :class="t.completed ? 'done' : 'open'">
              <span class="status-dot"></span>
              {{ t.completed ? 'Erledigt' : 'Offen' }}
            </span>
          </div>

          <div class="table-actions" role="cell">
            <button 
              type="button" 
              class="row-check-button" 
              :class="{ checked: t.completed }"
              @click.stop="taskStore.toggleTask(t.instanceId)"
              :aria-label="t.completed ? 'Wieder öffnen' : 'Als erledigt markieren'" :aria-pressed="t.completed"
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
      @edit="editTask"
      @delete="deleteTask"
    />

    <TaskModal
      :is-open="isCreateModalOpen || editingTask !== null"
      :task="editingTask"
      @close="isCreateModalOpen = false; editingTask = null"
    />
  </div>
</template>

<style scoped>
.all-tasks-page {
  max-width: 1300px;
  margin: 0 auto;
}

.error-message {
  color: #E11D48;
  font-size: 0.9rem;
  margin-bottom: 16px;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
  width: min(100%, calc(24rem + 24px));
  gap: 12px;
  margin-bottom: 20px;
}

.alltasks-summary > div {
  display: grid;
  align-content: center;
  aspect-ratio: 1.18;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-card);
}

.alltasks-summary dt {
  color: var(--text-secondary);
  font-size: .8125rem;
  overflow-wrap: anywhere;
}

.alltasks-summary dd {
  margin-top: 4px;
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.alltasks-summary .summary-open {
  background: var(--primary-light);
}

.summary-open dt,
.summary-open dd {
  color: var(--primary-hover);
}

.toolbar {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 248px), 1fr));
  gap: 18px;
}

.task-table-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow-x: auto;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
}

.task-table-head,
.task-table-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 88px 40px;
  align-items: center;
  column-gap: 12px;
  min-width: 660px;
  overflow-wrap: anywhere;
}

.task-table-head {
  min-height: 48px;
  padding: 0 20px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  color: #64748B;
  font-size: 0.72rem;
  font-weight: 700;
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
  background-color: #e9edf2;
}

.task-table-row.is-completed:hover {
  background-color: #e2e8f0;
}

.task-table-row.is-completed .task-row-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-cell-main {
  min-width: 0;
}

.task-row-title {
  display: block;
  max-width: 100%;
  text-align: left;
  overflow-wrap: anywhere;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1E293B;
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

.btn-reset-filters {
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px dashed #CBD5E1;
  background: #F8FAFC;
  color: #64748B;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-reset-filters:hover {
  background: #F1F5F9;
  color: #E11D48;
  border-color: #FDA4AF;
}
</style>
