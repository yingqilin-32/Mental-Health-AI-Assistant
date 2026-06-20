<template>
    <div>
        <page-head title="Journal"></page-head>
        <TableSearch :form-data="searchForm" @search="handleSearch" />
        <el-table :data="tableData" style="width: 100%; margin-top: 25px;">
            <el-table-column label="ID" prop="id" width="80" />
            <el-table-column label="User ID" prop="userId" width="100">
                <template #default="scope">
                    <el-avatar>
                        {{ scope.row.nickname }}
                    </el-avatar>
                </template>
            </el-table-column>
            <el-table-column label="Record Date" prop="diaryDate" width="200" />
            <el-table-column label="Mood Score" width="200">
                <template #default="scope">
                    <el-rate :model-value="scope.row.moodScore" disabled :max="10" />
                </template>
            </el-table-column>
            <el-table-column label="Living standards">
                <template #default="scope">
                    <p>Sleep Quality: {{ scope.row.sleepQuality }}/5</p>
                    <p>Stress Level: {{ scope.row.stressLevel }}/5</p>
                </template>
            </el-table-column>
            <el-table-column label="Emotional triggers" prop="emotionTriggers" />
            <el-table-column label="Diary Content" prop="dairyContent" />
            <el-table-column label="Operations" width="200">
                <template #default="scope">
                    <el-button @click="handleCheck(scope.row)" text type="primary" size="small">Details</el-button>
                    <el-button @click="handleDelete(scope.row)" text type="danger" size="small">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination :page-size="pagination.size" layout="prev, pager, next" :total="pagination.total"
            @change="handleChange" style="margin-top: 20px;" />
        <el-dialog v-model="ShowDetailDialog" title="Journal Details" width="800px" :close-on-click-modal="false">
            <div v-if="currentDetail">
                <div class="detail-section">
                    <h4>User Information</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="User Name">{{ currentDetail.username }}</el-descriptions-item>
                        <el-descriptions-item label="User ID">{{ currentDetail.userId }}</el-descriptions-item>
                        <el-descriptions-item label="Nickname">{{ currentDetail.nickname }}</el-descriptions-item>
                        <el-descriptions-item label="Record Date">{{ currentDetail.diaryDate }}</el-descriptions-item>
                    </el-descriptions>
                </div>

                <div class="detail-section">
                    <h4>Mood Situation</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="Mood Score">
                            <el-rate :model-value="currentDetail.moodScore" show-score disabled :max="10" />
                        </el-descriptions-item>
                        <el-descriptions-item label="Dominant Emotion">
                            <template #default>
                                <el-tag :type="getEmotionTagType(currentDetail.dominantEmotion)" effect="light">{{
                                    currentDetail.dominantEmotion || 'Unknown' }}</el-tag>
                            </template>
                        </el-descriptions-item>
                        <el-descriptions-item label="Sleep Quality">{{ currentDetail.sleepQuality ||
                            'Unknown' }}/5</el-descriptions-item>
                        <el-descriptions-item label="Stress Level">{{ currentDetail.stressLevel || 'Unknown'
                        }}/5</el-descriptions-item>
                    </el-descriptions>
                </div>

                <div class="detail-section">
                    <h4>Diary Content</h4>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="Emotion Triggers">{{ currentDetail.emotionTriggers
                        }}</el-descriptions-item>
                        <el-descriptions-item label="Diary Content">{{ currentDetail.diaryContent
                        }}</el-descriptions-item>
                    </el-descriptions>
                </div>

                <div v-if="currentDetail.hasAiEmotionAnalysis" class="detail-section">
                    <h4>AI Analysis Result</h4>
                    <div class="ai-analysis-result">
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="Dominant Emotion">
                                <template #default>
                                    <el-tag :type="getAiEmotionTagType(aiData.primaryEmotion)" effect="light">{{
                                        aiData.primaryEmotion }}</el-tag>
                                </template>
                            </el-descriptions-item>

                            <el-descriptions-item label="Emotion Intensity">
                                <template #default>
                                    <el-progress :percentage="aiData.emotionScore"
                                        :color="getEmotionScoreColor(aiData.emotionScore)" :stroke-width="8" />
                                </template>
                            </el-descriptions-item>

                            <el-descriptions-item label="Risk Level">
                                <template #default>
                                    <el-tag :type="getRiskLevelTagType(aiData.riskLevel)" effect="light">{{
                                        aiData.riskLevel
                                        }}</el-tag>
                                </template>
                            </el-descriptions-item>

                            <el-descriptions-item label="Emotional nature">
                                <template #default>
                                    <el-tag :type="aiData.isNegative ? 'danger' : 'success'" effect="light">{{
                                        aiData.isNegative ? 'Negative' : 'Positive' }}</el-tag>
                                </template>
                            </el-descriptions-item>
                        </el-descriptions>
                        <div class="ai-suggestion-section">
                            <h5>
                                Professional suggestions:
                            </h5>
                            <div class="suggestion-content">
                                {{ aiData.suggestion || 'No suggestions available.' }}
                            </div>
                        </div>
                        <div class="ai-risk-section">
                            <h5 class="risk-content">
                                Risk description:
                            </h5>
                            <div class="suggestion-content">
                                {{ aiData.riskDescription || 'No risk description available.' }}
                            </div>
                        </div>
                        <div class="ai-improvement-section">
                            <h5>Improvement Suggestions</h5>
                            <ul class="improvement-list">
                                <li v-for="(item, index) in aiData.improvementSuggestions" :key="index">{{ item }}</li>
                            </ul>
                        </div>
                    </div>

                </div>
                <div class="detail-section">
                    <h4>Time Information</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="Create Time">{{ currentDetail.createdAt }}</el-descriptions-item>
                        <el-descriptions-item label="Update Time">{{ currentDetail.updatedAt }}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
            <template #footer>
                
                    <el-button @click="ShowDetailDialog = false">Close</el-button>
    
            </template>
        </el-dialog>
    </div>

