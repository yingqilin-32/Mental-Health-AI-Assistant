<template>
    <div class="consultation-container">
        <div class="side-bar">
            <div class="ai-assistant-info">
                <div class="breathing-circle">
                    <el-image :src="iconURL" class="assistant-icon" />
                </div>
                <h3>Ningbo AI Assistant</h3>
                <div class="status-row">
                    <span class="status-dot"></span>
                    <span>Online support</span>
                </div>
            </div>

            <div class="history-card">
                <h3>Conversation History</h3>
                <div class="empty-history" v-if="historyMessageList.length === 0">
                    <el-icon><ChatRound /></el-icon>
                    <span>No conversation records</span>
                </div>
                <div class="session-list" v-else>
                    <div
                        class="session-item"
                        v-for="session in historyMessageList"
                        :key="session.id || session.sessionid"
                        :class="{ active: isCurrentSession(session) }"
                        @click="handleSessionClick(session)"
                    >
                        <el-button class="session-delete-button" type="danger" circle @click.stop="handleSessionDelete(session.id);">
                            <el-icon><Delete /></el-icon>
                        </el-button>
                        <div class="session-info">
                            <div class="session-title">
                                <span>{{ session.sessionTitle || 'Untitled Session' }}</span>
                            </div>
                            <div class="session-meta">
                                <span class="session-time">{{ session.lastMessageTime || session.startedAt || session.startAt }}</span>
                            </div>

                            <div class="session-preview">
                                {{ session.lastMessageContent || 'No messages yet' }}
                            </div>

                            <div class="session-status" >
                                <span>
                                    <el-icon><ChatRound /></el-icon>
                                    {{ session.messageCount || 0 }}
                                </span>
                                <span>
                                    <el-icon><Clock /></el-icon>
                                    {{ session.durationMinutes || 0 }} min
                                </span>
                            </div>
                        </div>

                    </div>
                    
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="chat-panel">
                <div class="chat-header">
                    <div class="chat-title">
                        <div class="header-avatar">
                            <el-icon><StarFilled /></el-icon>
                        </div>
                        <div>
                            <h2>Ningbo AI Assistant</h2>
                            <p>Your caring mental health assistant</p>
                        </div>
                    </div>
                    <el-button class="new-chat-button" circle @click="createNewFrontendSession">
                        <el-icon><Plus /></el-icon>
                    </el-button>
                </div>

                <div class="chat-body">
                    <div class="message-row">
                        <div class="message-item ai-message" v-if="message.length===0">
                        <div class="message-avatar">
                            <el-image :src="iconURL" class="message-icon" />
                        </div>
                        <div>
                            <div class="message-bubble">
                                <MarkdownRenderer content="Hello! I am your AI mental health assistant. I am glad to stay with you and offer warm support. Tell me, how are you feeling today?" />
                            </div>
                            <span class="message-time">Just now</span>
                        </div>
                        </div>
                        <div :class="msg.senderType === 2 ? 'message-item ai-message' : 'message-item user-message'" v-else v-for="msg in message" :key="msg.id">
                            <div class="message-avatar" v-if="msg.senderType === 2">
                                <el-image :src="iconURL" style="width: 18px; height: 18px;" class="message-icon" />
                            </div>
                            <div class="message-avatar" v-else>
                                <el-image :src="iconURL2" style="width: 18px; height: 18px;" class="message-icon" />
                            </div>
                            <div class="message-content">
                                <div class="message-bubble">
                                    <!-- AI is typing -->
                                    <div v-if="msg.senderType===2 && isAiTyping && !msg.content" class="typing-indicator">
                                        <div class="typing-dot"></div>
                                        <div class="typing-dot"></div>
                                        <div class="typing-dot"></div>
                                    </div>
                                    <!-- Error message -->
                                     <div v-else-if="msg.isError" class="error-message">
                                        {{ msg.content || 'An error occurred while processing your request.' }}
                                     </div>
                                     <!-- Normal message -->
                                    <MarkdownRenderer v-else-if="msg.senderType === 2" :content="msg.content" />
                                    <div v-else-if="msg.content" class="user-message-content" v-html="formatUserMessage(msg.content)"></div>
                                </div>
                                <span class="message-time">{{ msg.senderType === 2&& isAiTyping ? 'Typing...' : msg.createdAt }}</span>
                            </div>


                        </div>
                    </div>
                </div>

                <div class="chat-input-area">
                    <el-input
                        v-model="messageText"
                        class="message-input"
                        type="textarea"
                        :rows="3"
                        :disabled="isAiTyping"
                        @keydown.enter.exact.prevent="sendMessage"
                        maxlength="500"
                        show-word-limit
                        resize="none"
                        placeholder="Share what is on your mind..."
                    />
                    <div class="input-actions">
                        <span>Press Enter to send, Shift + Enter for a new line</span>
                        <el-button :disabled="!messageText.trim() || isAiTyping || messageText.length > 500" class="send-button" @click="sendMessage">
                            <el-icon><Promotion /></el-icon>
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ChatRound, Clock, Delete, Plus, Promotion, StarFilled } from '@element-plus/icons-vue';
import {startSession,getSessionList,deleteSession,getSessionDetail} from '../api/frontend.js'
import { ElMessage } from 'element-plus';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const iconURL = new URL('../assets/images/robot-fill.png', import.meta.url).href
const iconURL2 = new URL('../assets/images/user.png', import.meta.url).href
//define message input text
const messageText = ref('');
//define conversation message
const message = ref([]);
// define AI typing status
const isAiTyping = ref(false);
//define history message list
const historyMessageList = ref([]);

