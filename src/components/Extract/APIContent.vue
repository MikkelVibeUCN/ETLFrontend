<template>
  <div class="form-container">
    <div class="row-with-label">
      <label class="left-label" for="url">HTTP GET URL</label>
      <input id="url" v-model="url" placeholder="Enter URL..." />
    </div>

    <div class="row-with-label" v-if="headers.length === 0">
      <label class="left-label">Headers</label>
      <div style="font-style: italic; color: #999;">No headers added.</div>
    </div>

    <div class="row-with-label" v-for="(header, index) in headers" :key="index">
      <label v-if="index === 0" class="left-label" :for="'header-key-' + index">
        Headers
      </label>
      <label v-else class="left-label"></label>

      <div class="header-row">
        <select v-model="header.key" :id="'header-key-' + index">
          <option v-for="(key, i) in availableHeaderKeys" :key="i" :disabled="isHeaderTypeDisabled(key, header)">
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
          ),
        }" />

        <button @click="removeHeader(index)">X</button>
      </div>
    </div>

    <div class="row-with-label">
      <label class="left-label"></label>
      <button @click="addHeader">Add +</button>
    </div>

    <button @click="getFormat">Get format ▶</button>

    <div class="content">
      <div class="labels-row">
        <label class="section-label">JSON Format</label>
        <label class="section-label">Include Fields</label>
      </div>
      <div class="content-row">
        <div class="section">
          <textarea v-model="jsonFormat" rows="8"></textarea>
        </div>
        <div class="section">
          <div class="checkboxes" v-for="(field, index) in fieldOptions" :key="index">
            <input type="checkbox" v-model="field.selected" />
            <label>{{ field.name }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJsonWithHeaders, formatHeaders, simplifyJsonStructure } from '../../Scripts/fetchFormat';
export default {
  data() {
    return {
      url: 'https://api.themoviedb.org/3/movie/changes?page=1',
      headers: [
        { key: 'Authorization', value: 'Bearer', extra: '' },
        { key: 'Accept', value: 'application/json' }
      ],
      jsonFormat: '',
      fieldOptions: [],
      headerTypes: [
        {
          'Content-Type': [
            'application/json',
            'application/xml',
            'application/x-www-form-urlencoded',
            'application/form-data',
            'text/html',
            'text/css',
            'text/csv'
          ]
        },
        {
          Authorization: ['Bearer', 'Basic']
        },
        {
          Accept: ['application/json']
        }
      ]
    };
  },
  computed: {
    availableHeaderKeys() {
      return this.headerTypes.map(obj => Object.keys(obj)[0]);
    },
  },
  methods: {
    addHeader() {
      this.headers.push({ key: '', value: '', extra: '' });
    },
    removeHeader(index) {
      this.headers.splice(index, 1);
    },
    getOptionsForHeader(headerKey) {
      const obj = this.headerTypes.find(h => Object.keys(h)[0] === headerKey);
      return obj ? obj[headerKey] : [];
    },
    isHeaderTypeDisabled(type, currentHeader) {
      return this.headers.some(h => h.key === type && h !== currentHeader);
    },
    async getFormat() {
      console.log('Generating format...');
      var json = await fetchJsonWithHeaders(this.url, formatHeaders(this.headers));

      this.jsonFormat = JSON.stringify(simplifyJsonStructure(json), null, 2);

    }
  }
};
</script>

<style scoped>
.form-container {
  min-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 800px;
  width: 100%;
  box-sizing: border-box;
}

.row-with-label {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 0.5rem;
  box-sizing: border-box;
}

.left-label {
  flex: 0 0 auto;
  min-width: 100px;
  max-width: 150px;
  width: 100%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  margin-top: 6px;
  box-sizing: border-box;
}

.row-with-label input,
.row-with-label select,
.row-with-label textarea {
  flex: 1;
  min-width: 0;
  padding: 6px;
  box-sizing: border-box;
}

.header-row {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  gap: 0.5rem;
  min-width: 0;
}

.header-row select,
.header-row input {
  flex: 1;
  padding: 6px;
  min-width: 0;
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

.content {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
}

.labels-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
}

.section-label {
  width: 50%;
  font-weight: bold;
}

.content-row {
  display: flex;
  gap: 1rem;
}

.section {
  width: 50%;
  display: flex;
  flex-direction: column;
}

textarea {
  flex: 1;
  height: 200px;
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
}

.checkboxes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>