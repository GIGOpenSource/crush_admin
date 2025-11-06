<template>
  <div class="login-wrapper">
    <LoginHeader />
    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">欢迎登录</h1>
        <h1 class="title">知了小程序管理后台</h1>
      </div>
      <div class="item-container">
        <a-form :model="formState" :rules="rules" @finish="handleSubmit" class="login-form" layout="vertical">
          <a-form-item name="username">
            <a-input v-model:value="formState.username" size="large" placeholder="请输入用户名" :prefix-hoverable="false">
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <a-input-password v-model:value="formState.password" size="large" placeholder="请输入密码"
              :prefix-hoverable="false">
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="check-container remember-pwd">
            <a-checkbox>记住密码</a-checkbox>
          </div>
          <a-form-item class="btn-container">
            <a-button type="primary" html-type="submit" size="large" :loading="loading" block>
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/store/modules/user';
import { loginApi } from '@/api/auth';
import LoginHeader from './components/Header.vue';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const formState = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const response = await loginApi({
      username: formState.username,
      password: formState.password,
    });

    // 响应拦截器已经返回了 data.data，所以 response 直接就是 { token, user_id, username }
    console.log('登录响应:', response);

    // 保存 token
    userStore.setToken(response.token);

    // 转换并保存用户信息：将 API 返回的格式转换为前端需要的格式
    userStore.setUserInfo({
      id: String(response.user_id), // user_id 转为字符串 id
      name: response.username, // username 转为 name
      avatar: undefined,
      role: undefined,
    });

    message.success('登录成功');
    router.push('/');
  } catch (error: any) {
    console.error('登录失败:', error);
    message.error(error?.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
@import './index.less';
</style>
