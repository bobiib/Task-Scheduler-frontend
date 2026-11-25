<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'
import TaskModal from '../components/tasks/TaskModal.vue'

import FilterDropdown from '../components/tasks/FilterDropdown.vue'
import { useTaskFilters } from '../composables/useTaskFilters'

const taskStore = useTaskStore()
const {
  searchQuery, selectedStatus, selectedLabel, selectedAssignee, selectedTimeframe,
  labelOptions, assigneeGroups, timeframeOptions, hasActiveFilters,
  resetFilters, loadFilterOptions, filteredTasks,
} = useTaskFilters()
const todayCount = computed(() => {
  const today = new Date().toLocaleDateString('sv-SE')
  return taskStore.tasks.filter(task => task.dueDate === today || task.dueDate === 'Heute').length
})
const visibleOpenCount = computed(() => filteredTasks.value.filter(task => !task.completed).length)
const currentView = ref<'grid' | 'list'>('grid')
const isModalOpen = ref(false)
const isDrawerOpen = ref(false)
const selectedInstanceId = ref<number | null>(null)
const editingTask = ref<Task | null>(null)
const selectedTask = computed(() =>
  taskStore.tasks.find(task => task.instanceId === selectedInstanceId.value) ?? null
)

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

onMounted(() => {
  taskStore.fetchTasks()
  loadFilterOptions()
})
</script>

<template>
  <div class="overview-container">
    <div class="overview-header">
      <div>
        <h1 class="page-title">Meine Tasks</h1>
      </div>

      <button type="button" class="btn-primary" @click="isModalOpen = true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Neuer Task</span>
      </button>
    </div>

    <div v-if="taskStore.error" class="error-banner">
      <span>{{ taskStore.error }}</span>
      <button type="button" class="retry-btn" @click="taskStore.fetchTasks">Wiederholen</button>
    </div>

    <dl class="stats-grid" aria-label="Aufgabenübersicht">
      <div class="stat-today">
        <dt>Heute fällig</dt>
        <dd>{{ todayCount }}</dd>
      </div>
      <div>
        <dt>Offen</dt>
        <dd>{{ taskStore.openTasks.length }}</dd>
      </div>
      <div>
        <dt>Erledigt</dt>
        <dd>{{ taskStore.completedTasks.length }}</dd>
      </div>
      <div>
        <dt>Gesamt</dt>
        <dd>{{ taskStore.tasks.length }}</dd>
      </div>
    </dl>

    <div class="filter-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94A3B8" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tasks durchsuchen ..." aria-label="Tasks durchsuchen"
          class="search-input"
        />
      </div>

      <div class="filter-actions">
        <FilterDropdown v-model="selectedStatus" prefix="Status" :options="['Alle', 'Offen', 'Erledigt']" />
        <FilterDropdown v-model="selectedAssignee" prefix="Zuweisung" :groups="assigneeGroups" />
        <FilterDropdown v-model="selectedTimeframe" prefix="Zeitraum" :options="timeframeOptions" />
        <FilterDropdown v-model="selectedLabel" prefix="Label" :options="labelOptions" />
        <button v-if="hasActiveFilters" type="button" class="reset-filters" @click="resetFilters">
          Filter zurücksetzen
        </button>

        <div class="view-switch">
          <button 
            type="button" 
            class="switch-btn" 
            :class="{ active: currentView === 'grid' }"
            aria-label="Kachelansicht" :aria-pressed="currentView === 'grid'" @click="currentView = 'grid'"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </button>
          <button 
            type="button" 
            class="switch-btn" 
            :class="{ active: currentView === 'list' }"
            aria-label="Listenansicht" :aria-pressed="currentView === 'list'" @click="currentView = 'list'"
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
        </div>
      </div>
    </div>

    <div class="section-title-row">
      <h2 class="section-title">Aktuelle Tasks</h2>
      <span class="tasks-count">{{ visibleOpenCount }} offen</span>
    </div>

    <div v-if="taskStore.loading" class="loading-state">
      <div class="spinner"></div>
      <span>Tasks werden geladen...</span>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <p>Keine Tasks gefunden.</p>
    </div>

    <div v-else class="tasks-grid" :class="{ 'tasks-list': currentView === 'list' }">
      <TaskCard 
        v-for="task in filteredTasks"
        :key="task.instanceId" 
        :task="task" 
        @toggle="taskStore.toggleTask"
        @click="openDetail"
      />
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
      :is-open="isModalOpen || editingTask !== null" 
      :task="editingTask"
      @close="isModalOpen = false; editingTask = null" 
    />
  </div>
</template>

<style scoped>
.overview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-header {
  flex-wrap: wrap;
  gap: 12px;
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
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.error-banner {
  background-color: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #B91C1C;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
}

.retry-btn {
  background-color: #EF4444;
  color: #FFFFFF;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 6rem), 1fr));
  width: min(100%, 29rem);
  gap: 12px;
}

.stats-grid > div {
  display: grid;
  align-content: center;
  aspect-ratio: 1.18;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-card);
}

.stats-grid .stat-today {
  background: var(--primary-light);
}

.stats-grid .stat-today dt,
.stats-grid .stat-today dd {
  color: var(--primary-hover);
}

.stats-grid dt {
  font-size: .875rem;
  color: var(--text-secondary);
}

.stats-grid dd {
  margin-top: 4px;
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.filter-bar {
  flex-wrap: wrap;
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
  flex: 1 1 200px;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #1E293B;
  font-family: inherit;
}

.search-box:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.search-input::placeholder {
  color: #94A3B8;
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.reset-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #475569;
}

.reset-filters:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
}

.chevron {
  font-size: 0.75rem;
  color: #94A3B8;
}

.view-switch {
  display: flex;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
}

.switch-btn {
  padding: 5px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
}

.switch-btn.active {
  background: #FFFFFF;
  color: var(--primary);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1E293B;
}

.tasks-count {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748B;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, max(240px, (100% - 32px) / 3)), 1fr));
  gap: 16px;
}

.tasks-list {
  grid-template-columns: 1fr;
}

.loading-state,
.empty-state {
  background: #FFFFFF;
  border: 1px dashed #CBD5E1;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  color: #64748B;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #E2E8F0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
