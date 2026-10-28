<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CreateTaskPayload, Task, RecurrenceRule } from '../../types/task'
import { useLabelStore } from '../../stores/labelStore'
import { useTeamStore } from '../../stores/teamStore'

const props = defineProps<{
  isOpen: boolean
  task?: Task | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', payload: CreateTaskPayload): void
  (e: 'update', id: number, payload: Partial<CreateTaskPayload>): void
}>()

const labelStore = useLabelStore()
const teamStore = useTeamStore()

const title = ref('')
const description = ref('')
const dueDate = ref('')
const dueTime = ref('12:00')
const scheduleType = ref('date')

// Wiederholungs-State
const recurrenceType = ref<'none' | 'daily' | 'weekly' | 'monthly_day'>('none')
const selectedWeekdays = ref<number[]>([]) // 1 = Mo, 2 = Di, ..., 7 = So
const recurrenceEndDate = ref('')

const weekdaysList = [
  { id: 1, label: 'Mo' },
  { id: 2, label: 'Di' },
  { id: 3, label: 'Mi' },
  { id: 4, label: 'Do' },
  { id: 5, label: 'Fr' },
  { id: 6, label: 'Sa' },
  { id: 7, label: 'So' }
]

function toggleWeekday(day: number) {
  const index = selectedWeekdays.value.indexOf(day)
  if (index === -1) {
    selectedWeekdays.value.push(day)
  } else {
    selectedWeekdays.value.splice(index, 1)
  }
}

const selectedLabelId = ref<number>(2)
const selectedAssigneeType = ref<'user' | 'team'>('user')
const selectedAssigneeId = ref<number>(1)

const selectedReminderPreset = ref('30_minutes')
const customReminderAmount = ref(30)
const customReminderUnit = ref<'minutes' | 'hours' | 'days' | 'weeks'>('minutes')

function parseReminder(reminderStr?: string | null) {
  if (!reminderStr || reminderStr === 'Keine' || reminderStr === 'Kein Reminder') {
    selectedReminderPreset.value = 'none'
    return
  }

  const match = reminderStr.match(/^(\d+)\s+(Min\.|Std\.|Tag|Tage|Woche|Wochen)\s+vorher$/i)
  if (match && match[1] && match[2]) {
    const amount = Number(match[1])
    const unitRaw = match[2].toLowerCase()
    let unit: 'minutes' | 'hours' | 'days' | 'weeks' = 'minutes'
    if (unitRaw.startsWith('min')) unit = 'minutes'
    else if (unitRaw.startsWith('std')) unit = 'hours'
    else if (unitRaw.startsWith('tag')) unit = 'days'
    else if (unitRaw.startsWith('woch')) unit = 'weeks'

    const presetKey = `${amount}_${unit}`
    const knownPresets = ['15_minutes', '30_minutes', '1_hours', '2_hours', '1_days', '2_days', '3_days', '1_weeks']
    if (knownPresets.includes(presetKey)) {
      selectedReminderPreset.value = presetKey
    } else {
      selectedReminderPreset.value = 'custom'
      customReminderAmount.value = amount
      customReminderUnit.value = unit
    }
  } else {
    selectedReminderPreset.value = 'custom'
  }
}

function getReminderPayload(): { amount: number; unit: string } | null {
  if (selectedReminderPreset.value === 'none') {
    return null
  }
  if (selectedReminderPreset.value === 'custom') {
    return {
      amount: Math.max(1, Number(customReminderAmount.value) || 1),
      unit: customReminderUnit.value
    }
  }
  const parts = selectedReminderPreset.value.split('_')
  return {
    amount: Number(parts[0]) || 30,
    unit: parts[1] || 'minutes'
  }
}

function parseRecurrence(rec?: any) {
  if (!rec || rec === 'Keine') {
    recurrenceType.value = 'none'
    selectedWeekdays.value = []
    recurrenceEndDate.value = ''
    return
  }

  if (typeof rec === 'object') {
    recurrenceType.value = rec.type || 'none'
    selectedWeekdays.value = rec.weekdays ? [...rec.weekdays] : []
    recurrenceEndDate.value = rec.endDate || ''
    return
  }

  if (rec === 'Täglich' || rec === 'daily') recurrenceType.value = 'daily'
  else if (rec === 'Wöchentlich' || rec === 'weekly') recurrenceType.value = 'weekly'
  else if (rec === 'Monatlich' || rec.startsWith('monthly')) recurrenceType.value = 'monthly_day'
  else recurrenceType.value = 'none'
}

function getRecurrencePayload(): RecurrenceRule | null {
  if (recurrenceType.value === 'none') {
    return null
  }
  if (recurrenceType.value === 'daily') {
    return {
      type: 'daily',
      endDate: recurrenceEndDate.value || null
    }
  }
  if (recurrenceType.value === 'weekly') {
    return {
      type: 'weekly',
      weekdays: selectedWeekdays.value.length > 0 ? [...selectedWeekdays.value].sort() : undefined,
      endDate: recurrenceEndDate.value || null
    }
  }
  if (recurrenceType.value === 'monthly_day') {
    const day = dueDate.value ? new Date(dueDate.value).getDate() : 1
    return {
      type: 'monthly_day',
      dayOfMonth: day,
      endDate: recurrenceEndDate.value || null
    }
  }
  return null
}

