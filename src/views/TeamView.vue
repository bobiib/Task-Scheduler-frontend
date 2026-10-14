<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamStore } from '../stores/teamStore'

const teamStore = useTeamStore()

const activeTab = ref<'teams' | 'persons'>('teams')
const searchQuery = ref('')

const isCreateModalOpen = ref(false)
const newTeamName = ref('')
const newTeamCreatorId = ref('u1')
const createError = ref('')

const selectedUserToAdd = ref<Record<string, string>>({})

const filteredTeams = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return teamStore.teams

  return teamStore.teams.filter(team => {
    const matchName = team.name.toLowerCase().includes(query)
    const matchMember = team.members.some(m =>
      m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
    )
    return matchName || matchMember
  })
})

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return teamStore.users

  return teamStore.users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.initials.toLowerCase().includes(query)
  )
})

function openCreateModal() {
  newTeamName.value = ''
  newTeamCreatorId.value = teamStore.users[0]?.id || 'u1'
  createError.value = ''
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  isCreateModalOpen.value = false
  createError.value = ''
}

function handleCreateTeam() {
  if (!newTeamName.value.trim()) {
    createError.value = 'Bitte gib einen Namen für das Team ein.'
    return
  }

  const success = teamStore.createTeam(newTeamName.value, newTeamCreatorId.value)
  if (!success) {
    createError.value = 'Ein Team mit diesem Namen existiert bereits.'
    return
  }

  closeCreateModal()
}

function handleAddMember(teamId: string) {
  const userId = selectedUserToAdd.value[teamId]
  if (!userId) return

  teamStore.addMember(teamId, userId, 'member')
  selectedUserToAdd.value[teamId] = ''
}
</script>

