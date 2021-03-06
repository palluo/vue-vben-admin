import './index.less';

import type { FunctionalComponent } from 'vue';

import { defineComponent, unref, computed, ref, nextTick } from 'vue';

import { Layout, Tooltip, Badge } from 'ant-design-vue';
import { AppLogo } from '/@/components/Application';
import UserDropdown from './UserDropdown';
import LayoutMenu from '../menu';
import LayoutBreadcrumb from './LayoutBreadcrumb';
import LockAction from '../lock/LockAction';
import LayoutTrigger from '../LayoutTrigger';
import NoticeAction from './notice/NoticeActionItem.vue';
import {
  RedoOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LockOutlined,
  BugOutlined,
} from '@ant-design/icons-vue';
import { useModal } from '/@/components/Modal';

import { useFullscreen } from '/@/hooks/web/useFullScreen';
import { useTabs } from '/@/hooks/web/useTabs';
import { useWindowSizeFn } from '/@/hooks/event/useWindowSizeFn';
import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';

import { useRouter } from 'vue-router';

import { errorStore } from '/@/store/modules/error';

import { PageEnum } from '/@/enums/pageEnum';
import { MenuModeEnum, MenuSplitTyeEnum } from '/@/enums/menuEnum';
import { Component } from '/@/components/types';

interface TooltipItemProps {
  title: string;
}

const TooltipItem: FunctionalComponent<TooltipItemProps> = (props, { slots }) => {
  return (
    <Tooltip>
      {{
        title: () => props.title,
        default: () => slots.default?.(),
      }}
    </Tooltip>
  );
};

export default defineComponent({
  name: 'LayoutHeader',
  props: {
    fixed: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    let logoEl: Element | null;

    const logoWidthRef = ref(200);
    const logoRef = ref<any>(null);
    const { refreshPage } = useTabs();

    const { getShowTopMenu, getShowHeaderTrigger, getSplit, getTopMenuAlign } = useMenuSetting();

    const { getUseErrorHandle, getShowBreadCrumbIcon } = useRootSetting();

    const {
      getHeaderTheme,
      getShowRedo,
      getUseLockPage,
      getShowFullScreen,
      getShowNotice,
      getShowContent,
      getShowBread,
      getShowHeaderLogo,
    } = useHeaderSetting();

    const { push } = useRouter();
    const [register, { openModal }] = useModal();
    const { toggleFullscreen, isFullscreenRef } = useFullscreen();

    useWindowSizeFn(
      () => {
        nextTick(() => {
          if (!unref(getShowTopMenu)) return;
          let width = 0;
          if (!logoEl) {
            logoEl = logoRef.value.$el;
          } else {
            width += logoEl.clientWidth;
          }
          logoWidthRef.value = width + 80;
        });
      },
      200,
      { immediate: true }
    );

    const headerClass = computed(() => {
      const theme = unref(getHeaderTheme);
      return theme ? `layout-header__header--${theme}` : '';
    });

    const getSplitType = computed(() => {
      return unref(getSplit) ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE;
    });

    const getMenuMode = computed(() => {
      return unref(getSplit) ? MenuModeEnum.HORIZONTAL : null;
    });

    function handleToErrorList() {
      push(PageEnum.ERROR_LOG_PAGE).then(() => {
        errorStore.commitErrorListCountState(0);
      });
    }

    function handleLockPage() {
      openModal(true);
    }

    function renderHeaderContent() {
      const width = unref(logoWidthRef);
      return (
        <div class="layout-header__content ">
          {unref(getShowHeaderLogo) && (
            <AppLogo class={`layout-header__logo`} ref={logoRef} theme={unref(getHeaderTheme)} />
          )}

          {unref(getShowContent) && (
            <div class="layout-header__left">
              {unref(getShowHeaderTrigger) && (
                <LayoutTrigger theme={unref(getHeaderTheme)} sider={false} />
              )}
              {unref(getShowBread) && <LayoutBreadcrumb showIcon={unref(getShowBreadCrumbIcon)} />}
            </div>
          )}

          {unref(getShowTopMenu) && (
            <div class={[`layout-header__menu `]} style={{ width: `calc(100% - ${width}px)` }}>
              <LayoutMenu
                isHorizontal={true}
                class={`justify-${unref(getTopMenuAlign)}`}
                theme={unref(getHeaderTheme)}
                splitType={unref(getSplitType)}
                menuMode={unref(getMenuMode)}
                showSearch={false}
              />
            </div>
          )}
        </div>
      );
    }

    function renderActionDefault(Comp: Component | any, event: Fn) {
      return (
        <div class={`layout-header__action-item`} onClick={event}>
          <Comp class={`layout-header__action-icon`} />
        </div>
      );
    }

    function renderAction() {
      return (
        <div class={`layout-header__action`}>
          {unref(getUseErrorHandle) && (
            <TooltipItem title="错误日志">
              {() => (
                <Badge
                  count={errorStore.getErrorListCountState}
                  offset={[0, 10]}
                  dot
                  overflowCount={99}
                >
                  {() => renderActionDefault(BugOutlined, handleToErrorList)}
                </Badge>
              )}
            </TooltipItem>
          )}

          {unref(getUseLockPage) && (
            <TooltipItem title="锁定屏幕">
              {() => renderActionDefault(LockOutlined, handleLockPage)}
            </TooltipItem>
          )}

          {unref(getShowNotice) && (
            <TooltipItem title="消息通知">{() => <NoticeAction />}</TooltipItem>
          )}

          {unref(getShowRedo) && (
            <TooltipItem title="刷新">
              {() => renderActionDefault(RedoOutlined, refreshPage)}
            </TooltipItem>
          )}

          {unref(getShowFullScreen) && (
            <TooltipItem title={unref(isFullscreenRef) ? '退出全屏' : '全屏'}>
              {() => {
                const Icon = !unref(isFullscreenRef) ? (
                  <FullscreenOutlined />
                ) : (
                  <FullscreenExitOutlined />
                );
                return renderActionDefault(Icon, toggleFullscreen);
              }}
            </TooltipItem>
          )}
          <UserDropdown class={`layout-header__user-dropdown`} />
        </div>
      );
    }

    function renderHeaderDefault() {
      return (
        <>
          {renderHeaderContent()}
          {renderAction()}
          <LockAction onRegister={register} />
        </>
      );
    }

    return () => {
      return (
        <Layout.Header
          class={['layout-header', 'flex p-0 px-4 ', unref(headerClass), { fixed: props.fixed }]}
        >
          {() => renderHeaderDefault()}
        </Layout.Header>
      );
    };
  },
});
