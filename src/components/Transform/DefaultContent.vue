<template>
    <!-- Empty state if no nodes -->
    <h3>No fields available</h3>
    <p class="empty-description">
      Once you connect an extract node, the available fields will be shown here. <br />
      You can then apply transformations like renaming and filtering with conditional logic such as
      <em>Equals</em> or <em>Contains</em>.
    </p>
    <ul class="empty-tips">
      <li>💡 Connect to a data source using an extract node to begin</li>
      <li>💡 Fields are automatically parsed into a tree structure</li>
      <li>💡 Use <strong>Change Name</strong> to rename fields</li>
      <li>💡 Add rules like <em>Greater Than</em> or <em>Contains</em> for filtering</li>
    </ul>
  </template>


<script>
</script>
<style scoped>

.empty-description {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.empty-tips {
    text-align: left;
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 400px;
  font-size: 0.9rem;
  color: #aaa;
}

.empty-tips li {
  margin: 0.25rem 0;
}
</style>