<template>
  <div class="team-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Team & Gruppen</h1>
        <p class="page-subtitle">Verwalte Personen, Teams und Gruppenadministrator-Rollen für die Task-Zuweisung.</p>
      </div>
      <button type="button" class="primary-button" @click="openCreateModal">
        ＋ Neues Team
      </button>
    </div>

    <div class="team-summary-bar">
      <div class="summary-badges">
        <span class="summary-badge">
          <strong>{{ teamStore.teams.length }}</strong> Teams
        </span>
        <span class="summary-badge">
          <strong>{{ teamStore.users.length }}</strong> Personen
        </span>
      </div>

      <div class="tab-controls">
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'teams' }"
          @click="activeTab = 'teams'"
        >
          Teams & Gruppen ({{ teamStore.teams.length }})
        </button>
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'persons' }"
          @click="activeTab = 'persons'"
        >
          Alle Personen ({{ teamStore.users.length }})
        </button>
      </div>
    </div>

    <div class="search-toolbar">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94A3B8" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="activeTab === 'teams' ? 'Teams oder Mitglieder suchen ...' : 'Personen suchen ...'"
          class="search-input"
        />
      </div>
    </div>

    <div v-if="activeTab === 'teams'" class="teams-section">
      <div v-if="filteredTeams.length === 0" class="empty-state">
        <p>Keine Teams gefunden.</p>
      </div>

      <div class="teams-grid">
        <div v-for="team in filteredTeams" :key="team.id" class="team-card">
          <div class="team-card-header">
            <div class="team-info-left">
              <div class="team-avatar" :style="{ backgroundColor: team.color }">
                {{ team.initials }}
              </div>
              <div>
                <h3 class="team-name">{{ team.name }}</h3>
                <span class="team-meta">
                  {{ team.members.length }} {{ team.members.length === 1 ? 'Mitglied' : 'Mitglieder' }} · {{ teamStore.getAdminCount(team) }} Admin(s)
                </span>
              </div>
            </div>

            <button
              type="button"
              class="danger-icon-button"
              title="Team löschen"
              @click="teamStore.deleteTeam(team.id)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <div class="members-list">
            <div
              v-for="member in team.members"
              :key="member.userId"
              class="member-row"
            >
              <div class="member-info">
                <span class="user-avatar">{{ member.initials }}</span>
                <div class="member-texts">
                  <div class="member-name-row">
                    <span class="member-name">{{ member.name }}</span>
                    <span
                      class="role-badge"
                      :class="member.role === 'admin' ? 'role-admin' : 'role-member'"
                    >
                      {{ member.role === 'admin' ? '👑 Gruppenadmin' : 'Mitglied' }}
                    </span>
                  </div>
                  <span class="member-email">{{ member.email }}</span>
                </div>
              </div>

              <div class="member-actions">
                <button
                  type="button"
                  class="action-text-btn"
                  :disabled="member.role === 'admin' && !teamStore.canDemoteAdmin(team.id, member.userId)"
                  :title="member.role === 'admin' && !teamStore.canDemoteAdmin(team.id, member.userId) ? 'Mindestens ein Gruppenadmin muss bleiben (F014)' : (member.role === 'admin' ? 'Zum Mitglied machen' : 'Zum Admin machen')"
                  @click="teamStore.toggleRole(team.id, member.userId)"
                >
                  {{ member.role === 'admin' ? 'Admin entziehen' : 'Zum Admin machen' }}
                </button>

                <button
                  type="button"
                  class="remove-member-btn"
                  :disabled="!teamStore.canRemoveMember(team.id, member.userId)"
                  :title="!teamStore.canRemoveMember(team.id, member.userId) ? 'Gruppe muss mindestens 1 Mitglied und 1 Admin haben (F013/F014)' : 'Aus Team entfernen'"
                  @click="teamStore.removeMember(team.id, member.userId)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="add-member-bar">
            <div class="add-member-form">
              <select
                v-model="selectedUserToAdd[team.id]"
                class="member-select"
                :disabled="teamStore.getAvailableUsersForTeam(team.id).length === 0"
              >
                <option value="" disabled>
                  {{ teamStore.getAvailableUsersForTeam(team.id).length === 0 ? 'Alle Personen bereits im Team' : 'Person auswählen ...' }}
                </option>
                <option
                  v-for="user in teamStore.getAvailableUsersForTeam(team.id)"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
              <button
                type="button"
                class="secondary-button add-btn"
                :disabled="!selectedUserToAdd[team.id]"
                @click="handleAddMember(team.id)"
              >
                ＋ Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="persons-section">
      <div class="persons-table-card">
        <div class="persons-table-head">
          <div>Person</div>
          <div>E-Mail</div>
          <div>Zugehörige Teams</div>
          <div>Status</div>
        </div>

        <div class="persons-table-body">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="persons-table-row"
          >
            <div class="person-cell-main">
              <span class="user-avatar" :style="{ backgroundColor: user.color }">
                {{ user.initials }}
              </span>
              <div class="person-name">{{ user.name }}</div>
            </div>

            <div class="person-email">{{ user.email }}</div>

            <div class="person-teams">
              <div v-if="teamStore.getUserTeams(user.id).length === 0" class="no-teams">
                Keinem Team zugewiesen
              </div>
              <div v-else class="team-tags">
                <span
                  v-for="team in teamStore.getUserTeams(user.id)"
                  :key="team.id"
                  class="team-tag"
                >
                  {{ team.name }}
                  <span
                    v-if="team.members.find(m => m.userId === user.id)?.role === 'admin'"
                    class="tag-admin-crown"
                    title="Gruppenadministrator"
                  >
                    👑
                  </span>
                </span>
              </div>
            </div>

            <div>
              <span class="status-active-badge">
                <span class="dot"></span>
                Aktiv
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isCreateModalOpen" class="modal-backdrop" @click.self="closeCreateModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">Neues Team erstellen</h2>
          <button type="button" class="close-btn" @click="closeCreateModal">✕</button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">
            Erstelle eine neue Gruppe für gemeinsame Tasks. Gemäss Pflichtenheft (F013) wird der Ersteller automatisch erster Gruppenadministrator.
          </p>

          <div class="form-group">
            <label class="form-label" for="team-name-input">Team-Name *</label>
            <input
              id="team-name-input"
              v-model="newTeamName"
              type="text"
              placeholder="z.B. Marketing, Scrum Team A ..."
              class="form-input"
              @keyup.enter="handleCreateTeam"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="team-creator-select">Erster Gruppenadministrator *</label>
            <select
              id="team-creator-select"
              v-model="newTeamCreatorId"
              class="form-input"
            >
              <option
                v-for="user in teamStore.users"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div v-if="createError" class="form-error">
            {{ createError }}
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="secondary-button" @click="closeCreateModal">
            Abbrechen
          </button>
          <button type="button" class="primary-button" @click="handleCreateTeam">
            Team erstellen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-page {
  max-width: 1300px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 22px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748B;
  font-size: 0.92rem;
  margin-top: 4px;
}

