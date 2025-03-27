<template>
    <div class="loading-spinner-wrapper">
      <div class="spinner"></div>
    </div>
  </template>
  
  <style scoped>
  .loading-spinner-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 120px;
    width: 100%;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 4px solid #ccc;
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  
  