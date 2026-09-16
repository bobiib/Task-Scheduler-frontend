<script setup lang="ts">
import { ref } from 'vue'
import type { Task, LabelColor } from '../../types/task'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', task: Omit<Task, 'id' | 'completed'>): void
}>()

const title = ref('')
const description = ref('')
const dueDate = ref('')
const dueTime = ref('12:00')
const scheduleType = ref('date')
const recurrence = ref('Keine')
const selectedLabel = ref<string>('Schule')
const selectedAssignee = ref('Liam')
const selectedReminder = ref('30 Min. vorher')

const labelMap: Record<string, { name: string; color: LabelColor }> = {
  Schule: { name: 'Schule', color: 'schule' },
  Development: { name: 'Development', color: 'development' },
  IT: { name: 'IT', color: 'it' },
  Design: { name: 'Design', color: 'design' },
  Organisation: { name: 'Organisation', color: 'organisation' }
}

const assigneeMap: Record<string, { name: string; initials: string }> = {
  Liam: { name: 'Liam', initials: 'LB' },
  Dmytro: { name: 'Dmytro', initials: 'DY' },
  Boris: { name: 'Boris', initials: 'BO' },
  Fabio: { name: 'Fabio', initials: 'FA' },
  Projektteam: { name: 'Projektteam', initials: 'PT' }
}

function handleClose() {
  resetForm()
  emit('close')
}

function resetForm() {
  title.value = ''
  description.value = ''
  dueDate.value = ''
  dueTime.value = '12:00'
  scheduleType.value = 'date'
  recurrence.value = 'Keine'
  selectedLabel.value = 'Schule'
  selectedAssignee.value = 'Liam'
  selectedReminder.value = '30 Min. vorher'
}

function handleSubmit() {
  if (!title.value.trim()) return

  const labelConfig = labelMap[selectedLabel.value] || { name: selectedLabel.value, color: 'schule' }
  const assigneeConfig = assigneeMap[selectedAssignee.value] || { name: selectedAssignee.value, initials: 'US' }

  let displayDate = dueDate.value
  if (!displayDate) {
    const today = new Date()
    displayDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`
  }

  emit('create', {
    title: title.value.trim(),
    description: description.value.trim(),
    dueDate: displayDate,
    dueTime: dueTime.value || undefined,
    isDueToday: true,
    label: {
      id: `lbl-${Date.now()}`,
      name: labelConfig.name,
      color: labelConfig.color
    },
    recurrence: recurrence.value !== 'Keine' ? recurrence.value : undefined,
    reminder: selectedReminder.value !== 'Keine' ? selectedReminder.value : undefined,
    assignee: {
      id: `usr-${Date.now()}`,
      name: assigneeConfig.name,
      initials: assigneeConfig.initials
    }
  })

  handleClose()
}
</script>

<template>
  <div v-if="props.isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Neuer Task</h2>
          <p class="modal-subtitle">Termin, Wiederholung, Labels, User und Reminder definieren.</p>
        </div>
        <button type="button" class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">Titel</label>
          <input 
            v-model="title" 
            type="text" 
            class="form-input" 
            placeholder="z. B. Projektstatusbericht Sprint 1"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Beschreibung</label>
          <textarea 
            v-model="description" 
            class="form-textarea" 
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Termin</label>
            <input 
              v-model="dueDate" 
              type="date" 
              class="form-input" 
            />
          </div>

          <div class="form-group flex-1">
            <label class="form-label">Uhrzeit</label>
            <input 
              v-model="dueTime" 
              type="time" 
              class="form-input" 
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Terminierungsart</label>
          <div class="radio-group">
            <label class="radio-label">
              <input 
                v-model="scheduleType" 
                type="radio" 
                name="scheduleType" 
                value="date" 
              />
              <span>Bestimmtes Datum, z. B. 6. Dezember</span>
            </label>

            <label class="radio-label">
              <input 
                v-model="scheduleType" 
                type="radio" 
                name="scheduleType" 
                value="week" 
              />
              <span>Bestimmte Woche, z. B. 1. Woche im August</span>
            </label>

            <label class="radio-label">
              <input 
                v-model="scheduleType" 
                type="radio" 
                name="scheduleType" 
                value="weekday" 
              />
              <span>Wochentag im Monat, z. B. 3. Donnerstag</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Wiederholung</label>
            <select v-model="recurrence" class="form-select">
              <option value="Keine">Keine</option>
              <option value="Täglich">Täglich</option>
              <option value="Wöchentlich">Wöchentlich</option>
              <option value="Monatlich">Monatlich</option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label class="form-label">Label</label>
            <select v-model="selectedLabel" class="form-select">
              <option value="Schule">Schule</option>
              <option value="Development">Development</option>
              <option value="IT">IT</option>
              <option value="Design">Design</option>
              <option value="Organisation">Organisation</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Zugewiesen an</label>
            <select v-model="selectedAssignee" class="form-select">
              <option value="Liam">Liam</option>
              <option value="Dmytro">Dmytro</option>
              <option value="Boris">Boris</option>
              <option value="Fabio">Fabio</option>
              <option value="Projektteam">Projektteam</option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label class="form-label">Reminder</label>
            <select v-model="selectedReminder" class="form-select">
              <option value="Keine">Keine</option>
              <option value="15 Min. vorher">15 Min. vorher</option>
              <option value="30 Min. vorher">30 Min. vorher</option>
              <option value="1 Std. vorher">1 Std. vorher</option>
              <option value="1 Tag vorher">1 Tag vorher</option>
              <option value="3 Tage vorher">3 Tage vorher</option>
              <option value="1 Woche vorher">1 Woche vorher</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="handleClose">
            Abbrechen
          </button>
          <button type="submit" class="btn-primary">
            Task erstellen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 28px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1E293B;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #64748B;
  margin-top: 4px;
}

.close-btn {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.modal-body {
  padding: 8px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-1 {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.9rem;
  color: #1E293B;
  background: #FFFFFF;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(82, 67, 224, 0.12);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  accent-color: var(--primary);
  width: 16px;
  height: 16px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}

.btn-secondary {
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748B;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.btn-primary {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #FFFFFF;
  background: var(--primary);
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(82, 67, 224, 0.3);
}

.btn-primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 6px 20px rgba(82, 67, 224, 0.4);
}
</style>
