<script setup lang="ts">
import { computed } from 'vue'

const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  return new Intl.DateTimeFormat('de-DE', options).format(new Date())
})
</script>

<template>
  <header class="header">
    <div class="header-left">
      <div class="header-title">Task Scheduler</div>
      <div class="header-date">{{ formattedDate }}</div>
    </div>

    <div class="header-right">
      <button class="icon-btn" title="Quick Actions">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 3h12l4 9-4 9H6l-4-9 4-9z"></path>
        </svg>
      </button>

      <div class="profile-pill">
        <div class="profile-avatar">LB</div>
        <span class="profile-name">Liam</span>
        <span class="profile-chevron">⌵</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 70px;
  background-color: #FFFFFF;
  border-bottom: 1px solid var(--border-color);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #F8FAFC;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #F1F5F9;
  color: var(--text-primary);
}

.profile-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #F8FAFC;
  border: 1px solid var(--border-color);
  padding: 4px 12px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-pill:hover {
  background-color: #F1F5F9;
}

.profile-avatar {
  width: 28px;
  height: 28px;
  background-color: var(--primary);
  color: #FFF;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-chevron {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
