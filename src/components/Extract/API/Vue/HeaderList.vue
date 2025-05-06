    <template>
        <div class="row-with-label" v-show="headers.length === 0">
            <label class="left-label">Headers</label>
            <div style="font-style: italic; color: #999;">No headers added.</div>
        </div>

        <div class="row-with-label" v-for="(header, index) in headers" :key="index">
            <label class="left-label" :for="'header-key-' + index">
                {{ index === 0 ? 'Headers' : '\u00A0' }}
            </label>



            <div class="header-right">
                <div class="header-row">
                    <select v-model="header.key" :id="'header-key-' + index">
                        <option v-for="(key, i) in availableHeaderKeys" :key="i"
                            :disabled="isHeaderTypeDisabled(key, header)">
                            {{ key }}
                        </option>
                    </select>

                    <select v-if="getOptionsForHeader(header.key).length" v-model="header.value">
                        <option v-for="(option, i) in getOptionsForHeader(header.key)" :key="i">
                            {{ option }}
                        </option>
                    </select>

                    <input v-model="header.extra" :key="'auth-input-' + index" placeholder="Enter token" :class="{
                        hidden: !(
                            header.key === 'Authorization' &&
                            getOptionsForHeader(header.key).includes(header.value)
                        )
                    }" />

                    <button @click="removeHeader(index)">X</button>
                </div>
            </div>
        </div>
        <div class="row-with-label">
            <label class="left-label"></label>
            <button @click="addHeader">Add +</button>
        </div>


    </template>

    <script setup lang="ts">
    import { computed } from 'vue';
    import { useHeaders, type Header } from '../Scripts/useHeaders';

    // Props and emits for v-model:headers
    const props = defineProps<{
        modelValue: Header[];
    }>();

    const emit = defineEmits(['update:modelValue']);

    // Proxy for v-model="headers"
    const headers = computed<Header[]>({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val)
    });

    // Use utility methods from useHeaders (no internal headers)
    const {
        availableHeaderKeys,
        getOptionsForHeader,
        isHeaderTypeDisabled
    } = useHeaders(headers.value);

    // Add/remove modify the parent’s array directly
    function addHeader() {
        headers.value.push({ key: '', value: '', extra: '' });
    }

    function removeHeader(index: number) {
        headers.value.splice(index, 1);
    }
    </script>


    <style scoped>
    .row-with-label {
        display: flex;
        align-items: flex-start;
        width: 100%;
        gap: 0.5rem;
        box-sizing: border-box;
    }

    .left-label {
        flex: 0 0 150px;
        font-weight: bold;
        white-space: nowrap;
        text-align: left;
        margin-top: 6px;
        box-sizing: border-box;
    }

    /* Fixes the layout without shrinking inputs */
    .header-right {
        flex: 1;
        min-width: 0;
    }

    .header-row {
        display: flex;
        flex-wrap: nowrap;
        gap: 0.5rem;
        min-width: 0;
    }

    .header-row select,
    .header-row input {
        flex: 1;
        padding: 6px;
        min-width: 0;
        box-sizing: border-box;
    }

    .header-row select:first-of-type {
        width: 180px;
        flex: 0 0 auto;
    }

    .header-row button {
        flex: 0 0 auto;
        width: 40px;
        height: 36px;
        padding: 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
    }

    .hidden {
        visibility: hidden;
        position: absolute;
        pointer-events: none;
    }
    </style>
