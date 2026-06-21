<template>
    <div class="home-container">
        <div class="content">
            <div class="text">
                <h2 class="title">
                    A warm conversation<br />
                    <span class="highlight-text">turning loneliness into comfort</span>
                </h2>
                <p class="discription">Every late night, every moment of anxiety, we are here. You don't have to face it alone. Let the connection between hearts bring warmth to every day of your life.</p>
                <div class="hero-actions">
                    <el-button class="btn-solid" size="large" @click="$router.push('/consultation')">Speak your heart</el-button>
                    <el-button class="btn-outline" size="large" @click="$router.push('/emotion-diary')">Record mood</el-button>
                </div>
            </div>
            <div class="robot">
                <el-image style="width:150px; height:150px;" :src="iconURL" alt="Robot" class="robot-image" />
            </div>
        </div>
        
    </div>
</template>

<script setup>

 const iconURL = new URL('../assets/images/robot-fill.png', import.meta.url).href;

</script>

<style lang="scss" scoped>
.home-container {
    background: linear-gradient(90deg, rgb(74,156,140) 0%, rgb(61,138,122) 100%);
    color:white;
    padding: 5rem 0;
    height: calc(100vh - 285px);
    display: flex;
    align-items: center;
    justify-content: center;
    .content {
        display: flex;
        justify-content: center;
        align-items: center;
        gap:30px;
        .text{
            width: 500px;
            .title{
                font-size:45px;
                font-weight: bold;
                line-height: 1.2;
                margin-bottom: 15px;
            }
            .highlight-text{
                color:#ffd700;
            
            }
            .hero-actions{
                display: flex;
                flex-direction: row;
                gap: 15px;
                .btn-solid {
                    background-color: white;
                    color: #2c3e50;
                    border: 2px solid white;
                    font-weight: 500;
                    transition: all 0.25s ease;
                    &:hover {
                        background-color: transparent;
                        color: white;
                    }
                }
                .btn-outline {
                    background-color: transparent;
                    color: white;
                    border: 2px solid white;
                    font-weight: 500;
                    transition: all 0.25s ease;
                    &:hover {
                        background-color: white;
                        color: #2c3e50;
                    }
                }
            }
             .discription{
                font-size:18px;
                line-height: 1.5;
                margin-bottom: 30px;
            }
        }
        .robot{
            display: flex;
            justify-content: center;
            align-items: center;
            width:260px;
            height:260px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
            box-shadow:0 15px 35px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.3);
        }
    }
}

</style>