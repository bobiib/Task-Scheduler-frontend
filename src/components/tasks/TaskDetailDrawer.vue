<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskLabel } from '../../types/task'

const props = defineProps<{
  task: Task | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle', instanceId: number): void
  (e: 'edit', task: Task): void
  (e: 'delete', id: number): void
}>()

const primaryLabel = computed<TaskLabel>(() => {
  const first = props.task?.labels?.[0] || props.task?.label
  if (first) {
    return first
  }
  return { id: 0, name: 'Task', color: 'development' }
})
</script>

<template>
  <div v-if="isOpen" class="drawer-overlay" @click.self="emit('close')">
    <aside class="drawer">
      <div class="drawer-header">
        <div>
          <span v-if="task" class="label-badge" :class="`label-${primaryLabel.color}`">
            {{ primaryLabel.name }}
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
            <strong class="detail-value">{{ task.assignee?.name || 'Nicht zugewiesen' }}</strong>
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
            <strong class="detail-value" :class="task.completed ? 'status-done' : 'status-open'">
              {{ task.completed ? 'Abgeschlossen' : 'Offen' }}
            </strong>
          </div>

          <div class="detail-item">
            <span class="detail-label">Typ</span>
            <strong class="detail-value">
              {{ task.recurrence ? 'Wiederkehrender Task' : 'Einmaliger Task' }}
            </strong>
          </div>
        </div>

        <div v-if="task.recurrence" class="recurring-note">
          Beim Abschliessen wird nur diese einzelne Instanz als erledigt markiert. Zukünftige Instanzen bleiben offen.
        </div>
      </div>

      <div class="drawer-footer" v-if="task">
        <button type="button" class="secondary-button" @click="emit('delete', task.id)">Löschen</button>
        <button type="button" class="secondary-button" @click="emit('edit', task)">Bearbeiten</button>
        <button type="button" class="secondary-button" @click="emit('close')">Schliessen</button>
        <button 
          type="button" 
          class="primary-button" 
          @click="emit('toggle', task.instanceId)"
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
  z-index: 1200;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 100%;
  max-width: 480px;
  background: #FFFFFF;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #F1F5F9;
}

.drawer-title {
  margin-top: 10px;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.3;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.close-button:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.drawer-body {
  padding: 28px;
  flex: 1;
  overflow-y: auto;
}

.drawer-desc {
  color: #64748B;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-item {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.75rem;
  color: #94A3B8;
  font-weight: 600;
}

.detail-value {
  font-size: 0.9rem;
  color: #1E293B;
  font-weight: 600;
}

.status-open {
  color: #D97706;
}

.status-done {
  color: #16A34A;
}

.recurring-note {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #B45309;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.82rem;
  line-height: 1.4;
}

.drawer-footer {
  padding: 20px 28px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.secondary-button {
  padding: 10px 16px;
  border-radius: 10px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748B;
}

.primary-button {
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--primary);
  color: #FFFFFF;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(82, 67, 224, 0.25);
}

.label-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.label-development { background-color: #EEF2FF; color: #4F46E5; }
.label-schule { background-color: #F3E8FF; color: #9333EA; }
.label-it { background-color: #E0F2FE; color: #0284C7; }
.label-design { background-color: #FEE2E2; color: #EF4444; }
.label-organisation { background-color: #FEF3C7; color: #D97706; }
</style>
