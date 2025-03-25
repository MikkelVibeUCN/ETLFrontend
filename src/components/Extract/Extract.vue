<template>
    <div class="extract">
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