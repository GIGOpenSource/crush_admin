import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/modules/user';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/user',
    children: [
      {
        path: '/user',
        name: 'User',
        component: () => import('@/pages/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'UserOutlined',
        },
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/pages/order/index.vue'),
        meta: {
          title: '订单管理',
          icon: 'ShoppingCartOutlined',
        },
      },
      {
        path: '/ai-config',
        name: 'AIConfig',
        component: () => import('@/pages/ai-config/index.vue'),
        meta: {
          title: 'AI配置',
          icon: 'SettingOutlined',
        },
      },
      {
        path: '/template',
        name: 'Template',
        component: () => import('@/pages/template/index.vue'),
        meta: {
          title: '模板管理',
          icon: 'FileTextOutlined',
        },
      },
      {
        path: '/template-library',
        name: 'TemplateLibrary',
        component: () => import('@/pages/template-library/index.vue'),
        meta: {
          title: '模板库',
          icon: 'FolderOutlined',
        },
      },
      {
        path:"/prompt",
        name: 'Prompt',
        component: () => import('@/pages/prompt/index.vue'),
        meta: {
          title: '提示词管理',
          icon: 'RedditOutlined',
        },
      },
      {
        path: '/product',
        name: 'Product',
        component: () => import('@/pages/product/index.vue'),
        meta: {
          title: '商品管理',
          icon: 'ShoppingOutlined',
        },
      },
      {
        path: '/guide',
        name: 'Guide',
        component: () => import('@/pages/guide/index.vue'),
        meta: {
          title: '新手引导',
          icon: 'QuestionCircleOutlined',
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  
  if (to.path === '/login') {
    if (userStore.isLogin) {
      next('/');
    } else {
      next();
    }
  } else {
    if (userStore.isLogin) {
      next();
    } else {
      next('/login');
    }
  }
});

export default router;

