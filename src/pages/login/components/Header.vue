<template>
  <header class="login-header">
    <h1>CrushCheck管理后台</h1>
    <div class="operations-container">
      <!-- 可以在这里添加其他操作按钮 -->
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style lang="less" scoped>
.login-header {
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  color: #000;
  height: 64px;
  background: rgba(255, 255, 255, 0.8);

  h1 {
    font-size: 18px;
    font-weight: 500;
    margin: 0;
    color: #000;
  }

  .operations-container {
    display: flex;
    align-items: center;
  }
}
</style>

