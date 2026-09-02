<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'Übersicht', path: '/', icon: 'dashboard' },
  { name: 'Timeline', path: '/timeline', icon: 'timeline' },
  { name: 'Alle Tasks', path: '/all-tasks', icon: 'tasks' },
  { name: 'Labels', path: '/labels', icon: 'labels' },
  { name: 'Team', path: '/team', icon: 'team' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-box">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="white" stroke-width="3" fill="none">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="brand-info">
        <div class="brand-title">Task Scheduler</div>
        <div class="brand-subtitle">Workspace</div>
      </div>
    </div>

    <div class="nav-section">
      <span class="section-label">WORKSPACE</span>
      <nav class="nav-list">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-icon">
            <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
            <svg v-else-if="item.icon === 'timeline'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <svg v-else-if="item.icon === 'tasks'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <svg v-else-if="item.icon === 'labels'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 3h12l4 9-4 9H6l-4-9 4-9z"></path>
            </svg>
            <svg v-else-if="item.icon === 'team'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <span class="nav-text">{{ item.name }}</span>
        </RouterLink>
      </nav>
    </div>

    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">LB</div>
        <div class="user-details">
          <div class="user-name">Liam Bruno</div>
          <div class="user-role">Benutzerkonto</div>
        </div>
        <span class="user-chevron">⌵</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background-color: var(--sidebar-bg);
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  color: var(--sidebar-text);
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 28px;
}

.logo-box {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #5346E0 0%, #6366F1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(83, 70, 224, 0.4);
}

.brand-title {
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.2;
}

.brand-subtitle {
  color: #64748B;
  font-size: 0.75rem;
}

.nav-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #475569;
  padding-left: 12px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  color: #FFFFFF;
  background-color: rgba(255, 255, 255, 0.04);
}

.nav-item.active {
  color: var(--sidebar-text-active);
  background-color: var(--sidebar-active-bg);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.15);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--sidebar-card-bg);
  padding: 10px 12px;
  border-radius: 14px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: #5243E0;
  color: #FFF;
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #FFF;
  font-size: 0.85rem;
  font-weight: 600;
}

.user-role {
  color: #64748B;
  font-size: 0.7rem;
}

.user-chevron {
  color: #64748B;
  font-size: 0.8rem;
}
</style>
