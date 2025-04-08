<template>
  <div class="main-wrapper">
    <div class="navbar">
      <h1 class="title">{{ title }}</h1>
      <div class="navbar-items">
        <div class="navbar-item" v-for="(navItem, i) in navbarItems" :key="i" @click="navItem.clickEvent">
          <img class="icon" :src="navItem.iconPath" />
          <span class="navbar-item-label">{{ navItem.name }}</span>
        </div>
      </div>
    </div>

    <DraggableCanvas ref="canvasRef" />

  </div>
</template>


<script lang="ts">
import DraggableCanvas from '../components/DraggableCanvas.vue'
import Extract from '../components/Extract/Extract.vue'
import Transform from '../components/Transform/Transform.vue';
import type { PipelineConfig } from '../shared/scripts/PipelineConfig';

export default {
  name: 'MainView',
  components: {
    DraggableCanvas,
    Extract,
    Transform
  },
  data() {
    return {
      title: "ETL-Module Designer",
      navbarItems: [] as { iconPath: string; name: string; clickEvent: () => void }[]
    }
  },
  created() {
    this.navbarItems = [
      { iconPath: "/save.png", name: "Save", clickEvent: this.save },
      { iconPath: "/discard.png", name: "Discard", clickEvent: this.discard },
      { iconPath: "/templates.png", name: "Templates", clickEvent: this.showTemplates },
      { iconPath: "/help.png", name: "Help", clickEvent: this.showHelp }
    ]
  },
  methods: {
    save() {
      const canvas = this.$refs.canvasRef as { loadFromPipelineConfig: (config: PipelineConfig) => any }

      if (canvas) {
        var config = {
          "Id": "",
          "SourceInfo": {
            "$type": "api",
            "Url": "https://api.themoviedb.org/3/movie/550?language=en-US",
            "Headers": {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzY2ZjNWNmNGM4YzcxYTZiNjE0MmM0ODQxNWFjN2U5OCIsIm5iZiI6MTc0MjU3MDc2Ni42NjEsInN1YiI6IjY3ZGQ4NTBlMDQxNjg3NWFkYzY5OGRhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Wpozuz_n15UxNbi06eooyI5pd41zdAK1BN0LxexZAUg"
            }
          },
          "ExtractConfig": {
            "Fields": [
              "adult",
              "backdrop_path",
              "belongs_to_collection",
              "budget",
              "homepage",
              "id",
              "imdb_id",
              "origin_country",
              "original_language",
              "original_title",
              "overview",
              "popularity",
              "poster_path",
              "release_date",
              "revenue",
              "status",
              "tagline",
              "title",
              "video",
              "vote_average",
              "vote_count"
            ],
            "Filters": []
          },
          "TransformConfig": {
            "Mappings": [
              {
                "SourceField": "origin_country",
                "TargetField": "newcountry"
              }
            ],
            "Filters": [
              {
                "Field": "original_language",
                "Operator": "equals",
                "Value": "us"
              }
            ]
          },
          "LoadTargetConfig": {
            "TargetInfo": {
              "$type": "mysql",
              "ConnectionString": "Server=1212121;Port=3306;User Id=user;Password=password;Database=mydatabase;",
              "LoadMode": "append"
            },
            "Tables": [
              {
                "TargetTable": "table1",
                "Fields": [
                  "origin_country",
                  "original_language",
                  "original_title",
                  "overview",
                  "popularity",
                  "poster_path",
                  "release_date",
                  "revenue",
                  "status",
                  "tagline",
                  "title",
                  "video",
                  "vote_average",
                  "vote_count"
                ]
              },
              {
                "TargetTable": "table2",
                "Fields": [
                  "adult",
                  "backdrop_path",
                  "belongs_to_collection",
                  "budget",
                  "homepage",
                  "id",
                  "imdb_id"
                ]
              }
            ]
          }
        }
      canvas.loadFromPipelineConfig(config as PipelineConfig)



    } else {
      console.warn("DraggableCanvas ref not found")
    }
  },
  discard() {
    console.log("Discard clicked")
  },
  showTemplates() {
    console.log("Show templates")
  },
  showHelp() {
    console.log("Show help")
  }
}
}
</script>


<style scoped>
.main-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.navbar {
  background-color: #2c2c2c;
  padding: 10px 20px;
  color: #fff;
  border-bottom: 2px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1.5em;
}

.navbar-items {
  display: flex;
  gap: 20px;
}

.navbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.navbar-item:hover {
  background-color: #444;
}

.icon {
  width: 20px;
  height: 20px;
}

.navbar-item-label {
  font-size: 0.95em;
  color: white;
}
</style>
