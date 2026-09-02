import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from '../views/OverviewView.vue'
import TimelineView from '../views/TimelineView.vue'
import AllTasksView from '../views/AllTasksView.vue'
import LabelsView from '../views/LabelsView.vue'
import TeamView from '../views/TeamView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'overview', component: OverviewView },
        { path: '/timeline', name: 'timeline', component: TimelineView },
        { path: '/all-tasks', name: 'all-tasks', component: AllTasksView },
        { path: '/labels', name: 'labels', component: LabelsView },
        { path: '/team', name: 'team', component: TeamView },
    ],
})

export default router
