
<template>
    <div class="login-container">
        <div class="title">
            <div class="home-link">
                <el-icon><Back /></el-icon>
                <span>Back to Home</span>
            </div>
            <div class="title-text">
                <h2>Login your account</h2>
                <p>
                    Input your username and password to access your account
                </p>
            </div>
        </div>
        <div class="form-container">
            <el-form
                :model="formData"
                ref="formEl"
                :rules="formRules"
                label-position="top">
                <el-form-item label="Username or Email" prop="username">
                    <el-input v-model="formData.username" size="large" placeholder="Please input username" />
                </el-form-item>
                <el-form-item label="Password" prop="password">
                    <el-input v-model="formData.password" size="large" placeholder="Please input password" type="password" show-password />
                </el-form-item>
                <div class="form-footer">
                    <el-form-item>
                    <el-button class="login-button" size="large" type="primary" @click="handleLogin(formEl)">Login</el-button>
                    <p>
                        Don't have an account? 
                        <router-link to="/auth/register" style="color: #3b82f6;">Register now!</router-link>
                    </p>
                </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { login } from '@/api/admin';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { Back } from '@element-plus/icons-vue';

const router = useRouter();

const formData = reactive({
    username: '',
    password: ''
});

const formRules = reactive({
    username: [
        { required: true, message: 'Please input username', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Please input password', trigger: 'blur' }
    ]
});

const formEl = ref();

// Handle login logic
const handleLogin = async (formEl) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            login(formData).then(data => {
                // infer the existence of token to determine login success
                if(!data.data?.token) {
                    ElMessage.error('Login failed, please check your username and password');
                    return
                }
                // save token to local storage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.data.userInfo));
                // redirect according to the role of the user
                if (data.data.userInfo?.userType == 2) {
                    ElMessage.success('Login successful, welcome back admin!');
                    router.push('/back/dashboard');
                } else if (data.data.userInfo?.userType == 1) {
                    ElMessage.success('Login successful!');
                    router.push('/');
                } else {
                    ElMessage.error('Unknown user role, please contact admin.');
                }
            }
            );
        }
    });
};

</script>

<style scoped lang="scss">
    .login-container {
        width:384px;
        .title{
            .home-link{
                margin-bottom: 60px;
            }
        }
        .title-text{
            text-align: center;
            h2{
                font-size: 36px;
                margin-bottom: 10px;
            }
            p{
                font-size: 12px;
                color: #6b7280;
            }
        }
        .form-container{
            margin-top: 20px;
            .form-footer{
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 10px;
                p{
                    margin-left: 10px;
                    font-size: 12px;
                    color: #6b7280;
                }

                .login-button{
                    margin-top: 20px;
                    width: 100%;
                }
            }
                
        }
    }
</style>
