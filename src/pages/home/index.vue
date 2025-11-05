<template>
  <div class="home-container">
    <a-card :bordered="false" class="welcome-card">
      <h1>欢迎使用 知了小程序管理后台</h1>
      <p>这是一个基于 Vue3 + Ant Design Vue 的后台管理系统模板</p>
    </a-card>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :xs="24" :sm="12" :md="8" :lg="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="总用户数"
            :value="1234"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :lg="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="今日访问"
            :value="567"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <EyeOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :lg="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="总订单"
            :value="890"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <ShoppingOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :lg="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="总收入"
            :value="123456"
            :precision="2"
            prefix="¥"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :xs="24" :lg="12">
        <a-card title="最近活动" :bordered="false">
          <a-list :data-source="activities" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: '#1890ff' }">
                      {{ item.user?.[0] }}
                    </a-avatar>
                  </template>
                  <template #title>
                    {{ item.title }}
                  </template>
                  <template #description>
                    {{ item.time }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="快速操作" :bordered="false">
          <a-space wrap>
            <a-button type="primary">
              <template #icon><PlusOutlined /></template>
              新建
            </a-button>
            <a-button>
              <template #icon><EditOutlined /></template>
              编辑
            </a-button>
            <a-button>
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
            <a-button>
              <template #icon><ExportOutlined /></template>
              导出
            </a-button>
            <a-button>
              <template #icon><ImportOutlined /></template>
              导入
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  UserOutlined,
  EyeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons-vue';

const activities = ref([
  {
    user: '张三',
    title: '创建了新订单',
    time: '2 小时前',
  },
  {
    user: '李四',
    title: '更新了用户信息',
    time: '4 小时前',
  },
  {
    user: '王五',
    title: '删除了无效数据',
    time: '6 小时前',
  },
  {
    user: '赵六',
    title: '导出了报表',
    time: '8 小时前',
  },
]);
</script>

<style lang="less" scoped>
.home-container {
  .welcome-card {
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    color: #fff;

    h1 {
      color: #fff;
      margin-bottom: 8px;
    }

    p {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }
  }

  .stat-card {
    text-align: center;

    :deep(.ant-statistic-title) {
      font-size: 14px;
      color: #666;
    }

    :deep(.ant-statistic-content) {
      font-size: 24px;
    }
  }
}
</style>

