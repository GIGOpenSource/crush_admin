<template>
  <div class="layout-container">
    <a-layout>
      <a-layout-sider
        v-model:collapsed="settingStore.collapsed"
        :width="settingStore.siderWidth"
        :collapsed-width="80"
        class="layout-sider"
      >
        <div class="logo" :style="{ padding: settingStore.collapsed ? '16px 20px' : '16px 24px' }">
          <span v-if="!settingStore.collapsed" style="color: #1890ff; font-weight: bold; font-size: 15px">
            CrushCheck管理后台
          </span>
          <span v-else style="color: #1890ff; font-weight: bold; font-size: 20px">N</span>
        </div>
        <LayoutMenu />
      </a-layout-sider>
      <a-layout>
        <LayoutHeader />
        <a-layout-content class="layout-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store';
import LayoutHeader from './components/Header.vue';
import LayoutMenu from './components/Menu.vue';

const settingStore = useSettingStore();
</script>

<style lang="less" scoped>
@import '@/style/layout.less';
</style>

