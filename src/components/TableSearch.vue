<template>
    <el-form ref="formEl" :model="formModel">
        <el-row :gutter="24">
            <template v-for="item in formModelComputed" :key="item.prop">
            <el-col v-bind="item.col">
            <el-form-item :label="item.label" :prop="item.prop">
                <component
                    :is="item.comp"
                    v-model="formModel[item.prop]"
                    :placeholder="item.placeholder"
                    style="width: 100%;"
                    v-bind="item.bind"
                >
                    <template v-if="item.comp === 'el-select'">
                        <el-option
                            v-for="opt in item.bind?.options"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                        />
                    </template>
                </component>
            </el-form-item>
            </el-col>
            </template>
        </el-row>
        <el-row :gutter="24">
            <el-col :span="24">
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">Search</el-button>
                    <el-button @click="handleReset(formEl)">Reset</el-button>
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';

const props = defineProps({
    formData: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['search']);

// form data and form ref
const formEl = ref() 
const formModel = reactive({});

const formModelComputed = computed(() => {
    // add default column layout to each form item
    props.formData.forEach(item => {
        item.col = {xs: 24, sm: 12, md: 8, lg: 8, xl:8};
    });
    return props.formData;
});

const handleSearch = () => {
   emit('search', formModel);
};

const handleReset = (formEl) => {
    if (!formEl) return
    formEl.resetFields()
    handleSearch()
};
</script>




