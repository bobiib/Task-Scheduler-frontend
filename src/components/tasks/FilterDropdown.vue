<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

type DropdownOption = string | { value: string; label: string }

interface DropdownGroup {
  name: string
  options: DropdownOption[]
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    prefix: string
    options?: DropdownOption[]
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

const menuGroups = computed(() => {
  const groups = props.options.length ? [{ name: '', options: props.options }] : props.groups
  return groups.filter(group => group.options.length).map(group => ({
    name: group.name,
    options: group.options.map(option =>
      typeof option === 'string' ? { value: option, label: option } : option
    ),
  }))
})

const displayLabel = computed(() => {
  const selected = menuGroups.value.flatMap(group => group.options)
    .find(option => option.value === props.modelValue)
  return `${props.prefix}: ${selected?.label ?? 'Alle'}`
})

const isActive = computed(() => props.modelValue !== 'Alle')
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
      <div v-for="group in menuGroups" :key="group.name" class="group-wrapper">
        <div v-if="group.name" class="group-title">{{ group.name }}</div>
        <div
          v-for="option in group.options"
          :key="option.value"
          class="dropdown-item"
          :class="{ selected: modelValue === option.value }"
          @click="selectOption(option.value)"
        >
          <span>{{ option.label }}</span>
          <span v-if="modelValue === option.value" class="check-mark">✓</span>
        </div>
      </div>
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
