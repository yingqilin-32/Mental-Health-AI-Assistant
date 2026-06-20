<template>
    <div>
        <PageHead title="Consultation"></PageHead>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column label="User" width="200">
                <template #default="scope">
                    <el-avatar>
                        {{ scope.row.userNickname }}
                    </el-avatar>
                </template>
            </el-table-column>
            <el-table-column label="Emotion Journal">
                <template #default="scope">
                    <div class="session-title"> {{ scope.row.sessionTitle }}</div>
                    <div class="session-preview"> {{ scope.row.lastMessageContent }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="messageCount" label="Message Count" width="100" />
            <el-table-column prop="lastMessageTime" label="Last Updated At" width="200" />
            <el-table-column label="Operation" width="200">
                <template #default="scope">
                    <el-button @click="handleCheck(scope.row)" text type="primary" size="small">Details</el-button>
                </template>
            </el-table-column>

        </el-table>

        <el-pagination :page-size="pagination.size" layout="prev, pager, next" :total="pagination.total"
            @change="handleChange" style="margin-top: 20px;" />

        <el-dialog v-model="ShowDetailDialog" title="Consulation Details" width="70%" :close-on-click-modal="false">
            <div class="session-detail">
                <div class="detail-header">
                    <div class="detail-row">
                        <div class="detail-label">user: </div>
                        <div class="detail-value">{{ currentSession.userNickname }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Start Time: </div>
                        <div class="detail-value">{{ currentSession.startedAt }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Message Count: </div>
                        <div class="detail-value">{{ currentSession.messageCount }}</div>
                    </div>
                </div>
                <div class="messages-container">
                    <div class="Meassage-header">
                        <h4>Messages record</h4>
                    </div>
                    <div class="messages-list" v-loading="loadingMessages">
                        <div class="messages-item" v-for="item in currentMessage" :key="item.id" :class= "item.senderType===1?'user-message':'ai-message'">
                            <div class="messages-header">
                                <span class="sender">{{ item.senderType===1?'User':'AI' }}</span>
                                <span class="time">{{ item.createdAt }}</span>
                            </div>
                            <div class="messages-content">
                                {{ item.content }}  
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="ShowDetailDialog = false">Close</el-button>
            </template>
        </el-dialog>
    </div>

</template>


<script setup>

import PageHead from '../components/PageHead.vue';
import { ref, onMounted, reactive } from 'vue';
import { consultationList, sessionList } from '../api/admin';
import { el } from 'element-plus/es/locale/index.mjs';

const tableData = ref([]);

//pagination

const pagination = reactive({
    currentPage: 1,
    size: 10,
    total: 0
})

//consultation detail
const currentSession = ref({});

const currentMessage = ref([]);

const handleCheck = (row) => {
    // console.log(row);
    loadingMessages.value = true
    ShowDetailDialog.value = true
    sessionList(row.id).then(res => {
        // console.log(res, 'sessionList');
        loadingMessages.value = false
        currentMessage.value = res.data
        currentSession.value = row;
    })
}

const handleChange = async (page) => {
    pagination.currentPage = page;
    await handleSearch({});
};

const handleSearch = () => {
    consultationList({ ...pagination }).then(res => {
        tableData.value = res.data.records;
        pagination.total = res.data.total
    })
}

// loading messages
const loadingMessages = ref(false);

const ShowDetailDialog = ref(false);

// onMounted
onMounted(() => {
    handleSearch();
})


</script>

<style lang="scss" scoped>
.session-title {
    color: #333;
    font-weight: 500;
    margin-bottom: 4px;
}

.session-preview {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}

.session-detail {
    max-height: 70vh;
    overflow-y: scroll;

    .detail-header {
        margin-bottom: 20px;
        padding:16px;
        background-color: #e6e2e2;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        .detail-row {
        display: flex;
        margin-bottom: 8px;
        align-items: center;
        :last-child {
            margin-bottom: 0;
        }
    }

        .detail-label {
            font-weight: 500;
            color: #495057;
            min-width: 80px;
            margin-right: 8px;
        }

        .detail-value {
            color:#333
        }
    }
    .messages-container{
        margin-top: 20px;
        .messages-header{
            margin-bottom: 20px;
            h4{
                margin: 0;
                color: #333;
                font-size: 16px;
                font-weight: 500;
            }
        }
        .messages-list{
            max-height: 400px;
            overflow-y: scroll;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            background-color: #fff;
            .messages-item{
                margin-bottom: 12px;
                padding: 12px;
                border-radius: 8px;
                background-color: #f5f5f5;
                :last-child{
                    margin-bottom: 0;
                }
                &.user-message{
                    background-color: #bdd1f5;
                }
                &.ai-message{
                    background-color: hsl(98, 80%, 84%);
                }
            }
            .messages-header{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                .sender{
                    font-weight: 500;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap:4px;
                }

                .time{
                    font-size: 12px;
                    color: #666;
                }

                .message-content{
                    color: #333;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    margin-top: 8px;
                    font-size: 14px;
                }
            }
        }
    }
    }

</style>