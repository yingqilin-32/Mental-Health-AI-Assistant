
<template>
    <div class="register-container">
        <div class="title">
            <div class="title-text">
                <h2>Register your account</h2>
                <p>
                    Create a new account to get started
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
                    <el-input v-model="formData.username" size="large" placeholder="Please input username/email" />
                </el-form-item>

                <el-form-item label="Email" prop="email">
                    <el-input v-model="formData.email" size="large" placeholder="Please input email" />
                </el-form-item>

                <el-form-item label="Nickname" prop="nickname">
                    <el-input v-model="formData.nickname" size="large" placeholder="Please input nickname" />
                </el-form-item>

                <el-form-item label="Phonenumber" prop="phonenumber">
                    <el-input v-model="formData.phonenumber" size="large" placeholder="Please input phone number" />
                </el-form-item>

                <el-form-item label="Password" prop="password">
                    <el-input v-model="formData.password" size="large" placeholder="Please input password" type="password" show-password />
                </el-form-item>

                 <el-form-item label="Confirm Password" prop="confirmPassword">
                    <el-input v-model="formData.confirmPassword" size="large" placeholder="Please confirm password" type="password" show-password />
                </el-form-item>
                <div class="form-footer">
                    <el-form-item>
                    <el-button class="login-button" size="large" type="primary" @click="handleRegister(formEl)">Register</el-button>
                    <p>
                        Already have an account?
                        <router-link to="/auth/login" style="color: #3b82f6;">Login now!</router-link>
                    </p>
                </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { register } from '@/api/frontend';
import { useRouter } from 'vue-router';

const router = useRouter();
const formEl = ref();

const formData = reactive({
    username: '',
    email: '',
    nickname: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
    gender: 0, // default to 0 (unknown)
    userType: 1
});

const validateConfirmPassword = (rule, value, callback) => {
    if (value !== formData.password) {
        callback(new Error('Passwords do not match'));
    } else {
        callback();
    }
};

const formRules = reactive({
    username: [
        { required: true, message: 'Please input username', trigger: 'blur' }
    ],
    email: [
        { required: true, message: 'Please input email', trigger: 'blur' },
        { type: 'email', message: 'Please input a valid email', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Please input password', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: 'Please confirm password', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
});



const handleRegister = async (formEl) => {
    if (!formEl) return; //deducted from the fact that formEl is not properly bound to the template
    await formEl.validate(async(valid) => {
        register(formData).then((data) => {
            ElMessage.success('Registration successful! Please login.');
            router.push('/auth/login');
        }).catch((error) => {
            ElMessage.error(error.response?.data?.message || 'Registration failed');
        });
        
    })
};
</script>

<style lang="scss" scoped>
.register-container {
    width: 384px;

    .title {
        .title-text {
            text-align: center;
            h2 {
                font-size: 36px;
                margin-bottom: 10px;
            }
            p {
                font-size: 12px;
                color: #6b7280;
            }
        }
    }

    .form-container {
        margin-top: 20px;

        .form-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 10px;

            p {
                margin-left: 10px;
                font-size: 12px;
                color: #6b7280;
            }

            .login-button {
                margin-top: 20px;
                width: 100%;
            }
        }
    }
}
</style>