</template>


<script setup>
import { ref, onMounted, reactive } from 'vue';
import pageHead from '../components/PageHead.vue';
import TableSearch from '../components/TableSearch.vue';
import { emotionList,deleteEmotionEntry } from '../api/admin';
import {ElMessageBox, ElMessage} from 'element-plus';

const searchForm = [
    // Define your search form data here
    {
        comp: 'el-input', prop: 'userId', label: 'User ID', placeholder: 'Enter user ID'
    },
    {
        comp: 'el-select', prop: 'moodScoreRange', label: 'Mood Score', placeholder: 'Please select score range',
        bind: {
            options: [
                { label: 'All', value: '' },
                { label: 'Low score (1-3)', value: '1-3' },
                { label: 'Medium score (4-6)', value: '4-6' },
                { label: 'High score (7-10)', value: '7-10' }
            ]
        }
    }
]

const tableData = ref([]);
const pagination = reactive({
    currentPage: 1,
    size: 10,
    total: 0
})


const handleSearch = async (formModel) => {
    const params = {
        ...formModel,
        ...pagination
    }
    await emotionList(params).then(res => {
        console.log(res, "emotionList");
        tableData.value = res.data.records;
        pagination.total = res.data.total;
    })
}

const handleChange = async (page) => {
    pagination.currentPage = page;
    await handleSearch({});
}

const currentDetail = ref(null);
const aiData = ref(null);
const handleCheck = (row) => {
    currentDetail.value = row;
    if (row.hasAiEmotionAnalysis) {
        aiData.value = JSON.parse(row.aiEmotionAnalysis)
    } else {
        aiData.value = null
    }
    ShowDetailDialog.value = true;
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        `Do you want to delete the journal on ${row.diaryDate}?`,
        'Delete confirmation',
        {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning',
        }
    ).then(() => {
        // Call delete API here with row.id
        deleteEmotionEntry(row.id).then(() => {
            ElMessage({
                type: 'success',
                message: 'Deleted successfully!',
            });
            // Refresh the table data after deletion
            handleSearch();
        });
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: 'Delete canceled',
        })
    });
}


// show detail dialog
const ShowDetailDialog = ref(false);

const getEmotionTagType = (emotion) => {
    const emotionTypes = {
        '快乐': 'success',
        '平静': 'info',
        '兴奋': 'warning',
        '愤怒': 'danger',
        '悲伤': 'info',
        '焦虑': 'warning',
    }
    return emotionTypes[emotion] || 'info'
}

const getAiEmotionTagType = (emotion) => {
    const emotionTagMap = {
        '快乐': 'success',
        '平静': 'success',
        '满足': 'success',
        '兴奋': 'warning',
        '愤怒': 'danger',
        '悲伤': 'info',
        '焦虑': 'warning',
        '恐惧': 'danger',
        '沮丧': 'info',
        '压力': 'warning',
    }
    return emotionTagMap[emotion] || 'info'
}

const getEmotionScoreColor = (score) => {
    if (score >= 80) return '#f56c6c'
    if (score >= 60) return '#e6a23c'
    if (score >= 40) return '#909399'
    return '#67c23a'
}

const getRiskLevelTagType = (riskLevel) => {
    const riskLevelMap = {
        0: 'success',
        1: 'warning',
        2: 'danger',
    }
    return riskLevelMap[riskLevel] || 'info'

}

const getRiskLevelText = (riskLevel) => {
    const riskTextMap = {
        0: '正常',
        1: '关注',
        2: '预警',
    }
    return riskTextMap[riskLevel] || '未知风险等级'
}


onMounted(() => {
    handleSearch();
})
</script>

<style lang="scss" scoped>
.detail-section {
    margin-bottom: 20px;

    h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #303133;
    }
}


.ai-analysis-result {
    margin-top: 12px;
    padding: 16px;
    background-color: #f0f9ff;
    border: 1px solid #bae0ff;
    border-radius: 8px;

    // space between el-descriptions and the text sections below
    >*+* {
        margin-top: 12px;
    }
}

.ai-analysis-status {
    .ai-status-tag {
        margin-bottom: 4px;

        i {
            margin-right: 4px;
        }
    }
}

.ai-analysis-preview {
    font-size: 13px;
    color: #909399;
    margin-top: 2px;
}


.ai-suggestion-section,
.ai-risk-section,
.ai-improvement-section {
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 4px;
    border: 1px solid #e5e7eb;

    h5 {
        margin: 0 0 8px 0;
        color: #606266;
        font-size: 14px;
        font-weight: 600;
    }

    i {
        margin-right: 6px;
        color: #909399;
    }

    .improvement-list {
        margin: 0;
        padding-left: 20px;

        li {
            margin-bottom: 4px;
            color: #606266;
            line-height: 1.6;
        }
    }

}



.keywords-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .keyword-tag {
        background-color: #e1f3d8;
        color: #67c23a;
        border-color: #b3d8a4;
    }

    .suggestion-content {
        .risk-content {
            line-height: 1.6;
            color: #606266;
            background-color: white;
            padding: 8px;
            border-radius: 4px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }

        .improvement-list {
            margin: 0;
            padding-left: 20px;

            li {
                margin-bottom: 4px;
                color: #606266;
                line-height: 1.6;
            }
        }
    }

    .ai-analysis-meta {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;

        .analysis-time {
            margin: 0;
            font-size: 12px;
            color: #909399;
        }

        i {
            margin-right: 4px;
        }
    }

    .el-progress {
        .el-progress-text {
            font-size: 12px !important;
        }
    }
}
</style>