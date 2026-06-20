<template>
    <el-aside :width="isCollapsed ? '64px' : '264px'" class="sidebar">
        <el-menu
        :collapse="isCollapsed"
        :collapse-transition="false"
        default-active="2"
        class="menu-style"
      >
      <div class="brand">
        <el-image style="width: 35px; height: 35px;" :src="logoPath" alt="logo" />
          <div v-show="!isCollapsed" class="info-card">
            <h1 class="brand-title">AI assistant</h1>
            <p class="brand-subtitle">Management backend</p>
          </div>
      </div>
        <el-menu-item @click="selectMenu" v-for="item in router.options.routes[0].children" :key="item.path" :index="item.path">
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <span>{{ item.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
</template>

<script setup>
    import { useRouter } from 'vue-router';
    import logoPath from '@/assets/images/Robot.png';
    import { storeToRefs } from 'pinia';
    import {useAdminStore} from '@/stores/admin';
    import { computed } from 'vue';

    const isCollapsed = computed(() =>
        useAdminStore().isCollapsed
      );

    const router = useRouter();
    const selectMenu = (key) => { 
      const currentRoute = router.options.routes[0];
      // console.log(`${currentRoute.path}/${key.index}`)
      // jump to the route corresponding to the menu item
      router.push(`${currentRoute.path}/${key.index}`);
      };
</script>


<style lang="scss" scoped>

.menu-style {
    height: 100%;
    .brand {
        display: flex;
        align-items: center;
        justify-self: center;
        padding: 10px;
        background-color: #fff;
        border-bottom: 1px solid #e5e7eb;

        .info-card {
            .brand-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #1f2937;
                margin-left: 10px;
            }
        }

        .brand-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-left: 10px;
        }
    }
  }
</style>
