<script setup lang="ts">
import { ref } from 'vue'
import type { LabelColor } from '../../types/task'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', name: string, color: LabelColor): void
}>()

const labelName = ref('')
const selectedColor = ref<LabelColor>('development')

const colorOptions: { id: LabelColor; label: string; bg: string; color: string }[] = [
  { id: 'development', label: 'Development', bg: '#EEF2FF', color: '#4F46E5' },
  { id: 'schule', label: 'Schule', bg: '#F3E8FF', color: '#9333EA' },
  { id: 'it', label: 'IT', bg: '#E0F2FE', color: '#0284C7' },
  { id: 'design', label: 'Design', bg: '#FEE2E2', color: '#EF4444' },
  { id: 'organisation', label: 'Organisation', bg: '#FEF3C7', color: '#D97706' }
]

function handleClose() {
  labelName.value = ''
  selectedColor.value = 'development'
  emit('close')
}

function handleSubmit() {
  if (!labelName.value.trim()) return
  emit('create', labelName.value.trim(), selectedColor.value)
  handleClose()
}
</script>

<template>
  <div v-if="props.isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Neues Label</h2>
          <p class="modal-subtitle">Erstelle ein neues Label für deine Tasks.</p>
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
          <label class="form-label">Label Name</label>
          <input 
            v-model="labelName" 
            type="text" 
            class="form-input" 
            placeholder="z. B. Marketing"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Farbe auswählen</label>
          <div class="colors-row">
            <button
              v-for="opt in colorOptions"
              :key="opt.id"
              type="button"
              class="color-pill"
              :style="{ backgroundColor: opt.bg, color: opt.color }"
              :class="{ selected: selectedColor === opt.id }"
              @click="selectedColor = opt.id"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="handleClose">
            Abbrechen
          </button>
          <button type="submit" class="btn-primary">
            Label erstellen
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
  max-width: 500px;
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
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.form-input {
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

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(82, 67, 224, 0.12);
}

.colors-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.color-pill.selected {
  border-color: #1E293B;
  transform: scale(1.05);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
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
