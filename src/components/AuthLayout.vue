<template>
    <div class="auth-layout">
        <div class="left-section">
            <div class="content">
                <h1 class="title">Psychological AI Assistant</h1>
                <p class="description">Your personal mental health companion powered by artificial intelligence.</p>
                <div class="robot-image">
                    <el-image :src="authImageSrc" alt="Auth Image" style="width: 90px; height: 90px;" />
                </div>
            </div>
        </div>
        <div class="right-section">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>


//dynamic import image
const authImageSrc = new URL('@/assets/images/robot-fill.png', import.meta.url).href;

</script>

<style lang="scss" scoped>
    .auth-layout {
        display: flex;
        .left-section {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            background: linear-gradient(90deg, rgb(74,156,140) 0%, rgb(61,138,122) 100%);
            height: 100vh;
            .content{
                align-items: center;
                justify-content: center;
                flex-direction: column;
                display: flex;
            }
            .title {
                margin-bottom: 20px;
                font-size: 40px;
                font-weight: bold;
                color: #fff;
            }

            .description {
                font-size: 20px;
                width: 460px;
                text-align: center;
                color: #fff;
            }
            .robot-image {
                margin-top: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 160px;
                height: 160px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: linear-gradient(135deg,rgba(255,255,255,0.15)0%,rgba(255,255,255,0.05)100%);
                box-shadow: 0 1 5px 35px rgba(0, 0, 0, 0.1),inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
        }

        .right-section {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            height: 100vh;
            background-color: #fff;
            
        }
    }
</style>