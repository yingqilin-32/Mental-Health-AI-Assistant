<template>
    <el-dialog v-model="dialogVisible" :title="isEditing ? 'Edit Article' : 'Add Article'" width="50%"
        @close="handleClose">
        <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
            <el-form-item label="Title" prop="title">
                <el-input v-model="formData.title" placeholder="Enter article title" maxlength="200" show-word-limit
                    clearable />
            </el-form-item>

            <el-form-item label="Category" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="Select category">
                    <el-option v-for="category in categories" :key="category.value" :label="category.label"
                        :value="category.value" />
                </el-select>
            </el-form-item>

            <el-form-item label="Summary" prop="summary">
                <el-input type="textarea" v-model="formData.summary" placeholder="Enter article summary (optional)"
                    :rows="4" maxlength="1000" show-word-limit clearable />
            </el-form-item>

            <el-form-item label="Tags" prop="tags">
                <el-select v-model="formData.tagArray" placeholder="Enter article tags" multiple v-cloak filterable
                    allow-create style="width: 100%;">
                    <!-- tagArray does not exist -->
                    <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
                </el-select>
            </el-form-item>

            <el-form-item label="Cover Image" prop="coverImage">
                <div class="uploadAvatar">
                    <el-upload class="avatar-uploader" action=# :http-request="uploadCoverImage" accept="image/*"
                        :before-upload="beforeAvatarUpload" :show-file-list="false">

                        <div v-if="!imageUrl" class="cover-placeholder">
                            <p>click to upload</p>
                        </div>
                        <img v-else :src="imageUrl" class="cover-image" />
                    </el-upload>
                    <div v-if="imageUrl" class="remove-button">
                        <el-button type="danger" size="small" @click="handleRemoveCoverImage">Remove</el-button>
                    </div>
                </div>

            </el-form-item>

            <el-form-item label="Content" prop="content">
                <RichTextEditor v-model="formData.content" :placeholder="'Enter article content...'" :maxLength=5000
                    @change="handleContentChange" @created="handleEditorCreated" />
            </el-form-item>

        </el-form>

        <div v-if="btnPreview" class="content-preview">
            <h3>Content Preview</h3>
            <div v-html="formData.content"></div>
        </div>

        <template #footer>
            <el-button @click="btnPreview = !btnPreview">{{ btnPreview ? 'Hide Preview' : 'Preview' }}</el-button>
            <el-button @click="handleClose">Cancel</el-button>
            <el-button type="primary" @click="handleSubmit">{{ isEditing ? 'Update' : 'Create' }}</el-button>
        </template>

    </el-dialog>


</template>

<script setup>
import { ref, computed, reactive, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadFile } from '@/api/admin';
import { fileBaseURL } from '@/config';
import RichTextEditor from "@/components/RichTextEditor.vue";
import { createArticle, updateArticle } from '../api/admin';


const emit = defineEmits(['update:visible', 'success']);

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    categories: {
        type: Array,
        default: () => []
    },
    article: {
        type: Object,
        default: null //To distinguish between creating a new article and editing an existing article
    }
});

const dialogVisible = computed({
    get() {
        return props.visible;
    },
    set(value) {
        emit('update:visible', value);
    }
});

const isEditing = computed(() => {
    return !!props.article?.id
});

const formData = reactive({
    title: "",
    content: "",
    coverImage: "",
    categoryId: 1,
    summary: "",
    tags: "",
    tagArray: [],   // bound to el-select; joined into 'tags' before submit
});


const tagOptions = [
    'Emotional Management',
    'Stress Relief',
    'Time Management',
    'Mindfulness',
    'Self-Reflection',
    'Goal Setting',
    'Positive Psychology',
    'Cognitive Behavioral Therapy',
    'Resilience Building',
    'Work-Life Balance',
];

const rules = {
    title: [
        { required: true, message: 'Title is required', trigger: 'blur' },
        { min: 5, max: 200, message: 'Title must be between 5 and 200 characters', trigger: 'blur' }
    ],
    categoryId: [
        { required: true, message: 'Category is required', trigger: 'change' }
    ],
    summary: [
        { max: 500, message: 'Summary cannot exceed 1000 characters', trigger: 'blur' }
    ],
    content: [
        { required: true, message: 'Content is required', trigger: 'blur' },
        { max: 5000, message: 'Content must be at least 20 characters', trigger: 'blur' }
    ]
};

// upload cover image

const imageUrl = ref('');

const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error('You can only upload image files!');
        return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        ElMessage.error('Image size must be less than 2MB!');
        return false;
    }
    return true;
}

// generate uuid 
const businessId = ref('');
const uploadCoverImage = async ({ file }) => {

    //uuid
    businessId.value = crypto.randomUUID();

    const fileRes = await uploadFile(file, {
        businessId: businessId.value,
    });

    // console.log('File upload response:', fileRes);

    // complete image URL
    imageUrl.value = fileBaseURL + fileRes.data.filePath;
    formData.coverImage = fileRes.data.filePath;  // The submitted file path is relative
}

const handleRemoveCoverImage = () => {
    imageUrl.value = '';
    formData.coverImage = '';
};


// Populate form when article prop arrives (edit mode); clear it when null (add mode)
// watch the article prop
watch(() => props.article, (article) => {

    //  mutate reactive state
    nextTick(() => {
        if (article) {
            Object.assign(formData, article) //give data to reactive object
            businessId.value = article.id
            imageUrl.value = article.coverImage ? fileBaseURL + article.coverImage : ''
        }
    })
})

const handleContentChange = ({ html, text }) => {
    // console.log('html:', html)
    // console.log('text:', text)
    formData.content = html
};

// const editorInstance= ref(null)
const handleEditorCreated = (editor) => {
    if (formData.content && editor) {

        nextTick(() => {
            editor.setHtml(formData.content)
        }
        )
    }
};

const btnPreview = ref(false)
const formRef = ref()

const loading = ref(false)

const handleSubmit = () => {
    formRef.value.validate((valid) => {
        if (!valid) return
        loading.value = true

        const { tagArray, ...rest } = formData
        const submitData = { ...rest, tags: tagArray.join(',') }
        // id is omitted for new articles — backend assigns it

        if (isEditing.value) {
            updateArticle(props.article.id, submitData)
                .then(() => {
                    ElMessage.success('Article updated successfully')
                    emit('success')
                    handleClose()
                })
                .catch((err) => {
                    ElMessage.error(err?.message ?? 'Submit failed')
                })
                .finally(() => {
                    loading.value = false
                })
        } else {
            submitData.id = businessId.value
            createArticle(submitData)
                .then(() => {
                    ElMessage.success('Article created successfully')
                    emit('success')
                    handleClose()
                })
                .catch((err) => {
                    ElMessage.error(err?.message ?? 'Submit failed')
                })
                .finally(() => {
                    loading.value = false
                })
        }
    }
    )
}



const handleClose = () => {
    formRef.value?.resetFields() // reset form
    //rest tagArray
    formData.tagArray = []
    //rest uuid
    businessId.value = ''
    //rest imgURL
    handleRemoveCoverImage()
    dialogVisible.value = false
};
</script>

<style lang="scss" scoped>
.cover-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 120px;
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    color: #999;
    background-color: #f5f5f5;
}

.cover-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
}
</style>