<template>
    <div class="extract-container">
        <component :is="currentComponent" v-bind="componentProps" />
    </div>
</template>

<script>
import APIContent from './APIContent.vue'

export default {
    name: 'Extract',
    components: {
        APIContent,
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
                    return 'APIContent'
                default:
                    return null
            }
        }
    }
}
</script>

<style scoped>
.extract-container {
  max-width: 600px;
  margin: 2rem auto;
  font-family: sans-serif;
  justify-content: flex-start; /* Ensures top alignment */
  min-height: 100vh; /* full height to avoid accidental vertical centering */
}
</style>