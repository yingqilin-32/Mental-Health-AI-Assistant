<template>
    <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    content: {
        type: String,
        default: '',
    },
});

const escapeHtml = (value) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const renderInlineMarkdown = (value) => {
    return value
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
};

const closeList = (htmlParts, listType) => {
    if (!listType) return null;
    htmlParts.push(`</${listType}>`);
    return null;
};

const renderMarkdown = (source) => {
    const escapedSource = escapeHtml(source.trim());
    const lines = escapedSource.split(/\r?\n/);
    const htmlParts = [];
    let listType = null;
    let inCodeBlock = false;
    let codeLines = [];

    lines.forEach((line) => {
        const codeFenceMatch = line.match(/^```/);

        if (codeFenceMatch) {
            if (inCodeBlock) {
                htmlParts.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
                codeLines = [];
                inCodeBlock = false;
            } else {
                listType = closeList(htmlParts, listType);
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            return;
        }

        if (!line.trim()) {
            listType = closeList(htmlParts, listType);
            return;
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            listType = closeList(htmlParts, listType);
            const level = headingMatch[1].length + 2;
            htmlParts.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
            return;
        }

        const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/);
        if (unorderedMatch) {
            if (listType !== 'ul') {
                listType = closeList(htmlParts, listType);
                htmlParts.push('<ul>');
                listType = 'ul';
            }
            htmlParts.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`);
            return;
        }

        const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
        if (orderedMatch) {
            if (listType !== 'ol') {
                listType = closeList(htmlParts, listType);
                htmlParts.push('<ol>');
                listType = 'ol';
            }
            htmlParts.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`);
            return;
        }

        const quoteMatch = line.match(/^&gt;\s+(.+)$/);
        if (quoteMatch) {
            listType = closeList(htmlParts, listType);
            htmlParts.push(`<blockquote>${renderInlineMarkdown(quoteMatch[1])}</blockquote>`);
            return;
        }

        listType = closeList(htmlParts, listType);
        htmlParts.push(`<p>${renderInlineMarkdown(line)}</p>`);
    });

    if (inCodeBlock && codeLines.length) {
        htmlParts.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
    }

    closeList(htmlParts, listType);

    return htmlParts.join('');
};

const renderedHtml = computed(() => renderMarkdown(props.content));
</script>

<style scoped lang="scss">
.markdown-renderer {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
    overflow-wrap: anywhere;
}

.markdown-renderer :deep(p) {
    margin: 0 0 10px;
}

.markdown-renderer :deep(p:last-child),
.markdown-renderer :deep(ul:last-child),
.markdown-renderer :deep(ol:last-child),
.markdown-renderer :deep(pre:last-child),
.markdown-renderer :deep(blockquote:last-child) {
    margin-bottom: 0;
}

.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5) {
    margin: 12px 0 8px;
    color: #5f3512;
    font-size: 16px;
    line-height: 1.45;
}

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
    margin: 0 0 12px;
    padding-left: 22px;
}

.markdown-renderer :deep(li + li) {
    margin-top: 6px;
}

.markdown-renderer :deep(strong) {
    color: #5f3512;
    font-weight: 700;
}

.markdown-renderer :deep(code) {
    padding: 2px 5px;
    border-radius: 4px;
    background: rgba(244, 169, 74, 0.12);
    color: #7a4b18;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 0.92em;
}

.markdown-renderer :deep(pre) {
    margin: 0 0 12px;
    padding: 12px;
    overflow-x: auto;
    border-radius: 8px;
    background: #2f2a25;
    color: #fff7ed;
}

.markdown-renderer :deep(pre code) {
    padding: 0;
    background: transparent;
    color: inherit;
}

.markdown-renderer :deep(blockquote) {
    margin: 0 0 12px;
    padding: 8px 12px;
    border-left: 3px solid #eda33c;
    background: rgba(244, 169, 74, 0.1);
    color: #665b50;
}

.markdown-renderer :deep(a) {
    color: #c46f19;
    font-weight: 700;
    text-decoration: none;
}

.markdown-renderer :deep(a:hover) {
    text-decoration: underline;
}
</style>
