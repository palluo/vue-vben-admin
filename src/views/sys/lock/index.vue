<template>
  <div class="lock-page">
    <div class="lock-page__entry">
      <div class="lock-page__header">
        <img src="../../../assets/images/header.jpg" class="lock-page__header-img" />
        <p class="lock-page__header-name">{{ realName }}</p>
      </div>
      <BasicForm @register="register" v-if="!getIsNotPwd" />
      <Alert v-if="errMsgRef" type="error" :message="t('sys.lock.alert')" banner />
      <div class="lock-page__footer">
        <a-button type="default" class="mt-2 mr-2" @click="goLogin" v-if="!getIsNotPwd">
          {{ t('sys.lock.backToLogin') }}
        </a-button>
        <a-button type="primary" class="mt-2" @click="unLock(!getIsNotPwd)" :loading="loadingRef">
          {{ t('sys.lock.entry') }}
        </a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { Alert } from 'ant-design-vue';

  import { BasicForm, useForm } from '/@/components/Form';

  import { userStore } from '/@/store/modules/user';
  import { appStore } from '/@/store/modules/app';

  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'LockPage',
    components: { Alert, BasicForm },

    setup() {
      const loadingRef = ref(false);
      const errMsgRef = ref(false);

      const { t } = useI18n();
      const [register, { validateFields }] = useForm({
        showActionButtonGroup: false,
        schemas: [
          {
            field: 'password',
            label: '',
            component: 'InputPassword',
            componentProps: {
              style: { width: '100%' },
              placeholder: t('sys.lock.placeholder'),
            },
            rules: [{ required: true }],
          },
        ],
      });
      const realName = computed(() => {
        const { realName } = userStore.getUserInfoState || {};
        return realName;
      });

      const getIsNotPwd = computed(() => {
        if (!appStore.getLockInfo) {
          return true;
        }
        return appStore.getLockInfo.pwd === undefined;
      });

      /**
       * @description: unLock
       */
      async function unLock(valid = true) {
        let password = '';
        if (valid) {
          try {
            const values = (await validateFields()) as any;
            password = values.password;
          } catch (error) {
            return;
          }
        }
        try {
          loadingRef.value = true;
          const res = await appStore.unLockAction({ password, valid });
          errMsgRef.value = !res;
        } finally {
          loadingRef.value = false;
        }
      }

      function goLogin() {
        userStore.loginOut(true);
        appStore.resetLockInfo();
      }

      return {
        register,
        getIsNotPwd,
        goLogin,
        realName,
        unLock,
        errMsgRef,
        loadingRef,
        t,
      };
    },
  });
</script>
<style lang="less" scoped>
  @import (reference) '../../../design/index.less';

  .lock-page {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999999;
    display: flex;
    width: 100vw;
    height: 100vh;
    background: url(../../../assets/images/lock-page.jpg) no-repeat;
    background-size: 100% 100%;
    align-items: center;
    justify-content: flex-end;

    &__entry {
      position: relative;
      width: 400px;
      // height: 260px;
      padding: 80px 50px 50px 50px;
      margin-right: 50px;
      background: #fff;
      border-radius: 6px;
    }

    &__header {
      position: absolute;
      top: -35px;
      left: calc(50% - 45px);
      width: auto;
      text-align: center;

      &-img {
        width: 70px;
        border-radius: 50%;
      }

      &-name {
        margin-top: 5px;
      }
    }

    &__footer {
      text-align: center;
    }
  }
</style>
