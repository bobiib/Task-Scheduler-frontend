<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'

const taskStore = useTaskStore()
const searchQuery = ref('')
const currentView = ref<'grid' | 'list'>('grid')
</script>

<template>
  <div class="overview-container">
    <div class="overview-header">
      <div>
        <h1 class="page-title">Meine Tasks</h1>
        <p class="page-subtitle">Plane, priorisiere und erledige deine Aufgaben an einem Ort.</p>
      </div>

      <button type="button" class="btn-primary">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Neuer Task</span>
      </button>
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
        <div class="stat-value">8</div>
        <div class="stat-desc">2 neu seit gestern</div>
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
        <div class="stat-value">3</div>
        <div class="stat-desc">Nächster um 14:00</div>
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
        <div class="stat-value">12</div>
        <div class="stat-desc">Bis Freitag geplant</div>
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
        <div class="stat-value">24</div>
        <div class="stat-desc stat-trend">+18% diese Woche</div>
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
        <button type="button" class="filter-dropdown">
          <span>Alle User</span>
          <span class="chevron">⌵</span>
        </button>

        <button type="button" class="filter-dropdown">
          <span>Zeitraum</span>
          <span class="chevron">⌵</span>
        </button>

        <button type="button" class="filter-dropdown">
          <span>Labels</span>
          <span class="chevron">⌵</span>
        </button>

        <div class="view-switch">
          <button 
            type="button" 
            class="switch-btn" 
            :class="{ active: currentView === 'grid' }"
            @click="currentView = 'grid'"
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
      <span class="tasks-count">{{ taskStore.openTasks.length }} offen</span>
    </div>

    <div class="tasks-grid">
      <TaskCard 
        v-for="task in taskStore.tasks" 
        :key="task.id" 
        :task="task" 
        @toggle="taskStore.toggleTask"
      />
    </div>
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

.icon-purple {
  background: #EEF2FF;
  color: #6366F1;
}

.icon-amber {
  background: #FEF3C7;
  color: #D97706;
}

.icon-violet {
  background: #F3E8FF;
  color: #9333EA;
}

.icon-green {
  background: #DCFCE7;
  color: #16A34A;
}

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

.filter-dropdown {
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
  transition: all 0.15s;
}

.filter-dropdown:hover {
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
  transition: all 0.15s;
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
</style>
