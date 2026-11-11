<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Task, TaskLabel, TaskReminder, ReminderUnit } from '../../types/task'
import { taskApi } from '../../api/taskApi' 

const props = defineProps<{
  task: Task | null
  isOpen: boolean
}>()
const reminders = ref<TaskReminder[]>([])
const isLoadingReminders = ref(false)

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

async function loadReminders(taskId: number) {
  isLoadingReminders.value = true
  try {
    reminders.value = await taskApi.getTaskReminders(taskId)
  } catch {
    reminders.value = []
  } finally {
    isLoadingReminders.value = false
  }
}

watch(
  () => [props.isOpen, props.task?.id],
  ([isOpen, taskId]) => {
    if (isOpen && typeof taskId === 'number') {
      loadReminders(taskId)
    } else {
      reminders.value = []
    }
  },
  { immediate: true }
)

function formatLeadTime(amount: number, unit: ReminderUnit): string {
  if (unit === 'minutes') return `${amount} Min. vorher`
  if (unit === 'hours') return amount === 1 ? '1 Std. vorher' : `${amount} Std. vorher`
  if (unit === 'days') return amount === 1 ? '1 Tag vorher' : `${amount} Tage vorher`
  if (unit === 'weeks') return amount === 1 ? '1 Woche vorher' : `${amount} Wochen vorher`
  return `${amount} ${unit} vorher`
}

function calculateReminderTime(dueDateStr: string, dueTimeStr: string | null | undefined, amount: number, unit: ReminderUnit): string {
  const timePart = dueTimeStr ? dueTimeStr.slice(0, 5) : '09:00'
  const target = new Date(`${dueDateStr}T${timePart}:00`)
  if (isNaN(target.getTime())) return ''

  const reminderDate = new Date(target)
  if (unit === 'minutes') {
    reminderDate.setMinutes(reminderDate.getMinutes() - amount)
  } else if (unit === 'hours') {
    reminderDate.setHours(reminderDate.getHours() - amount)
  } else if (unit === 'days') {
    reminderDate.setDate(reminderDate.getDate() - amount)
  } else if (unit === 'weeks') {
    reminderDate.setDate(reminderDate.getDate() - amount * 7)
  }

  const day = String(reminderDate.getDate()).padStart(2, '0')
  const month = String(reminderDate.getMonth() + 1).padStart(2, '0')
  const year = reminderDate.getFullYear()
  const hours = String(reminderDate.getHours()).padStart(2, '0')
  const minutes = String(reminderDate.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year}, ${hours}:${minutes} Uhr`
}
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

        <div class="reminders-section">
          <span class="detail-label">Gespeicherte Erinnerungen</span>

          <div v-if="isLoadingReminders" class="reminders-loading">
            Erinnerungen werden geladen...
          </div>

          <div v-else-if="reminders.length > 0" class="reminders-list">
            <div v-for="item in reminders" :key="item.id" class="reminder-row">
              <div class="reminder-info">
                <strong class="reminder-lead">{{ formatLeadTime(item.amount, item.unit) }}</strong>
                <span v-if="task.dueDate" class="reminder-time">
                  Zeitpunkt: {{ calculateReminderTime(task.dueDate, task.dueTime, item.amount, item.unit) }}
                </span>
              </div>
              <span class="reminder-status-badge" :class="item.isActive ? 'badge-active' : 'badge-inactive'">
                {{ item.isActive ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </div>
          </div>

          <div v-else-if="task.reminder" class="reminder-row">
            <div class="reminder-info">
              <strong class="reminder-lead">{{ task.reminder }}</strong>
            </div>
            <span class="reminder-status-badge badge-active">Aktiv</span>
          </div>

          <div v-else class="reminder-empty">
            Keine Erinnerungen hinterlegt
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

.reminders-section {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.reminder-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reminder-lead {
  font-size: 0.88rem;
  color: #1E293B;
  font-weight: 600;
}

.reminder-time {
  font-size: 0.78rem;
  color: #64748B;
}

.reminder-status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.badge-active {
  background-color: #DCFCE7;
  color: #16A34A;
}

.badge-inactive {
  background-color: #F1F5F9;
  color: #64748B;
}

.reminders-loading,
.reminder-empty {
  font-size: 0.82rem;
  color: #94A3B8;
  font-style: italic;
  padding: 4px 0;
}
</style>
