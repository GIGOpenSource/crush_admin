<template>
  <div class="login-wrapper">
    <LoginHeader />
    <div class="login-container">
      <div class="title-container">
        <h1 class="title margin-no">欢迎登录</h1>
        <h1 class="title">知了小程序管理后台</h1>
      </div>
      <div class="item-container">
        <a-form
          :model="formState"
          :rules="rules"
          @finish="handleSubmit"
          class="login-form"
          layout="vertical"
        >
          <a-form-item name="username">
            <a-input
              v-model:value="formState.username"
              size="large"
              placeholder="请输入用户名"
              :prefix-hoverable="false"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <a-input-password
              v-model:value="formState.password"
              size="large"
              placeholder="请输入密码"
              :prefix-hoverable="false"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="check-container remember-pwd">
            <a-checkbox>记住密码</a-checkbox>
          </div>
          <a-form-item class="btn-container">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              block
            >
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
// import { message } from 'ant-design-vue';
import { useUserStore } from '@/store/modules/user';
// import { loginApi } from '@/api/auth';
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
  // 临时设置 token 以通过路由守卫检查
  userStore.setToken('temp-token');
  
  // 单纯跳转
  router.push('/');
  
  // 登录请求相关代码已注释
  // try {
  //   loading.value = true;
  //   const response = await loginApi({
  //     username: formState.username,
  //     password: formState.password,
  //   });
  //   
  //   // 保存 token 和用户信息
  //   userStore.setToken(response.token);
  //   userStore.setUserInfo(response.userInfo);
  //   
  //   message.success('登录成功');
  //   
  //   // 跳转到首页
  //   
  // } catch (error: any) {
  //   message.error(error?.message || '登录失败，请检查用户名和密码');
  // } finally {
  //   loading.value = false;
  // }
};
</script>

<style lang="less" scoped>
@import './index.less';
</style>
