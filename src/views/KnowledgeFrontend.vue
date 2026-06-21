<template>
    <div class="knowledge-page">
        <section class="knowledge-header">
            <div class="header-content">
                <el-image class="header-icon" :src="bookUrl" alt="Knowledge icon" fit="contain" />
                <h1>Mental Health Knowledge Base</h1>
            </div>
        </section>

        <main class="knowledge-content">
            <aside class="recommend-reading">
                <h2>Recommended Reading</h2>

                <button
                    v-for="article in recommendedArticles"
                    :key="article.id"
                    class="recommend-item"
                    type="button"
                    @click="scrollToArticle(article.id)"
                >
                    <strong>{{ article.title }}</strong>
                    <span>
                        <el-icon><TrendCharts /></el-icon>
                        Views: {{ article.readCount ?? 0 }}
                    </span>
                </button>

                <el-empty
                    v-if="!loading && recommendedArticles.length === 0"
                    description="No articles yet"
                    :image-size="90"
                />
            </aside>

            <section class="article-list" v-loading="loading">
                <article
                    v-for="article in articles"
                    :id="`article-${article.id}`"
                    :key="article.id"
                    class="article-card"
                >
                    <div class="article-cover">
                        <el-image
                            v-if="article.coverImage"
                            :src="getCoverUrl(article.coverImage)"
                            :alt="article.title"
                            fit="cover"
                        />
                    </div>

                    <div class="article-info">
                        <div class="title-row">
                            <h2>{{ article.title }}</h2>
                            <el-tag v-if="getCategoryName(article)" type="primary" effect="plain">
                                {{ getCategoryName(article) }}
                            </el-tag>
                        </div>

                        <p class="summary" v-if="article.summary">{{ article.summary }}</p>

                        <div class="meta-row">
                            <span>
                                <el-icon><UserFilled /></el-icon>
                                {{ article.authorName || 'System Administrator' }}
                            </span>
                            <span>
                                <el-icon><Calendar /></el-icon>
                                {{ formatDate(article.publishedAt || article.updatedAt || article.createdAt) }}
                            </span>
                            <span>
                                <el-icon><Monitor /></el-icon>
                                Views: {{ article.readCount ?? 0 }}
                            </span>
                        </div>
                    </div>
                </article>

                <el-empty
                    v-if="!loading && articles.length === 0"
                    description="No knowledge articles available"
                />
            </section>
        </main>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Calendar, Monitor, TrendCharts, UserFilled } from '@element-plus/icons-vue';
import { getKnowledgeList } from '../api/frontend';
import { fileBaseURL } from '@/config';

const bookUrl = new URL('@/assets/images/book.png', import.meta.url).href;

const loading = ref(false);
const recommendedArticles = ref([]);
const articles = ref([]);

const getRecords = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.records)) return res.data.records;
    if (Array.isArray(res?.records)) return res.records;
    return [];
};

const getCategoryName = (article) => {
    return article.categoryName || article.category || article.categoryTitle || '';
};

const getCoverUrl = (coverImage) => {
    if (!coverImage) return '';
    if (/^https?:\/\//.test(coverImage)) return coverImage;
    return `${fileBaseURL}${coverImage}`;
};

const formatDate = (dateValue) => {
    if (!dateValue) return 'Not published';
    return String(dateValue).slice(0, 10);
};

const scrollToArticle = (id) => {
    document.getElementById(`article-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });
};

const loadRecommendedArticles = async () => {
    const params = {
        sortField: 'readCount',
        sortDirection: 'desc',
        currentPage: 1,
        pageSize: 5,
        size: 5,
        status: '1',
    };

    const res = await getKnowledgeList(params);
    recommendedArticles.value = getRecords(res);
};

const loadArticles = async () => {
    const params = {
        currentPage: 1,
        pageSize: 20,
        size: 20,
        status: '1',
    };

    const res = await getKnowledgeList(params);
    articles.value = getRecords(res);
};

onMounted(async () => {
    loading.value = true;

    try {
        await Promise.all([
            loadRecommendedArticles(),
            loadArticles(),
        ]);
    } finally {
        loading.value = false;
    }
});
</script>

<style lang="scss" scoped>
.knowledge-page {
    min-height: 100%;
    background: #f6fbfd;
    color: #111827;
}

.knowledge-header {
    height: 170px;
    background: linear-gradient(120deg, #e2a632 0%, #b6789c 50%, #7d4fe1 100%);
    display: flex;
    align-items: center;
}

.header-content {
    width: min(1280px, calc(100% - 80px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 20px;

    h1 {
        margin: 0;
        color: #fff;
        font-size: 34px;
        font-weight: 800;
        line-height: 1.15;
    }
}

.header-icon {
    width: 60px;
    height: 60px;
    filter: brightness(0) invert(1);
}

.knowledge-content {
    width: min(1280px, calc(100% - 64px));
    margin: 24px auto 56px;
    display: grid;
    grid-template-columns: 340px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
}

.recommend-reading,
.article-card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(31, 41, 55, 0.08);
}

.recommend-reading {
    position: sticky;
    top: 94px;
    padding: 22px 18px 24px;

    h2 {
        margin: 0 0 14px;
        color: #1f2937;
        font-size: 18px;
        font-weight: 800;
    }
}

.recommend-item {
    width: 100%;
    min-height: 66px;
    border: 0;
    border-left: 4px solid #e3a43a;
    background: transparent;
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    transition: background 0.2s, border-color 0.2s;

    & + & {
        margin-top: 8px;
    }

    strong {
        color: #111827;
        font-size: 17px;
        line-height: 1.25;
    }

    span {
        color: #6b7280;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 7px;
    }

    &:hover {
        border-color: #7d4fe1;
        background: #f8fbff;
    }
}

.article-list {
    min-height: 360px;
}

.article-card {
    min-height: 190px;
    padding: 18px;
    display: grid;
    grid-template-columns: 275px minmax(0, 1fr);
    gap: 24px;

    & + & {
        margin-top: 22px;
    }
}

.article-cover {
    height: 160px;
    border-radius: 0;
    background: #fff9d8;
    overflow: hidden;

    :deep(.el-image) {
        width: 100%;
        height: 100%;
        display: block;
    }
}

.article-info {
    min-width: 0;
    padding: 2px 0;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;

    h2 {
        margin: 0;
        color: #111827;
        font-size: 23px;
        font-weight: 800;
        line-height: 1.25;
    }
}

.summary {
    margin: 0 0 16px;
    max-width: 760px;
    color: #4b5563;
    font-size: 14px;
    line-height: 1.7;
}

.meta-row {
    display: flex;
    flex-direction: column;
    gap: 13px;
    color: #111827;
    font-size: 16px;

    span {
        display: flex;
        align-items: center;
        gap: 10px;
    }
}

@media (max-width: 1020px) {
    .knowledge-content {
        grid-template-columns: 1fr;
    }

    .recommend-reading {
        position: static;
    }
}

@media (max-width: 720px) {
    .knowledge-header {
        height: 138px;
    }

    .header-content {
        width: min(100% - 32px, 1280px);

        h1 {
            font-size: 27px;
        }
    }

    .header-icon {
        width: 48px;
        height: 48px;
    }

    .knowledge-content {
        width: min(100% - 28px, 1280px);
    }

    .article-card {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .article-cover {
        height: 190px;
    }
}
</style>
