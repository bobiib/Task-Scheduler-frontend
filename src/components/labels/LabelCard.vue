<script setup lang="ts">
import type { LabelItem } from '../../stores/labelStore'

const props = defineProps<{
  label: LabelItem
  taskCount: number
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()
</script>

<template>
  <div class="label-card">
    <div class="card-header">
      <span class="label-badge" :class="`label-${props.label.color}`">
        {{ props.label.name }}
      </span>

      <button 
        type="button" 
        class="delete-btn" 
        @click="emit('delete', props.label.id)"
        aria-label="Delete label"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <h3 class="label-title">{{ props.label.name }}</h3>
    <span class="task-count">{{ props.taskCount }} Tasks</span>
  </div>
</template>

<style scoped>
.label-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.label-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.label-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.label-development {
  background-color: #EEF2FF;
  color: #4F46E5;
}

.label-schule {
  background-color: #F3E8FF;
  color: #9333EA;
}

.label-it {
  background-color: #E0F2FE;
  color: #0284C7;
}

.label-design {
  background-color: #FEE2E2;
  color: #EF4444;
}

.label-organisation {
  background-color: #FEF3C7;
  color: #D97706;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: #FFF1F2;
  border: 1px solid #FFE4E6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F43F5E;
  transition: all 0.15s;
}

.delete-btn:hover {
  background-color: #FFE4E6;
  color: #E11D48;
}

.label-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 4px;
}

.task-count {
  font-size: 0.85rem;
  color: #94A3B8;
  font-weight: 500;
}
</style>
