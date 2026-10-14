<script setup lang="ts">
import { ref } from 'vue'
import { useTeamStore } from '../stores/teamStore'

const teamStore = useTeamStore()

const isPersonModalOpen = ref(false)
const isTeamModalOpen = ref(false)

const newPersonName = ref('')
const newPersonRole = ref('Developer')

const newTeamName = ref('')
const selectedTeamMembers = ref<string[]>([])

function openPersonModal() {
  newPersonName.value = ''
  newPersonRole.value = 'Developer'
  isPersonModalOpen.value = true
}

function handleCreatePerson() {
  if (!newPersonName.value.trim()) return
  teamStore.addPerson(newPersonName.value, newPersonRole.value)
  isPersonModalOpen.value = false
}

function openTeamModal() {
  newTeamName.value = ''
  selectedTeamMembers.value = teamStore.persons.map(p => p.name)
  isTeamModalOpen.value = true
}

function toggleMemberSelection(memberName: string) {
  const index = selectedTeamMembers.value.indexOf(memberName)
  if (index >= 0) {
    selectedTeamMembers.value.splice(index, 1)
  } else {
    selectedTeamMembers.value.push(memberName)
  }
}

function handleCreateTeam() {
  if (!newTeamName.value.trim()) return
  teamStore.addTeam(newTeamName.value, selectedTeamMembers.value)
  isTeamModalOpen.value = false
}
</script>

<template>
  <div class="team-page">
    <div class="team-header">
      <div>
        <h1 class="page-title">Team</h1>
        <p class="page-subtitle">Verwalte Personen und Teams für die Task-Zuweisung.</p>
      </div>

      <div class="header-buttons">
        <button type="button" class="btn-secondary" @click="openTeamModal">
          ＋ Neues Team
        </button>
        <button type="button" class="btn-primary" @click="openPersonModal">
          ＋ Neue Person
        </button>
      </div>
    </div>

    <section class="team-section">
      <div class="section-top">
        <h2 class="section-heading">Personen</h2>
        <span class="count-badge">{{ teamStore.persons.length }} Personen</span>
      </div>

      <div class="cards-grid">
        <div 
          v-for="person in teamStore.persons" 
          :key="person.id" 
          class="team-card"
        >
          <div class="card-avatar">{{ person.initials }}</div>
          <div class="card-info">
            <h3 class="card-name">{{ person.name }}</h3>
            <span class="card-sub">{{ person.role }}</span>
          </div>
          <button 
            type="button" 
            class="delete-btn" 
            @click="teamStore.deletePerson(person.id)"
            title="Löschen"
          >
            ✕
          </button>
        </div>
      </div>
    </section>

    <section class="team-section">
      <div class="section-top">
        <h2 class="section-heading">Teams</h2>
        <span class="count-badge">{{ teamStore.teams.length }} Team</span>
      </div>

      <div class="cards-grid">
        <div 
          v-for="team in teamStore.teams" 
          :key="team.id" 
          class="team-card"
        >
          <div class="card-avatar team-avatar">{{ team.initials }}</div>
          <div class="card-info">
            <h3 class="card-name">{{ team.name }}</h3>
            <span class="card-sub">{{ team.members.join(', ') }}</span>
          </div>
          <button 
            type="button" 
            class="delete-btn" 
            @click="teamStore.deleteTeam(team.id)"
            title="Löschen"
          >
            ✕
          </button>
        </div>
      </div>
    </section>

    <div v-if="isPersonModalOpen" class="modal-overlay" @click.self="isPersonModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Neue Person</h3>
            <p class="modal-subtitle">Erstelle ein neues Teammitglied für Aufgaben.</p>
          </div>
          <button type="button" class="close-btn" @click="isPersonModalOpen = false">✕</button>
        </div>

        <form class="modal-body" @submit.prevent="handleCreatePerson">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input 
              v-model="newPersonName" 
              type="text" 
              class="form-input" 
              placeholder="z. B. Max Mustermann" 
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Rolle</label>
            <input 
              v-model="newPersonRole" 
              type="text" 
              class="form-input" 
              placeholder="z. B. Frontend Developer" 
              required
            />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="isPersonModalOpen = false">Abbrechen</button>
            <button type="submit" class="btn-primary">Person erstellen</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isTeamModalOpen" class="modal-overlay" @click.self="isTeamModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Neues Team</h3>
            <p class="modal-subtitle">Erstelle ein Team und weise Mitglieder zu.</p>
          </div>
          <button type="button" class="close-btn" @click="isTeamModalOpen = false">✕</button>
        </div>

        <form class="modal-body" @submit.prevent="handleCreateTeam">
          <div class="form-group">
            <label class="form-label">Team Name</label>
            <input 
              v-model="newTeamName" 
              type="text" 
              class="form-input" 
              placeholder="z. B. Core Team" 
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Mitglieder auswählen</label>
            <div class="members-checkbox-list">
              <label 
                v-for="person in teamStore.persons" 
                :key="person.id" 
                class="member-checkbox-item"
              >
                <input 
                  type="checkbox" 
                  :checked="selectedTeamMembers.includes(person.name)" 
                  @change="toggleMemberSelection(person.name)"
                />
                <span>{{ person.name }} ({{ person.role }})</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="isTeamModalOpen = false">Abbrechen</button>
            <button type="submit" class="btn-primary">Team erstellen</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-page {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.header-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary {
  background: var(--primary);
  color: #FFFFFF;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 14px rgba(82, 67, 224, 0.3);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: #FFFFFF;
  color: #334155;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.team-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-heading {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1E293B;
}

.count-badge {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748B;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.team-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.team-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.card-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3B82F6;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-avatar {
  background: var(--primary);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-sub {
  font-size: 0.82rem;
  color: #64748B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #FFF1F2;
  border: 1px solid #FFE4E6;
  color: #F43F5E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.15s;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #FFE4E6;
  color: #E11D48;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: #FFFFFF;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 28px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #F1F5F9;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1E293B;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #64748B;
  margin-top: 4px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  outline: none;
  font-family: inherit;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(82, 67, 224, 0.12);
}

.members-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #F8FAFC;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  max-height: 180px;
  overflow-y: auto;
}

.member-checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #334155;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}
</style>
