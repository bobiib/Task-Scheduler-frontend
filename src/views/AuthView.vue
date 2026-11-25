<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError, apiClient } from '../api/client'

const route = useRoute()
const router = useRouter()
const registering = computed(() => route.name === 'register')
const form = reactive({ name: '', email: '', password: '', confirmation: '' })
const errors = reactive({ name: '', email: '', password: '', confirmation: '' })
const message = ref('')
const pending = ref(false)

async function submit() {
  if (pending.value) return
  message.value = ''
  const name = form.name.trim()
  const email = form.email.trim()
  const { password, confirmation } = form

  errors.name = registering.value && !name ? 'Gib deinen Namen ein.' : ''
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Gib eine gültige E-Mail-Adresse ein.'
  errors.password = !password ? 'Gib dein Passwort ein.' : ''
  if (registering.value && password && password.length < 8) {
    errors.password = 'Das Passwort muss mindestens 8 Zeichen enthalten.'
  }
  errors.confirmation = registering.value && (password !== confirmation || !confirmation)
    ? 'Wiederhole dein Passwort korrekt.'
    : ''

  if (Object.values(errors).some(Boolean)) return
  pending.value = true
  try {
    const result = await apiClient.post<{ token: string }>(
      registering.value ? '/auth/register' : '/auth/login',
      registering.value ? { name, email, password } : { email, password },
    )
    sessionStorage.setItem('task-scheduler-token', result.token)
    await router.push({ name: 'overview' })
  } catch (error: unknown) {
    if (error instanceof ApiError && registering.value && error.status === 409) {
      errors.email = 'Diese E-Mail-Adresse ist bereits registriert.'
    } else if (error instanceof ApiError && !registering.value && error.status === 401) {
      errors.password = 'E-Mail-Adresse oder Passwort ist falsch.'
    } else {
      message.value = 'Die Anfrage konnte nicht abgeschlossen werden. Versuche es erneut.'
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" aria-labelledby="auth-heading">
      <h1 id="auth-heading">{{ registering ? 'Konto erstellen' : 'Anmelden' }}</h1>
      <form novalidate @submit.prevent="submit">
        <fieldset :disabled="pending">
          <div v-if="registering" class="field">
            <label for="name">Name</label>
            <input id="name" v-model="form.name" autocomplete="name" maxlength="100" required
              :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'name-error' : undefined" />
            <p v-if="errors.name" id="name-error" class="error" role="alert">{{ errors.name }}</p>
          </div>
          <div class="field">
            <label for="email">E-Mail-Adresse</label>
            <input id="email" v-model="form.email" type="email" autocomplete="email" maxlength="255" required
              :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'email-error' : undefined" />
            <p v-if="errors.email" id="email-error" class="error" role="alert">{{ errors.email }}</p>
          </div>
          <div class="field">
            <label for="password">Passwort</label>
            <input id="password" v-model="form.password" type="password" required
              :autocomplete="registering ? 'new-password' : 'current-password'"
              :aria-invalid="!!errors.password" :aria-describedby="errors.password ? 'password-error' : undefined" />
            <p v-if="errors.password" id="password-error" class="error" role="alert">{{ errors.password }}</p>
          </div>
          <div v-if="registering" class="field">
            <label for="confirmation">Passwort wiederholen</label>
            <input id="confirmation" v-model="form.confirmation" type="password" autocomplete="new-password" required
              :aria-invalid="!!errors.confirmation"
              :aria-describedby="errors.confirmation ? 'confirmation-error' : undefined" />
            <p v-if="errors.confirmation" id="confirmation-error" class="error" role="alert">{{ errors.confirmation }}</p>
          </div>
          <p v-if="message" class="error" role="alert">{{ message }}</p>
          <button type="submit">
            {{ pending ? 'Bitte warten …' : registering ? 'Registrieren' : 'Anmelden' }}
          </button>
        </fieldset>
      </form>
      <p class="switch">
        {{ registering ? 'Schon ein Konto?' : 'Noch kein Konto?' }}
        <RouterLink :to="{ name: registering ? 'login' : 'register' }">
          {{ registering ? 'Anmelden' : 'Registrieren' }}
        </RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 2rem);
  background: var(--bg-main);
}

.auth-card {
  width: min(100%, 28rem);
  padding: clamp(1.4rem, 5vw, 2.5rem);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

h1 {
  margin-bottom: 1.5rem;
  font-size: clamp(1.65rem, 5vw, 2rem);
  letter-spacing: -.035em;
}

fieldset, .field {
  display: grid;
  gap: .45rem;
  border: 0;
  min-width: 0;
}

fieldset { gap: 1rem; }
label { font-size: .875rem; font-weight: 600; }

input {
  width: 100%;
  min-height: 2.75rem;
  padding: .7rem .8rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--border-radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
}

input[aria-invalid="true"] { border-color: #b42318; }
:where(input, button, a):focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
.error { color: #b42318; font-size: .875rem; line-height: 1.4; }

button {
  min-height: 2.75rem;
  margin-top: .25rem;
  background: var(--primary);
  color: white;
  padding: .75rem;
  border-radius: var(--border-radius-sm);
  font-weight: 700;
}

button:hover:not(:disabled) { background: var(--primary-hover); }
button:disabled { opacity: .65; cursor: wait; }

.switch {
  margin-top: 1.25rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: .875rem;
  text-align: center;
}

a { color: var(--primary); font-weight: 600; text-underline-offset: .2em; }
</style>
