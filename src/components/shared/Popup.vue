<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h3>{{ title }}</h3>
      
      <!-- Conditionally show input fields only if inputType is provided -->
      <div v-if="inputType === 'text'">
        <input v-model="inputValue" :placeholder="placeholder" />
      </div>
      <div v-if="inputType === 'number'">
        <input v-model.number="inputValue" type="number" :placeholder="placeholder" />
      </div>
      <div v-if="inputType === 'textarea'">
        <textarea v-model="inputValue" :placeholder="placeholder"></textarea>
      </div>

      <!-- Show the buttons even if no input field is present -->
      <button @click="onSubmit">Submit</button>
      <button @click="onClose">Cancel</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    inputType: {
      type: String,
      default: ''  // Default to empty string, meaning no input field will be shown
    },
    placeholder: {
      type: String,
      default: 'Enter value'
    },
    initialValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputValue: this.initialValue
    };
  },
  methods: {
    onSubmit() {
      this.$emit('set-value', this.inputValue);
    },
    onClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: black;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

input, textarea {
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 8px 12px;
  margin: 5px;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
}

button:hover {
  background-color: #0056b3;
}
</style>