watch(() => props.isOpen, (open) => {
  if (!open) return
  if (labelStore.labels.length === 0) labelStore.fetchLabels()
  if (teamStore.users.length === 0) teamStore.fetchTeams()

  const task = props.task
  if (task) {
    title.value = task.title
    description.value = task.description || ''
    dueDate.value = task.dueDate
    dueTime.value = task.dueTime || ''
    selectedLabelId.value = task.labels?.[0]?.id ?? selectedLabelId.value
    selectedAssigneeType.value = task.assignee?.type ?? 'user'
    selectedAssigneeId.value = task.assignee?.id ?? selectedAssigneeId.value
    parseReminder(task.reminder)
    parseRecurrence((task as any).recurrenceRule || task.recurrence)
  }
})

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
  recurrenceType.value = 'none'
  selectedWeekdays.value = []
  recurrenceEndDate.value = ''
  selectedLabelId.value = 2
  selectedAssigneeType.value = 'user'
  selectedAssigneeId.value = 1
  selectedReminderPreset.value = 'none'
  customReminderAmount.value = 30
  customReminderUnit.value = 'minutes'
}

function handleSubmit() {
  if (!title.value.trim()) return

  let dateValue = dueDate.value
  if (!dateValue) {
    const today = new Date()
    dateValue = today.toISOString().slice(0, 10)
  }

  const reminderData = getReminderPayload()
  const recurrenceData = getRecurrencePayload()

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
    labelIds: [selectedLabelId.value],
    reminder: reminderData,
    recurrence: recurrenceData
  }

  if (props.task) {
    emit('update', props.task.id, {
      title: payload.title,
      description: description.value.trim(),
      dueDate: payload.dueDate,
      dueTime: payload.dueTime,
      assignedUserId: payload.assignedUserId,
      assignedTeamId: payload.assignedTeamId,
      labelIds: payload.labelIds,
      reminder: reminderData,
      recurrence: recurrenceData
    })
  } else {
    emit('create', payload)
  }
  handleClose()
}
</script>

<template>
  <div v-if="props.isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ props.task ? 'Task bearbeiten' : 'Neuer Task' }}</h2>
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
            <select v-model="recurrenceType" class="form-select">
              <option value="none">Keine</option>
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="monthly_day">Monatlich</option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label class="form-label">Label</label>
            <select v-model="selectedLabelId" class="form-select">
              <option v-for="label in labelStore.labels" :key="label.id" :value="label.id">
                {{ label.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Details für Wöchentlich: Wochentage auswählen -->
        <div v-if="recurrenceType === 'weekly'" class="recurrence-box">
          <label class="form-label-sub">Wiederholen an folgenden Wochentagen:</label>
          <div class="weekday-buttons">
            <button
              v-for="day in weekdaysList"
              :key="day.id"
              type="button"
              class="weekday-btn"
              :class="{ active: selectedWeekdays.includes(day.id) }"
              @click="toggleWeekday(day.id)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>

        <!-- Optionales Enddatum für Wiederholungen -->
        <div v-if="recurrenceType !== 'none'" class="recurrence-box">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label-sub">Endet am (optional)</label>
              <input 
                v-model="recurrenceEndDate" 
                type="date" 
                class="form-input" 
              />
            </div>
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
              <option v-for="user in teamStore.users" :key="`user:${user.id}`" :value="`user:${user.id}`">
                {{ user.name }} (User)
              </option>
              <option v-for="team in teamStore.teams" :key="`team:${team.id}`" :value="`team:${team.id}`">
                {{ team.name }} (Team)
              </option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label class="form-label reminder-label">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span>Reminder</span>
            </label>
            <select v-model="selectedReminderPreset" class="form-select">
              <option value="none">Kein Reminder</option>
              <option value="15_minutes">15 Min. vorher</option>
              <option value="30_minutes">30 Min. vorher</option>
              <option value="1_hours">1 Std. vorher</option>
              <option value="2_hours">2 Std. vorher</option>
              <option value="1_days">1 Tag vorher</option>
              <option value="2_days">2 Tage vorher</option>
              <option value="3_days">3 Tage vorher</option>
              <option value="1_weeks">1 Woche vorher</option>
              <option value="custom">Benutzerdefiniert...</option>
            </select>
          </div>
        </div>

        <div v-if="selectedReminderPreset === 'custom'" class="custom-reminder-box">
          <div class="custom-reminder-inputs">
            <input 
              v-model.number="customReminderAmount" 
              type="number" 
              min="1" 
              max="999" 
              class="form-input custom-amount" 
              placeholder="30"
            />
            <select v-model="customReminderUnit" class="form-select custom-unit">
              <option value="minutes">Minuten</option>
              <option value="hours">Stunden</option>
              <option value="days">Tage</option>
              <option value="weeks">Wochen</option>
            </select>
            <span class="custom-suffix">vorher</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="handleClose">
            Abbrechen
          </button>
          <button type="submit" class="btn-primary">
            {{ props.task ? 'Speichern' : 'Task erstellen' }}
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

.reminder-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.custom-reminder-box {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  padding: 10px 14px;
}

.custom-reminder-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-amount {
  width: 90px;
}

.custom-unit {
  flex: 1;
}

.custom-suffix {
  font-size: 0.85rem;
  color: #64748B;
  font-weight: 500;
  white-space: nowrap;
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

.recurrence-box {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  padding: 10px 14px;
}

.form-label-sub {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 8px;
}

.weekday-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.weekday-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weekday-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.weekday-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(82, 67, 224, 0.25);
}

</style>