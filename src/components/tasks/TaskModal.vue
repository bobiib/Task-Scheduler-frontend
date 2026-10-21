<script setup lang="ts">
import { ref } from 'vue'
import type { CreateTaskPayload } from '../../types/task'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', payload: CreateTaskPayload): void
}>()

const title = ref('')
const description = ref('')
const dueDate = ref('')
const dueTime = ref('12:00')
const scheduleType = ref('date')
const recurrence = ref('Keine')
const selectedLabelId = ref<number>(2)
const selectedAssigneeType = ref<'user' | 'team'>('user')
const selectedAssigneeId = ref<number>(1)
const selectedReminder = ref('30 Min. vorher')

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
  selectedLabelId.value = 2
  selectedAssigneeType.value = 'user'
  selectedAssigneeId.value = 1
  selectedReminder.value = '30 Min. vorher'
}

function handleSubmit() {
  if (!title.value.trim()) return

  let dateValue = dueDate.value
  if (!dateValue) {
    const today = new Date()
    dateValue = today.toISOString().slice(0, 10)
  }

    const payload: CreateTaskPayload = {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    scheduleType: scheduleType.value,
    dueDate: dateValue,
    scheduleDate: dateValue,
    dueTime: dueTime.value || undefined,
    createdByUserId: 1,
    assignedUserId: selectedAssigneeType.value === 'user' ? selectedAssigneeId.value : null,
    assignedTeamId: selectedAssigneeType.value === 'team' ? selectedAssigneeId.value : null,
    labelIds: [selectedLabelId.value]
  }


  emit('create', payload)
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
            <select v-model="selectedLabelId" class="form-select">
              <option :value="1">Development</option>
              <option :value="2">Schule</option>
              <option :value="3">IT</option>
              <option :value="4">Design</option>
              <option :value="5">Organisation</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Zugewiesen an</label>
            <select 
              :value="`${selectedAssigneeType}:${selectedAssigneeId}`" 
              class="form-select"
              @change="(e: Event) => {
                const val = (e.target as HTMLSelectElement).value.split(':')
                selectedAssigneeType = val[0] as 'user' | 'team'
                selectedAssigneeId = Number(val[1])
              }"
            >
              <option value="user:1">Fabio (User)</option>
              <option value="user:2">Liam (User)</option>
              <option value="user:3">Dmytro (User)</option>
              <option value="user:4">Boris (User)</option>
              <option value="team:1">Projektteam (Team)</option>
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
