<template>
    <div class="main-view">
      <nav class="navbar">
        <router-link to="/" class="title">
          <img class="logo" src="/logo.png" />
          FLUX-ETL
        </router-link>
      </nav>
      <div class="content">
        <router-view />
      </div>
    </div>
  </template>
  
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
    flex-shrink: 0; 
  }
  
  .title {
    font-size: 1.8rem;
    color: white;
    text-decoration: none;
    align-items: center;
    display: flex;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
  }
  .logo {
    padding-right: 0.3rem;
  width: 35px;
  height: 35px;
  
}
  </style>
  