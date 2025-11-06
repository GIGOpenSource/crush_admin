<template>
  <div class="template-library">
    <a-card :bordered="false">
      <template #title>
        <span>模板库</span>
      </template>
      <div class="library-wrapper">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in templateList" :key="item.id">
            <a-card hoverable class="template-card" @click="handlePreview(item)">
              <template #cover>
                <div class="template-preview">
                  <img v-if="item.cover" :src="item.cover" alt="模板预览" />
                  <div v-else class="template-placeholder">暂无预览</div>
                </div>
              </template>
              <a-card-meta :title="item.name" :description="item.description">
                <template #description>
                  <div class="template-meta">
                    <div>{{ item.description }}</div>
                    <div class="template-actions">
                      <a-button type="primary" size="small" @click.stop="handleUse(item)">使用</a-button>
                      <a-button size="small" @click.stop="handlePreview(item)">预览</a-button>
                    </div>
                  </div>
                </template>
              </a-card-meta>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="templateList.length === 0 && !loading" description="暂无模板" />
        <a-spin :spinning="loading" style="width: 100%; text-align: center; padding: 40px 0">
          <div v-if="loading"></div>
        </a-spin>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

interface TemplateItem {
  id: number;
  name: string;
  description: string;
  cover?: string;
  category: string;
}

const loading = ref(false);
const templateList = ref<TemplateItem[]>([]);

const handleUse = (item: TemplateItem) => {
  message.info(`使用模板: ${item.name}`);
  // TODO: 实现使用模板功能
};

const handlePreview = (item: TemplateItem) => {
  message.info(`预览模板: ${item.name}`);
  // TODO: 实现预览功能
};

// TODO: 加载数据
const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    templateList.value = [];
    loading.value = false;
  }, 500);
};

loadData();
</script>

<style lang="less" scoped>
.template-library {
  .library-wrapper {
    margin-top: 16px;
  }

  .template-card {
    height: 100%;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .template-preview {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .template-placeholder {
    color: #999;
    font-size: 14px;
  }

  .template-meta {
    .template-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
  }
}
</style>

