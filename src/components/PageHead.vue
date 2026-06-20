<template>
    <div class="page-head">
        <p class="page-title">{{ props.title }}</p>
        <div class="action-btn">
            <slot name="button"></slot> <!-- slot for action buttons, such as "Add", "Edit", etc. -->
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        default: 'Title'
    }
});
</script>

<style lang="scss" scoped>
    .page-head {
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .page-title {
        font-size: 24px;
        color: #1f2937;
        }
    }

</style>