// creat a new session
const currentSession = ref(null);


const createNewFrontendSession = () => {
    const newSessionData = {
        // Add any necessary data for creating a new session
        sessionid: `temp_${Date.now()}`,
        status: 'TEMP',
        sessionTitle: 'New Session',
    };
    currentSession.value = newSessionData;
}

const isCurrentSession = (session) => {
    if (!currentSession.value || !session) return false;

    if (currentSession.value.id && session.id) {
        return currentSession.value.id === session.id;
    }

    if (currentSession.value.sessionid && session.sessionid) {
        return currentSession.value.sessionid === session.sessionid;
    }

    return false;
}

// User sends a message
const sendMessage = () => {
    const content = messageText.value.trim();
    if (!content) return;
    if (isAiTyping.value){
        ElMessage.warning('AI is typing, please wait for a moment.');
        return;
    }
    messageText.value = '';
    // if no current session, create a new one
    if(currentSession.value?.status === 'TEMP'){
        startNewSession(content);
    }else{
        // continue the current session
        message.value.push({
            id: `Date.now()`,
            senderType: 1,
            content,
            createdAt: new Date().toLocaleString(),
        })
        startAiResponse(currentSession.value.id || currentSession.value.sessionid, content);
    }
}

// using API to start a new session
const startNewSession = (initialMessage) => {
    const sessionParams = {
        initialMessage,
    }
    if(currentSession.value?.sessionTitle === 'New Session'){
        sessionParams.sessionTitle = 'AI assistant Session_' + new Date().toLocaleString();
    }else{
        sessionParams.sessionTitle = currentSession.value?.sessionTitle;
    }
    startSession(sessionParams).then(res => {
        // Use backend data as the source of truth for the stored session.
        const sessionData = {
            ...res.data,
            status: res.data?.status || 'ACTIVE',
            sessionTitle: res.data?.sessionTitle || sessionParams.sessionTitle,
        };

        // if the session is temporary, update it to the backend session data
        if(currentSession.value && currentSession.value?.status === 'TEMP'){
            Object.assign(currentSession.value, sessionData);
        }else{
            currentSession.value = sessionData;
        }
        // update the session list with backend data
        fetchSessionList();
        // add user inital message to the message list
        message.value.push({ 
             id: `Date.now()`,
             senderType: 1, 
             content: initialMessage, 
             createdAt: new Date().toISOString(), });

        // begin AI typing
        startAiResponse(currentSession.value.id || currentSession.value.sessionid, initialMessage);
    })
}


