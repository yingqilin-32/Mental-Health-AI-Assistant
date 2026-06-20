<template>
    <div>
        <PageHead title="Knowledge Report">
            <template #button>
                <el-button type="primary" @click="handleAdd">Add</el-button>
            </template>
        </PageHead>
        <TableSearch :form-data="searchForm" @search="handleSearch" />
        <el-table :data="tableData" style="width: 100%; margin-top: 25px;">
            <el-table-column label="Title of Article" fixed="left">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-icon>
                            <timer />
                        </el-icon>
                        <span>{{ scope.row.title }}</span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Category" width="180">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-icon>
                            <timer />
                        </el-icon>
                        <span>{{ categoryMap[scope.row.categoryId] }}</span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column prop="readCount" label="Read Count"  />
            <el-table-column prop="updatedAt" label="Published At"  />

            <el-table-column label="Operations" fixed="right">
                <template #default="scope">
                    <el-button @click="handleEdit(scope.row)" text type="primary" size="small">Edit</el-button>
                    <el-button @click="handlePublish(scope.row)" text v-if="scope.row.status == 0 || scope.row.status == 2" type="success" size="small">Publish</el-button>
                    <el-button @click="handleOffline(scope.row)" text v-if="scope.row.status == 1" type="warning" size="small">Offline</el-button>
                    <el-button @click="handleDelete(scope.row)" text type="danger" size="small">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination 
            :page-size="pagination.size"
            layout="prev, pager, next" 
            :total="pagination.total"
            @change="handleChange"
            style="margin-top: 20px;"
        />
        <ArticleDialog v-model:visible="dialogVisible" :article="currentArticle" :categories="categoryOptions" @success="handleAddArticle" />
    </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
import PageHead from '@/components/PageHead.vue';
import TableSearch from '@/components/TableSearch.vue';
import { categoryList, articleList, getArticleDetail, changeArticleStatus, deleteArticle } from '@/api/admin';
import { el } from 'element-plus/es/locale/index.mjs';
import ArticleDialog from '@/components/ArticleDialog.vue';
import { ElMessageBox,ElMessage  } from 'element-plus';

const searchForm = [
    // Define your search form data here
    {
        comp: 'el-input', prop: 'title', label: 'Page-title', placeholder: 'Enter page title'
    },
    {
        comp: 'el-select', prop: 'category', label: 'Category', placeholder: 'Select category',
        bind: {
            options: [

            ]
        }
    },
    {
        comp: 'el-select', prop: 'status', label: 'Status', placeholder: 'Select status',
        bind: {
            options: [
                { label: 'Draft', value: '0' },
                { label: 'Published', value: '1' },
                { label: 'Offline', value: '2' }
            ]
        }
    }
]

const tableData = ref([]);

const dialogVisible = ref(false);

// parameters of pagination
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

    const res = await articleList(params);
    tableData.value = res.data.records;
    pagination.total = res.data.total;
};

const handleChange = async (page) => {
    pagination.currentPage = page;
    await handleSearch({});
};

// project category map
const categoryMap = reactive({});

// category list
const categoryOptions = ref([]);

const handleAddArticle = () => {
    // close dialog
    dialogVisible.value = false
    // refresh
    handleSearch({})
}

const currentArticle = ref(null)

// Add mode — no article, open blank dialog
const handleAdd = () => {
    currentArticle.value = null
    dialogVisible.value = true
}

// Edit mode — fetch article first, then open dialog
const handleEdit = async (row) => {
    const res = await getArticleDetail(row.id)
    currentArticle.value = res.data
    dialogVisible.value = true
}

//publish

const handlePublish = (row) => {
    ElMessageBox.confirm(
    `Do you want to publish ${row.title}?`,
    'Publish confirmation',
    {
      confirmButtonText: 'confirm publish',
      cancelButtonText: 'Cancel',
      type: 'info',
    }
  )
    .then(() => { 
        // use click the button and then call the api
        changeArticleStatus(row.id, '1').then(() => {
            ElMessage({
                type: 'success',
                message: 'Published successfully',
            })
            handleSearch({})
        })
    
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
}

//offline
const handleOffline = (row) => {
    ElMessageBox.confirm(
    `Do you want to offline ${row.title}?`,
    'Offline confirmation',
    {
      confirmButtonText: 'confirm offline',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => { 
        // use click the button and then call the api
        changeArticleStatus(row.id, '2').then(() => {
            ElMessage({
                type: 'success',
                message: 'Offline successfully',
            })
            handleSearch({})
        })
    
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
    
}

const handleDelete =  (row) => {
    ElMessageBox.confirm(
    `Do you want to delete ${row.title}?`,
    'Delete confirmation',
    {
      confirmButtonText: 'confirm delete',
      cancelButtonText: 'Cancel',
      type: 'danger',
    }
  )
    .then(() => { 
        // use click the button and then call the api
        deleteArticle(row.id).then(() => {
            ElMessage({
                type: 'success',
                message: 'Deleted successfully',
            })
            handleSearch({})
        })
    
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
}

onMounted(async () => {
    const res = await categoryList()

    categoryOptions.value = res.data.map(item => {
        categoryMap[item.id] = item.categoryName;
        return {
            label: item.categoryName,
            value: item.id
        }
    })
    searchForm[1].bind.options = categoryOptions.value;

    // Initial search
    await handleSearch({});

}
)
</script>

