import { createRouter, createWebHistory } from 'vue-router'
import ConfigsView from '../Views/ConfigsView.vue'
import ModuleDesignerView from '../Views/ModuleDesignerView.vue'

const routes = [
  {
    path: '/',
    name: 'Configs',
    component: ConfigsView
  },
  {
    path: '/pipeline/edit/:id',
    name: 'EditModule',
    component: ModuleDesignerView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
