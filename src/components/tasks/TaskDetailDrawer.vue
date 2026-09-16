<script setup lang="ts">
import type { Task } from '../../types/task'

defineProps<{
  task: Task | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle', id: string): void
}>()
</script>

<template>
  <div v-if="isOpen" class="drawer-overlay" @click.self="emit('close')">
    <aside class="drawer">
      <div class="drawer-header">
        <div>
          <span v-if="task" class="label-badge" :class="`label-${task.label.color}`">
            {{ task.label.name }}
          </span>
          <h2 class="drawer-title">{{ task?.title }}</h2>
        </div>
        <button type="button" class="close-button" @click="emit('close')">✕</button>
      </div>

      <div class="drawer-body" v-if="task">
        <p class="drawer-desc">{{ task.description || 'Keine Beschreibung hinterlegt.' }}</p>

        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Fällig</span>
            <strong class="detail-value">
              {{ task.dueDate }}{{ task.dueTime ? ` · ${task.dueTime}` : '' }}
            </strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Zugewiesen</span>
            <strong class="detail-value">{{ task.assignee.name }}</strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Wiederholung</span>
            <strong class="detail-value">{{ task.recurrence || 'Einmalig' }}</strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Reminder</span>
            <strong class="detail-value">{{ task.reminder || 'Kein Reminder' }}</strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Status</span>
            <strong class="detail-value">{{ task.completed ? 'Erledigt' : 'Offen' }}</strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Typ</span>
            <strong class="detail-value">
              {{ task.recurrence ? 'Wiederkehrender Task' : 'Einmaliger Task' }}
            </strong>
          </div>
        </div>

        <div v-if="task.recurrence" class="recurrence-notice">
          <span>Beim Abschliessen wird nur diese einzelne Instanz als erledigt markiert. Zukünftige Instanzen bleiben offen.</span>
        </div>
      </div>

      <div class="drawer-footer" v-if="task">
        <button type="button" class="secondary-button" @click="emit('close')">Schliessen</button>
        <button 
          type="button" 
          class="primary-button" 
          @click="emit('toggle', task.id)"
        >
          {{ task.completed ? 'Wieder öffnen' : 'Als erledigt markieren' }}
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: min(480px, 94vw);
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -10px 0 30px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.drawer-title {
  margin-top: 10px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.3;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
}

.close-button:hover {
  background: #E2E8F0;
  color: #1E293B;
}

.drawer-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.drawer-desc {
  color: #64748B;
  font-size: 0.88rem;
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 24px;
}

.detail-item {
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
  border-radius: 12px;
  padding: 14px;
}

.detail-label {
  display: block;
  color: #94A3B8;
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 6px;
}

.detail-value {
  font-size: 0.85rem;
  color: #1E293B;
}

.recurrence-notice {
  margin-top: 22px;
  padding: 14px;
  border-radius: 12px;
  background: #FFFBEB;
  border: 1px solid #FEF3C7;
  color: #B45309;
  font-size: 0.78rem;
  line-height: 1.5;
}

.drawer-footer {
  padding: 20px 24px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.secondary-button {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  color: #334155;
  border-radius: 10px;
  height: 40px;
  padding: 0 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.primary-button {
  background: #5243E0;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  height: 40px;
  padding: 0 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
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
