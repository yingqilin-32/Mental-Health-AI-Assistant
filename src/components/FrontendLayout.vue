<template>
    <div class="frontend-layout">

        <div class="navbar-container">
            <div class="brand-section">
                <el-image :src="logoSrc" style="width: 50px; height: 50px;" />
                <h1 class="brand-name">Mental Health AI Assistant</h1>

                <div class="nav-section">
                    <router-link to="/" class="nav-link">Home</router-link>
                    <router-link to="/consultation" class="nav-link" v-if="isLoggedIn">AI Consultation</router-link>
                    <router-link to="/emotion-diary" class="nav-link"  v-if="isLoggedIn">Mood Journal</router-link>
                     <router-link to="/knowledge" class="nav-link">Knowledge Resource</router-link>
                    <el-button v-if="isLoggedIn" class="logout-button" @click="handleLogout">Logout</el-button>
                    <div v-else class="auth-buttons">
                        <router-link to="/auth/login" class="login-button">Login</router-link>
                        <router-link to="/auth/register" class="register-button">Register</router-link>
                    </div>

                </div>
            </div>

        </div>
        <div class="main-container">
            <router-view />
        </div>

        <div class="footer-container">
            <div>
                <p>&copy; 2026 Mental Health AI Assistant</p>
            </div>

        </div>

    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import {logout} from '@/api/admin';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);
const logoSrc = new URL('../assets/images/Robot.png', import.meta.url).href;

onMounted(() => {
    isLoggedIn.value = localStorage.getItem('token') !== null;
})

const handleLogout = () => {
    logout().then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        isLoggedIn.value = false;
        router.push('/auth/login');
    }).catch((error) => {
        console.error('Logout failed:', error);
    });
}

</script>


<style lang="scss" scoped>
.frontend-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.navbar-container {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 70px;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .brand-section {
        max-width: 1200px;
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 24px;

        .brand-name {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            white-space: nowrap;
        }

        .nav-section {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 24px;

            .nav-link {
                text-decoration: none;
                color: #606266;
                font-size: 15px;
                transition: color 0.2s;

                &:hover,
                &.router-link-active {
                    color: #3d8a7a;
                    font-weight: 500;
                }
            }

            .auth-buttons {
                display: flex;
                align-items: center;
                gap: 10px;

                .login-button {
                    text-decoration: none;
                    color: #3d8a7a;
                    font-size: 15px;
                    font-weight: 500;
                    padding: 6px 16px;
                    border: 1px solid #3d8a7a;
                    border-radius: 6px;
                    transition: all 0.2s;

                    &:hover {
                        background-color: #3d8a7a;
                        color: white;
                    }
                }

                .register-button {
                    text-decoration: none;
                    color: white;
                    font-size: 15px;
                    font-weight: 500;
                    padding: 6px 16px;
                    background-color: #3d8a7a;
                    border: 1px solid #3d8a7a;
                    border-radius: 6px;
                    transition: all 0.2s;

                    &:hover {
                        background-color: #2e6b5e;
                        border-color: #2e6b5e;
                    }
                }
            }
        }
    }
}

.main-container {
    flex: 1;
}

.footer-container {
    height: 60px;
    background-color: #2c3e50;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
}
</style>
