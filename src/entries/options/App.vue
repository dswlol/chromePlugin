<script setup lang="ts">
import PageConfig from '@/components/PageConfig.vue'
import { ElConfigProvider } from 'element-plus'
</script>

<template>
  <el-config-provider size="small">
    <PageConfig />
  </el-config-provider>
</template>
