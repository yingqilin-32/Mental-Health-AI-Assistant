
<template>
    <div class="navbar">
        <div class="flex-box">
            <el-button @click="toggleCollapse" style="height: 30px; width: 20px;">
                <el-icon><Expand /></el-icon>
            </el-button>
            <p class="page-title">{{ route.meta.title }}</p>
        </div>
        <div class="flex-box">
            <el-dropdown @command="handleCommand">
                <div class="flex-box">
                    <el-avatar :src="avatarPath" />
                    <p class="user-name">admin</p>
                    <el-icon><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="logout" @click="handleLogout">Logout</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
import { Expand } from '@element-plus/icons-vue';
import avatarPath from '@/assets/images/avatar.jpg';
import {useRouter, useRoute} from 'vue-router';
import {ElMessage, ElMessageBox} from 'element-plus';
import {logout} from '@/api/admin';

const router = useRouter();
const route = useRoute();

import {useAdminStore} from '@/stores/admin';
const adminStore = useAdminStore();

const toggleCollapse = () => {
    adminStore.toggleCollapse();
};

const handleCommand = (command) => {
    console.log(command)
}

const handleLogout = () => {
    ElMessageBox.confirm('Are you sure you want to logout?', 'Confirm Logout', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    }).then(() => {
        logout().then(() => {
            router.push('/login');
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            router.push('/auth/login');
        });
        ElMessage({
            type: 'success',
            message: 'Logged out successfully!',
        });
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: 'Logout cancelled',
        });
    });
};
</script>



<style lang="scss" scoped>
    .navbar {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px;
        background-color: white;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid #e5e7eb;

        .page-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-left: 10px;
            margin-bottom: 5px;
        }
        .flex-box{
            display: flex;
            align-items: center;
            justify-self: center;
        }
    }
</style>

