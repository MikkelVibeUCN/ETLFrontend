    <template>
        <div class="main-view">
            <nav class="navbar">
                <router-link to="/" class="title">ECG-ETL</router-link>
            </nav>
            <div class="content">
                <router-view />
            </div>
        </div>
    </template>

<script setup>
// No logic needed here — routing handles switching views
</script>

<style scoped>
.main-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
    background-color: #1f1f1f;
    color: white;
    padding: 1rem;
    border-bottom: 2px solid #333;
}

.title {
    margin: 0;
    font-size: 1.8rem;
    color: white;
    text-decoration: none;
}
</style>
