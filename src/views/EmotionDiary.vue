<template>
    <div class="emotion-diary-page">
        <section class="diary-hero">
            <div class="hero-inner">
                <span class="hero-icon">♥</span>
                <h1>Emotion Diary</h1>
            </div>
        </section>

        <main class="diary-content">
            <section class="diary-card score-card">
                <h2>Today's Mood Score</h2>
                <p>How would you rate your overall emotional state today? (1-10)</p>
                <div class="score-row">
                    <el-rate
                        v-model="DairyForm.moodScore"
                        :max="10"
                        :colors="['#f3c64e', '#f3c64e', '#f3c64e']"
                        size="large"
                    />
                    <span class="score-text">{{ scoreLabel }}</span>
                </div>
            </section>

            <section class="diary-card">
                <h2>Main Emotion</h2>
                <div class="mood-grid">
                    <button
                        v-for="mood in moods"
                        :key="mood.value"
                        class="mood-option"
                        :class="{ active: DairyForm.dominantEmotion === mood.value }"
                        type="button"
                        @click="DairyForm.dominantEmotion = mood.value"
                    >
                        <el-image
                            class="mood-icon"
                            :src="mood.iconUrl"
                            :alt="`${mood.label} icon`"
                            fit="contain"
                        />
                        <span>{{ mood.label }}</span>
                    </button>
                </div>
            </section>

            <section class="diary-card details-card">
                <h2>Detailed Record</h2>

                <el-form :model="DairyForm" label-position="top">
                    <el-form-item label="Record Date">
                        <el-date-picker
                            v-model="DairyForm.diaryDate"
                            type="date"
                            value-format="YYYY-MM-DD"
                            placeholder="Select a date"
                        />
                    </el-form-item>

                    <el-form-item label="Emotional Triggers">
                        <el-input
                            v-model="DairyForm.emotionTriggers"
                            type="textarea"
                            :rows="3"
                            maxlength="1000"
                            show-word-limit
                            placeholder="What affected your emotions today?"
                        />
                    </el-form-item>

                    <el-form-item label="Today's Reflection">
                        <el-input
                            v-model="DairyForm.diaryContent"
                            type="textarea"
                            :rows="5"
                            maxlength="2000"
                            show-word-limit
                            placeholder="Write down your thoughts, feelings, or anything meaningful from today..."
                        />
                    </el-form-item>

                    <div class="select-row">
                        <el-form-item label="Sleep Quality">
                            <el-select v-model="DairyForm.sleepQuality" placeholder="Please select">
                                <el-option
                                    v-for="option in sleepOptions"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value"
                                />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Stress Level">
                            <el-select v-model="DairyForm.stressLevel" placeholder="Please select">
                                <el-option
                                    v-for="option in stressOptions"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value"
                                />
                            </el-select>
                        </el-form-item>
                    </div>

                    <div class="form-actions">
                        <el-button @click="handleReset">Reset</el-button>
                        <el-button type="primary" @click="handleSubmit">Submit Record</el-button>
                    </div>
                </el-form>
            </section>
        </main>
    </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import {addEmotionDiary} from '../api/frontend.js'
const getToday = () => new Date().toISOString().slice(0, 10);

const DairyForm = reactive({
    diaryDate: getToday(),
    moodScore: null,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null,

});

const iconUrls = {
    happy: new URL('@/assets/images/happy.png', import.meta.url).href,
    calm: new URL('@/assets/images/calm.png', import.meta.url).href,
    anxious: new URL('@/assets/images/nervous.png', import.meta.url).href,
    sad: new URL('@/assets/images/sad.png', import.meta.url).href,
    excited: new URL('@/assets/images/exciting.png', import.meta.url).href,
    tired: new URL('@/assets/images/exhausted.png', import.meta.url).href,
    surprised: new URL('@/assets/images/suprised.png', import.meta.url).href,
    confused: new URL('@/assets/images/confused.png', import.meta.url).href,
};

const moods = [
    { label: 'Happy', value: 'happy', iconUrl: iconUrls.happy },
    { label: 'Calm', value: 'calm', iconUrl: iconUrls.calm },
    { label: 'Anxious', value: 'anxious', iconUrl: iconUrls.anxious },
    { label: 'Sad', value: 'sad', iconUrl: iconUrls.sad },
    { label: 'Excited', value: 'excited', iconUrl: iconUrls.excited },
    { label: 'Tired', value: 'tired', iconUrl: iconUrls.tired },
    { label: 'Surprised', value: 'surprised', iconUrl: iconUrls.surprised },
    { label: 'Confused', value: 'confused', iconUrl: iconUrls.confused },
];