// Ai response simulation
const startAiResponse = (sessionid,userMessage) => {
    // pretend to repulicate the AI response with a delay
    if (isAiTyping.value) {
        ElMessage.warning('AI is already typing, please wait for a moment.');
        return;
    }

    
    isAiTyping.value = true;
    
    const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
        senderType: 2,
        content: '',
        createdAt: new Date().toISOString(),
    };

    message.value.push(aiMessage);

    //invoke the API to get the AI response
    const controller = new AbortController();//To cut off the request when the page is closed
    let receivedResponse = false;
    void fetchEventSource('/api/psychological-chat/stream',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { token: localStorage.getItem('token') } : {}),
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
            // they have same key and value
            sessionid,
            userMessage
        }),
        signal: controller.signal,
        onopen: async (response) => {
            console.log(response);
            if (!response.ok) {
                let errorMessage = `AI service returned HTTP ${response.status}.`;
                try {
                    const body = await response.clone().json();
                    errorMessage = body.message || body.msg || errorMessage;
                } catch {
                    // The response did not contain a JSON error body.
                }
                throw new Error(errorMessage);
            }
            if (!response.headers.get('Content-Type')?.includes('text/event-stream')) {
                throw new Error('AI service returned an unexpected response format.');
            }
        },
        onmessage: (event) => {
            const raw = event.data.trim();
            if(!raw)return;
            const eventName = event.event;
            // fetch current session AI message
            const aiMessage = message.value[message.value.length - 1];

            if (eventName === 'done' || raw === '[DONE]') {
                isAiTyping.value = false;
                controller.abort();
                return;
            }
            let payload;
            try {
                payload = JSON.parse(raw);
            } catch {
                // Some SSE backends send plain text chunks rather than JSON.
                if (aiMessage) {
                    aiMessage.content += raw;
                    receivedResponse = true;
                }
                return;
            }
            const statusCode = payload?.code ?? payload?.status ?? payload?.statusCode;
            const isSuccess = statusCode === undefined || ['0', '200'].includes(String(statusCode));

            if (!isSuccess) {
                processErrorMessage(payload?.message || payload?.msg || 'The AI service rejected this request.');
                controller.abort();
                return;
            }

            const chunk = typeof payload === 'string'
                ? payload
                : payload?.data?.content
                    ?? payload?.data?.text
                    ?? payload?.data?.delta
                    ?? payload?.content
                    ?? payload?.text
                    ?? payload?.delta
                    ?? (typeof payload?.data === 'string' ? payload.data : null);

            if (chunk !== null && chunk !== undefined && aiMessage) {
                aiMessage.content += String(chunk);
                receivedResponse = true;
            } else {
                // Keep metadata-only events from being displayed as errors.
                console.debug('Ignoring SSE event without a text chunk:', payload);
            }
        },
        onerror: (error) => {
            processErrorMessage(error.message || 'An error occurred while processing your request.');
            controller.abort();
            throw error;
        },
        onclose: () => {
            if (isAiTyping.value && !receivedResponse && !aiMessage.content) {
                processErrorMessage('The AI service closed the connection before sending a response.');
            } else {
                isAiTyping.value = false;
            }
            // start analyzing emotion
        }
    }).catch((error) => {
        if (error?.name !== 'AbortError') {
            console.error('AI response stream failed:', error);
        }
    });
    };

//Function of Proccessing the error message
const processErrorMessage = (error) => {
    // fetch current session AI message
    const aiMessage = message.value[message.value.length - 1];
    const errorText = typeof error === 'string'
        ? error
        : error?.message || 'Unable to connect to the AI service. Please try again later.';

    if (aiMessage) {
        aiMessage.content = errorText;
        aiMessage.isError = true;
    }

    isAiTyping.value = false;
    ElMessage.error(errorText);
}