.primary-button {
  background: #5243E0;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  height: 42px;
  padding: 0 18px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(82, 67, 224, 0.2);
  transition: all 0.15s ease;
}

.primary-button:hover {
  background: #4333D0;
  transform: translateY(-1px);
}

.secondary-button {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  color: #334155;
  border-radius: 10px;
  height: 38px;
  padding: 0 14px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.secondary-button:hover:not(:disabled) {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.team-summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-badges {
  display: flex;
  gap: 10px;
}

.summary-badge {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.85rem;
  color: #64748B;
  font-weight: 500;
}

.summary-badge strong {
  color: #1E293B;
  font-weight: 700;
}

.tab-controls {
  display: flex;
  background: #F1F5F9;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.tab-button {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-button.active {
  background: #FFFFFF;
  color: #5243E0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-toolbar {
  margin-bottom: 24px;
}

.search-input-wrapper {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 0 16px;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 480px;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.88rem;
  color: #1E293B;
}

.search-input::placeholder {
  color: #94A3B8;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.team-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.team-card-header {
  padding: 20px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-info-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.team-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.05em;
}

.team-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.team-meta {
  font-size: 0.78rem;
  color: #64748B;
  display: block;
  margin-top: 2px;
}

.danger-icon-button {
  background: transparent;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.danger-icon-button:hover {
  background: #FEE2E2;
  color: #EF4444;
}

.members-list {
  padding: 12px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #F8FAFC;
  border: 1px solid #F1F5F9;
  gap: 12px;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #EEF2FF;
  color: #4F46E5;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-texts {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.member-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1E293B;
}

.role-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.role-admin {
  background: #FEF3C7;
  color: #B45309;
}

.role-member {
  background: #E2E8F0;
  color: #475569;
}

.member-email {
  font-size: 0.75rem;
  color: #94A3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.action-text-btn {
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  color: #475569;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.action-text-btn:hover:not(:disabled) {
  background: #F1F5F9;
  color: #1E293B;
}

.action-text-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.remove-member-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94A3B8;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.remove-member-btn:hover:not(:disabled) {
  background: #FEE2E2;
  color: #EF4444;
}

.remove-member-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-member-bar {
  padding: 14px 20px;
  border-top: 1px solid #F1F5F9;
  background: #FFFFFF;
}

.add-member-form {
  display: flex;
  gap: 8px;
}

.member-select {
  flex: 1;
  height: 38px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 0.8rem;
  color: #334155;
  background: #F8FAFC;
  outline: none;
}

.member-select:focus {
  border-color: #5243E0;
}

.add-btn {
  white-space: nowrap;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #94A3B8;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.persons-table-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.persons-table-head {
  display: grid;
  grid-template-columns: 2fr 2fr 3fr 1fr;
  padding: 14px 20px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.persons-table-body {
  display: flex;
  flex-direction: column;
}

.persons-table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 3fr 1fr;
  padding: 16px 20px;
  align-items: center;
  border-bottom: 1px solid #F1F5F9;
  transition: background-color 0.15s;
}

.persons-table-row:last-child {
  border-bottom: none;
}

.persons-table-row:hover {
  background-color: #F8FAFC;
}

.person-cell-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.person-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E293B;
}

.person-email {
  font-size: 0.85rem;
  color: #64748B;
}

.person-teams {
  display: flex;
  align-items: center;
}

.no-teams {
  font-size: 0.8rem;
  color: #94A3B8;
  font-style: italic;
}

.team-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.team-tag {
  background: #EEF2FF;
  color: #4F46E5;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-admin-crown {
  font-size: 0.7rem;
}

.status-active-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #DCFCE7;
  color: #16A34A;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16A34A;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-dialog {
  background: #FFFFFF;
  border-radius: 16px;
  width: min(500px, 100%);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  overflow: hidden;
  animation: modalPop 0.18s ease-out;
}

@keyframes modalPop {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-desc {
  color: #64748B;
  font-size: 0.84rem;
  line-height: 1.5;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.form-input {
  height: 42px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 0.88rem;
  color: #1E293B;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: #5243E0;
}

.form-error {
  color: #EF4444;
  font-size: 0.8rem;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
  background: #F8FAFC;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
