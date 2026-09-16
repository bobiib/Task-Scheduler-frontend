<script setup lang="ts">
import { ref } from 'vue'
import { useLabelStore } from '../stores/labelStore'
import LabelCard from '../components/labels/LabelCard.vue'
import LabelModal from '../components/labels/LabelModal.vue'

const labelStore = useLabelStore()
const isModalOpen = ref(false)
</script>

<template>
  <div class="labels-container">
    <div class="labels-header">
      <div>
        <h1 class="page-title">Labels</h1>
        <p class="page-subtitle">Erstelle, verwalte und lösche Labels für deine Tasks.</p>
      </div>

      <button type="button" class="btn-primary" @click="isModalOpen = true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Neues Label</span>
      </button>
    </div>

    <div class="labels-grid">
      <LabelCard
        v-for="label in labelStore.labels"
        :key="label.id"
        :label="label"
        :task-count="labelStore.getTaskCount(label.name)"
        @delete="labelStore.deleteLabel"
      />
    </div>

    <LabelModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @create="labelStore.addLabel"
    />
  </div>
</template>

<style scoped>
.labels-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.labels-header {
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

.labels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
</style>