//history message list
const fetchSessionList = () => {
    getSessionList({
        pageNum: 1,
        PageSize: 10}
    ).then(res => {
        historyMessageList.value = res.data.records || [];
    })
}

//fetch the session items when the user clicks on a session
const handleSessionClick = (session) => {
    getSessionDetail(session.id).then(res => {
        // console.log('Session detail:', res.data);
        message.value = res.data || [];
    }).catch(error => {
        console.error('Failed to load session detail:', error);
    })
    // update the current session object with the selected session data
    const SessionData = {
        ...session,
        status: 'ACTIVE',
    };
    currentSession.value = SessionData;
}

const handleSessionDelete = (session) => {
    deleteSession(session).then(res => {
        ElMessage.success('Session deleted successfully');
        fetchSessionList();
    })
}   

const formatUserMessage = (content) => {
    // Escape HTML to prevent XSS attacks
    const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Replace newlines with <br> for proper formatting
    return escapedContent.replace(/\n/g, '<br>');
};

onMounted(()=>{
    createNewFrontendSession();
    fetchSessionList();
})
</script>

<style scoped lang="scss">
.consultation-container {
    min-height: calc(100vh - 130px);
    padding: 42px 24px 48px;
    display: grid;
    grid-template-columns: 340px minmax(0, 1fr);
    gap: 22px;
    background:
        radial-gradient(circle at 24% 18%, rgba(244, 166, 60, 0.12), transparent 34%),
        linear-gradient(135deg, #fffdf8 0%, #ffffff 46%, #fffaf2 100%);
}

.side-bar {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.ai-assistant-info,
.history-card,
.chat-panel {
    border: 1px solid rgba(232, 222, 207, 0.75);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 14px 36px rgba(100, 77, 43, 0.08);
}

.ai-assistant-info {
    min-height: 168px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.breathing-circle {
    width: 66px;
    height: 66px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f6b14b, #e8962e);
    box-shadow: 0 12px 26px rgba(232, 150, 46, 0.32);
    animation: breathe 2.4s ease-in-out infinite;
}

.assistant-icon,
.message-icon {
    width: 28px;
    height: 28px;
}

.ai-assistant-info h3,
.history-card h3 {
    margin: 16px 0 10px;
    font-size: 18px;
    color: #8f5416;
}

.status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #32936f;
    font-size: 14px;
    font-weight: 600;
}

.status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #36b37e;
    box-shadow: 0 0 0 5px rgba(54, 179, 126, 0.12);
}

.history-card h3 {
    margin: 0;
    color: #6f4219;
}

.history-card {
    min-height: 300px;
    padding: 22px 18px;
}

.empty-history {
    height: 210px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #a1a1aa;
    font-size: 14px;
}

.empty-history .el-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: #d99237;
    background: rgba(244, 169, 74, 0.12);
    font-size: 20px;
}

.session-list {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 410px;
    overflow-y: auto;
    padding-right: 4px;
}

.session-list::-webkit-scrollbar {
    width: 5px;
}

.session-list::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(220, 154, 64, 0.35);
}

.session-item {
    position: relative;
    padding: 14px 44px 14px 14px;
    border: 1px solid rgba(236, 222, 204, 0.82);
    border-radius: 14px;
    background: rgba(255, 253, 248, 0.92);
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.session-item:hover,
.session-item.active {
    transform: translateY(-1px);
    border-color: rgba(238, 163, 56, 0.58);
    background: #fff9ef;
    box-shadow: 0 10px 22px rgba(116, 86, 45, 0.08);
}

.session-delete-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    width: 26px;
    height: 26px;
    min-height: 26px;
    border: none;
    color: #c7674a;
    background: rgba(245, 108, 108, 0.1);
    font-size: 13px;
}

.session-delete-button:hover,
.session-delete-button:focus {
    color: white;
    background: #f56c6c;
}

.session-info {
    min-width: 0;
}

.session-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #5f3512;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
}

.session-title span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.session-meta {
    margin-top: 5px;
    color: #a68b6e;
    font-size: 12px;
}