const sleepOptions = [
    { label: 'Excellent', value: 5 },
    { label: 'Good', value: 4 },
    { label: 'Fair', value: 3 },
    { label: 'Poor', value: 2 },
    { label: 'Very Poor', value: 1 },
];
const stressOptions = [
    { label: 'Very Low', value: 1 },
    { label: 'Low', value: 2 },
    { label: 'Moderate', value: 3 },
    { label: 'High', value: 4 },
    { label: 'Very High', value: 5 },
];

const scoreLabel = computed(() => {
    if (!DairyForm.moodScore) return 'Not rated';
    if (DairyForm.moodScore <= 2) return 'Very Unpleasant';
    if (DairyForm.moodScore <= 4) return 'Low Mood';
    if (DairyForm.moodScore <= 6) return 'Neutral';
    if (DairyForm.moodScore <= 8) return 'Feeling Good';
    return 'Very Positive';
});

const handleReset = () => {
    Object.assign(DairyForm, {
        diaryDate: getToday(),
        moodScore: null,
        dominantEmotion: '',
        emotionTriggers: '',
        diaryContent: '',
        sleepQuality: null,
        stressLevel: null,
    });
};

const handleSubmit = () => {
    if (!DairyForm.moodScore || !DairyForm.dominantEmotion || !DairyForm.diaryContent) {
        ElMessage.warning('Please complete the mood score, main emotion, and reflection.');
        return;
    }

    // This object now matches the backend diary DTO field names.
    const payload = { ...DairyForm };
    // console.log('Emotion diary payload:', payload);
    addEmotionDiary(payload).then(() => {
        ElMessage.success('Mood record is ready to submit');
        handleReset();
    });
};
</script>

<style lang="scss" scoped>
.emotion-diary-page {
    min-height: 100%;
    background: #f6fbfd;
    color: #2d3748;
}

.diary-hero {
    height: 150px;
    background: linear-gradient(110deg, #89d43f 0%, #b7cd3c 45%, #f1ae36 100%);
    display: flex;
    align-items: center;
}

.hero-inner {
    width: min(1280px, calc(100% - 80px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 18px;

    h1 {
        margin: 0;
        color: #fff;
        font-size: 32px;
        font-weight: 800;
        line-height: 1;
    }
}

.hero-icon {
    color: #fff;
    font-size: 64px;
    line-height: 1;
}

.diary-content {
    width: min(1120px, calc(100% - 48px));
    margin: 24px auto 42px;
}

.diary-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(31, 41, 55, 0.08);
    padding: 28px 26px;

    & + & {
        margin-top: 26px;
    }

    h2 {
        margin: 0 0 26px;
        color: #283142;
        font-size: 26px;
        font-weight: 800;
    }
}

.score-card {
    min-height: 175px;

    h2 {
        margin-bottom: 26px;
    }

    p {
        margin: 0 0 22px;
        color: #6b7280;
        font-size: 16px;
    }
}

.score-row {
    display: flex;
    align-items: center;
    gap: 14px;
}

.score-text {
    color: #2f3542;
    font-size: 15px;
}

.mood-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
}

.mood-option {
    height: 130px;
    border: 1px solid #dfe4e8;
    border-radius: 12px;
    background: #fcfdfd;
    color: #2d3748;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, background 0.2s;

    span:last-child {
        font-size: 16px;
    }

    &:hover,
    &.active {
        border-color: #62a8e5;
        background: #f8fbff;
        box-shadow: 0 8px 18px rgba(74, 144, 226, 0.14);
        transform: translateY(-1px);
    }
}

.mood-icon {
    width: 58px;
    height: 58px;
    display: block;
}

.details-card {
    padding-bottom: 24px;

    h2 {
        margin-bottom: 26px;
    }

    :deep(.el-form-item) {
        margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
        color: #344054;
        font-size: 16px;
        line-height: 1.2;
        margin-bottom: 10px;
    }

    :deep(.el-textarea__inner),
    :deep(.el-select__wrapper) {
        border-radius: 4px;
        box-shadow: 0 0 0 1px #d8dde3 inset;
    }

    :deep(.el-textarea__inner) {
        resize: vertical;
    }
}

.select-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 14px;
}

@media (max-width: 900px) {
    .diary-hero {
        height: 126px;
    }

    .hero-inner {
        width: min(100% - 32px, 1120px);

        h1 {
            font-size: 28px;
        }
    }

    .hero-icon {
        font-size: 52px;
    }

    .diary-content {
        width: min(100% - 28px, 1120px);
    }

    .mood-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 560px) {
    .diary-card {
        padding: 22px 18px;

        h2 {
            font-size: 22px;
        }
    }

    .score-row,
    .form-actions {
        align-items: flex-start;
        flex-direction: column;
    }

    .mood-grid,
    .select-row {
        grid-template-columns: 1fr;
    }
}
</style>
