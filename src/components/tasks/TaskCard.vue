<script setup lang="ts">
import type { Task } from '../../types/task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'click', task: Task): void
}>()
</script>

<template>
  <div 
    class="task-card" 
    :class="{ 'is-completed': props.task.completed }"
    @click="emit('click', props.task)"
  >
    <div class="card-header">
      <span class="label-badge" :class="`label-${props.task.label.color}`">
        {{ props.task.label.name }}
      </span>

      <button 
        type="button" 
        class="checkbox-btn" 
        :class="{ checked: props.task.completed }"
        @click.stop="emit('toggle', props.task.id)"
        aria-label="Toggle task completion"
      >
        <svg v-if="props.task.completed" viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="3" fill="none">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>

    <h3 class="task-title">{{ props.task.title }}</h3>

    <div class="due-row" :class="{ 'due-today': props.task.isDueToday }">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>{{ props.task.dueDate }}{{ props.task.dueTime ? ` · ${props.task.dueTime}` : '' }}</span>
    </div>

    <div class="chips-row">
      <div v-if="props.task.recurrence" class="chip">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 2l4 4-4 4"></path>
          <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
          <path d="M7 22l-4-4 4-4"></path>
          <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
        </svg>
        <span>{{ props.task.recurrence }}</span>
      </div>

      <div v-if="props.task.reminder" class="chip">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 3h12l4 9-4 9H6l-4-9 4-9z"></path>
        </svg>
        <span>{{ props.task.reminder }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="assignee-box">
        <div class="assignee-avatar">
          {{ props.task.assignee.initials }}
        </div>
        <span class="assignee-name">{{ props.task.assignee.name }}</span>
      </div>

      <button type="button" class="more-btn" @click.stop>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <circle cx="5" cy="12" r="2"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <circle cx="19" cy="12" r="2"></circle>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.task-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.task-card.is-completed {
  opacity: 0.6;
}

.task-card.is-completed .task-title {
  text-decoration: line-through;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.label-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
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

.checkbox-btn {
  width: 22px;
  height: 22px;
  border: 2px solid #CBD5E1;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: #FFFFFF;
}

.checkbox-btn:hover {
  border-color: var(--primary);
}

.checkbox-btn.checked {
  background: var(--primary);
  border-color: var(--primary);
}

.task-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 12px;
  line-height: 1.35;
}

.due-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748B;
  font-weight: 500;
  margin-bottom: 14px;
}

.due-row.due-today {
  color: #D97706;
}

.chips-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #64748B;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid #F1F5F9;
}

.assignee-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assignee-avatar {
  width: 26px;
  height: 26px;
  background: #5243E0;
  color: #FFFFFF;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assignee-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}

.more-btn {
  color: #94A3B8;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.more-btn:hover {
  color: #1E293B;
  background-color: #F1F5F9;
}
</style>