.session-preview {
    margin-top: 9px;
    color: #6f6760;
    font-size: 13px;
    line-height: 1.55;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
}

.session-status {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #8a7d70;
    font-size: 12px;
}

.session-status span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 999px;
    background: rgba(244, 169, 74, 0.1);
}

.session-status .el-icon {
    color: #d99237;
    font-size: 13px;
}

.main-content {
    min-width: 0;
}

.chat-panel {
    min-height: 760px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.chat-header {
    height: 104px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #f4a24b 0%, #eea92d 100%);
    color: white;
}

.chat-title {
    display: flex;
    align-items: center;
    gap: 14px;
}

.header-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.24);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
    font-size: 24px;
}

.chat-title h2 {
    margin: 0 0 5px;
    font-size: 22px;
    line-height: 1.2;
}

.chat-title p {
    margin: 0;
    font-size: 14px;
    opacity: 0.86;
}

.new-chat-button {
    width: 38px;
    height: 38px;
    border: none;
    color: #8a6841;
    background: rgba(255, 255, 255, 0.9);
}

.chat-body {
    flex: 1;
    padding: 28px 30px;
    background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 243, 0.72)),
        repeating-linear-gradient(135deg, transparent 0 120px, rgba(242, 194, 121, 0.035) 120px 240px);
}

.message-row {
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-width: 760px;
}

.message-item {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 14px;
    align-items: flex-start;
    width: 100%;
}

.ai-message {
    justify-content: start;
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f6b14b, #e8962e);
    box-shadow: 0 8px 16px rgba(232, 150, 46, 0.22);
}

.message-icon {
    width: 20px;
    height: 20px;
}

.message-bubble {
    max-width: 650px;
    padding: 16px 18px;
    border: 1px solid rgba(236, 222, 204, 0.85);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.92);
    color: #1f2933;
    font-size: 15px;
    line-height: 1.75;
    box-shadow: 0 8px 20px rgba(111, 76, 32, 0.05);
}

.message-time {
    display: inline-block;
    margin-top: 8px;
    color: #a7a29c;
    font-size: 13px;
}

.chat-input-area {
    padding: 18px 24px 22px;
    border-top: 1px solid rgba(232, 222, 207, 0.78);
    background: rgba(255, 252, 247, 0.92);
}

.message-input :deep(.el-textarea__inner) {
    min-height: 76px !important;
    border-color: #d8dce2;
    border-radius: 4px;
    box-shadow: none;
    font-size: 14px;
}

.message-input :deep(.el-textarea__inner:focus) {
    border-color: #eda33c;
    box-shadow: 0 0 0 1px rgba(237, 163, 60, 0.16);
}

.input-actions {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: #6f6f6f;
    font-size: 13px;
}

.send-button {
    width: 64px;
    height: 56px;
    border: none;
    border-radius: 14px;
    color: white;
    background: linear-gradient(135deg, #f3a94a, #ef982e);
    box-shadow: 0 10px 22px rgba(239, 152, 46, 0.28);
    font-size: 18px;
}

@keyframes breathe {
    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

@media (max-width: 980px) {
    .consultation-container {
        grid-template-columns: 1fr;
        padding: 24px 16px 36px;
    }

    .side-bar {
        display: flex;
    }

    .chat-panel {
        min-height: 640px;
    }
}

@media (max-width: 640px) {
    .side-bar {
        grid-template-columns: 1fr;
    }

    .chat-header {
        height: auto;
        padding: 18px;
        gap: 14px;
    }

    .chat-title h2 {
        font-size: 18px;
    }

    .chat-body {
        padding: 20px 16px;
    }

    .message-row {
        gap: 10px;
    }

    .message-item {
        grid-template-columns: 32px minmax(0, 1fr);
    }

    .message-avatar {
        width: 32px;
        height: 32px;
    }

    .input-actions {
        align-items: flex-end;
    }

    .input-actions span {
        max-width: 190px;
        line-height: 1.4;
    }
}
</style>
