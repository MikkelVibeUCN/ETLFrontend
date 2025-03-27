<template>
    <div class="extract-wrapper">
      <div class="extract-header">
        <font-awesome-icon icon="globe" class="globe-icon" />
        <span class="title">Extract from URL</span>
        <button class="dots-btn" @click="handleDotsClick">•••</button>
      </div>
      <div class="extract-container">
        <component :is="currentComponent" v-bind="componentProps" />
      </div>
    </div>
  </template>
  
  <script>
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import APIContent from './API/Vue/APIContent.vue'

library.add(faGlobe)
  
  export default {
    name: 'Extract',
    components: {
      APIContent,
      FontAwesomeIcon
    },
    props: {
      type: {
        type: String,
        required: true,
      },
      componentProps: {
        type: Object,
        default: () => ({}),
      }
    },
    computed: {
      currentComponent() {
        switch (this.type) {
          case 'API':
            return 'APIContent';
          default:
            return null;
        }
      }
    },
    methods: {
      handleDotsClick() {
        console.log('More options clicked');
      }
    }
  }
  </script>
  
  <style scoped>
  .extract-wrapper {
    border: 2px solid #444;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    width: fit-content;
    max-width: 100%;
  }
  
  .extract-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #1a1a1a; /* black/dark background */
    padding: 0.5rem 0.75rem;
    font-weight: bold;
    color: white;
  }
  
  .globe-icon {
    margin-right: 0.5rem;
    color: white; /* white globe */
  }
  
  .title {
    flex-grow: 1;
    color: white;
    font-size: 0.95rem;
  }
  
  .dots-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    margin-left: 0.5rem;
  }
  
  .dots-btn:hover {
    opacity: 0.8;
  }
  
  .extract-container {
    padding: 1rem;
  }
  </style>
  