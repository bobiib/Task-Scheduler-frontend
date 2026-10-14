<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskModal from '../components/tasks/TaskModal.vue'

const taskStore = useTaskStore()
const searchQuery = ref('')
const currentView = ref<'grid' | 'list'>('grid')
const selectedUser = ref('Alle')
const selectedLabel = ref('Alle')
const isModalOpen = ref(false)

onMounted(() => {
  if (taskStore.tasks.length === 0) {
    taskStore.fetchTasks()
  }
})

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
</script>

<template>
  <div class="overview-container">
    <div class="overview-header">
      <div>
        <h1 class="page-title">Meine Tasks</h1>
        <p class="page-subtitle">Plane, priorisiere und erledige deine Aufgaben an einem Ort.</p>
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

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon icon-purple">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </div>
          <span class="stat-label">Offen</span>
        </div>
        <div class="stat-value">{{ taskStore.openTasks.length }}</div>
        <div class="stat-desc">Aktuell offen</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon icon-amber">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <span class="stat-label">Heute fällig</span>
        </div>
        <div class="stat-value">
          {{ taskStore.tasks.filter(t => t.dueDate === 'Heute' || t.dueDate === new Date().toISOString().slice(0, 10)).length }}
        </div>
        <div class="stat-desc">Fällig heute</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon icon-violet">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <span class="stat-label">Diese Woche</span>
        </div>
        <div class="stat-value">{{ taskStore.tasks.length }}</div>
        <div class="stat-desc">Geplant</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon icon-green">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="stat-label">Erledigt</span>
        </div>
        <div class="stat-value">{{ taskStore.completedTasks.length }}</div>
        <div class="stat-desc stat-trend">Abgeschlossen</div>
      </div>
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

        <div class="view-switch">
          <button 
            type="button" 
            class="switch-btn" 
            :class="{ active: currentView === 'grid' }"
            @click="currentView = 'grid'"
            title="Kachelansicht"
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
            @click="currentView = 'list'"
            title="Listenansicht"
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
      <span class="tasks-count">{{ filteredTasks.filter(t => !t.completed).length }} offen</span>
    </div>

    <div v-if="taskStore.loading" class="loading-state">
      <div class="spinner"></div>
      <span>Tasks werden geladen...</span>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <p>Keine Tasks gefunden. Erstelle jetzt deinen ersten Task!</p>
    </div>

    <div v-else-if="currentView === 'grid'" class="tasks-grid">
      <TaskCard 
        v-for="task in filteredTasks" 
        :key="task.instanceId" 
        :task="task" 
        @toggle="taskStore.toggleTask"
      />
    </div>

    <div v-else class="tasks-list">
      <div 
        v-for="task in filteredTasks" 
        :key="task.instanceId" 
        class="task-list-item"
        :class="{ 'is-completed': task.completed }"
      >
        <button 
          type="button" 
          class="checkbox-btn" 
          :class="{ checked: task.completed }"
          @click="taskStore.toggleTask(task.instanceId)"
        >
          <svg v-if="task.completed" viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="3" fill="none">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>

        <div class="list-title-box">
          <span class="list-task-title">{{ task.title }}</span>
          <span class="label-badge" :class="`label-${(task.labels?.[0] || task.label)?.color || 'development'}`">
            {{ (task.labels?.[0] || task.label)?.name || 'Task' }}
          </span>
        </div>

        <div class="list-meta">
          <span>{{ task.dueDate }}</span>
          <span v-if="task.dueTime">· {{ task.dueTime }}</span>
        </div>

        <div class="list-assignee">
          <span class="avatar-mini">{{ task.assignee?.initials || 'TS' }}</span>
          <span>{{ task.assignee?.name || 'Nicht zugewiesen' }}</span>
        </div>
      </div>
    </div>

    <TaskModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
      @create="taskStore.addTask"
    />
  </div>
</template>

<style scoped>
.overview-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.overview-header {
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
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-purple { background: #EEF2FF; color: #6366F1; }
.icon-amber { background: #FEF3C7; color: #D97706; }
.icon-violet { background: #F3E8FF; color: #9333EA; }
.icon-green { background: #DCFCE7; color: #16A34A; }

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748B;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.1;
  margin-bottom: 6px;
}

.stat-desc {
  font-size: 0.8rem;
  color: #94A3B8;
}

.stat-trend {
  color: #16A34A;
  font-weight: 600;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-list-item {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.15s;
}

.task-list-item:hover {
  border-color: #CBD5E1;
}

.task-list-item.is-completed {
  opacity: 0.6;
}

.task-list-item.is-completed .list-task-title {
  text-decoration: line-through;
}

.checkbox-btn {
  width: 22px;
  height: 22px;
  border: 2px solid #CBD5E1;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  flex-shrink: 0;
}

.checkbox-btn.checked {
  background: var(--primary);
  border-color: var(--primary);
}

.list-title-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-task-title {
  font-weight: 600;
  color: #1E293B;
  font-size: 0.95rem;
}

.list-meta {
  font-size: 0.82rem;
  color: #64748B;
  font-weight: 500;
}

.list-assignee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #475569;
}

.avatar-mini {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: #FFFFFF;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
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
  to { transform: rotate(360deg); }
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
