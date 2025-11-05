<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    mode="inline"
    :theme="settingStore.theme === 'dark' ? 'dark' : 'light'"
    @click="handleMenuClick"
  >
    <template v-for="route in routes" :key="route.path">
      <a-menu-item v-if="!route.children || route.children.length === 0" :key="route.path">
        <component :is="getIcon(route.meta?.icon)" />
        <span>{{ route.meta?.title }}</span>
      </a-menu-item>
      <a-sub-menu v-else :key="route.path">
        <template #title>
          <component :is="getIcon(route.meta?.icon)" />
          <span>{{ route.meta?.title }}</span>
        </template>
        <a-menu-item v-for="child in route.children" :key="child.path">
          <component :is="getIcon(child.meta?.icon)" />
          <span>{{ child.meta?.title }}</span>
        </a-menu-item>
      </a-sub-menu>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import * as Icons from '@ant-design/icons-vue';
import { useSettingStore } from '@/store';

const route = useRoute();
const router = useRouter();
const settingStore = useSettingStore();

const selectedKeys = ref<string[]>([route.path]);
const openKeys = ref<string[]>([]);

const routes = computed(() => {
  const rootRoute = router.getRoutes().find((r) => r.path === '/');
  return rootRoute?.children || [];
});

const getIcon = (iconName?: string) => {
  if (!iconName) return Icons.AppstoreOutlined;
  return Icons[iconName as keyof typeof Icons] || Icons.AppstoreOutlined;
};

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key);
};

const updateMenuState = () => {
  const currentPath = route.path;
  selectedKeys.value = [currentPath];
  
  // 找到当前路由的父路由
  const matched = route.matched;
  if (matched.length > 1) {
    const parentPath = matched[matched.length - 2].path;
    if (parentPath && parentPath !== '/') {
      openKeys.value = [parentPath];
    }
  }
};

watch(
  () => route.path,
  () => {
    updateMenuState();
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
.ant-menu {
  border-right: none;
}
</style>

