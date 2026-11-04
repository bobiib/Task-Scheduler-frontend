<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface DropdownGroup {
  name: string
  options: string[]
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    prefix: string
    options?: string[]
    groups?: DropdownGroup[]
  }>(),
  {
    options: () => [],
    groups: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectOption(val: string) {
  emit('update:modelValue', val)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

const displayLabel = computed(() => {
  return `${props.prefix}: ${props.modelValue}`
})

const isActive = computed(() => {
  return props.modelValue !== 'Alle'
})
</script>

<template>
  <div class="custom-dropdown" ref="dropdownRef">
    <button 
      type="button" 
      class="dropdown-trigger" 
      :class="{ 'is-open': isOpen, 'is-active': isActive }"
      @click="toggleOpen"
      :aria-expanded="isOpen"
    >
      <span class="trigger-label">{{ displayLabel }}</span>
      <svg 
        class="chevron-icon" 
        :class="{ 'rotate': isOpen }" 
        viewBox="0 0 24 24" 
        width="14" 
        height="14" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <!-- Einfache Optionen -->
      <template v-if="options && options.length > 0">
        <div 
          v-for="opt in options" 
          :key="opt" 
          class="dropdown-item" 
          :class="{ selected: modelValue === opt }"
          @click="selectOption(opt)"
        >
          <span>{{ opt }}</span>
          <span v-if="modelValue === opt" class="check-mark">✓</span>
        </div>
      </template>

      <!-- Gruppierte Optionen -->
      <template v-else-if="groups && groups.length > 0">
        <template v-for="(group, gIndex) in groups" :key="group.name || gIndex">
          <div v-if="group.options.length > 0" class="group-wrapper">
            <div v-if="group.name" class="group-title">{{ group.name }}</div>
            <div 
              v-for="opt in group.options" 
              :key="opt" 
              class="dropdown-item" 
              :class="{ selected: modelValue === opt }"
              @click="selectOption(opt)"
            >
              <span>{{ opt }}</span>
              <span v-if="modelValue === opt" class="check-mark">✓</span>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  height: 40px;
  padding: 0 13px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  background-color: #F8FAFC;
  color: #334155;
  font-size: 0.84rem;
  font-weight: 500;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.dropdown-trigger:hover {
  background-color: #FFFFFF;
  border-color: #CBD5E1;
}

.dropdown-trigger.is-open,
.dropdown-trigger:focus-visible {
  background-color: #FFFFFF;
  border-color: #5243E0;
  box-shadow: 0 0 0 3px rgba(82, 67, 224, 0.12);
}

.dropdown-trigger.is-active {
  background-color: #EEF2FF;
  border-color: #C7D2FE;
  color: #4338CA;
  font-weight: 600;
}

.chevron-icon {
  color: #64748B;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-trigger.is-active .chevron-icon {
  color: #4338CA;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 200px;
  max-height: 280px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04);
  z-index: 100;
  animation: dropdownPop 0.12s ease-out;
}

@keyframes dropdownPop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.group-wrapper:not(:first-child) {
  margin-top: 6px;
  border-top: 1px solid #F1F5F9;
  padding-top: 6px;
}

.group-title {
  padding: 4px 10px 2px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.12s ease;
}

.dropdown-item:hover {
  background-color: #F8FAFC;
  color: #0F172A;
}

.dropdown-item.selected {
  background-color: #EEF2FF;
  color: #4F46E5;
  font-weight: 600;
}

.check-mark {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4F46E5;
  margin-left: 8px;
}
</style>
