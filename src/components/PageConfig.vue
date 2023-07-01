<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="card">
    count={{ count }}
    <el-button>Default</el-button>
    <el-button type="primary">Primary</el-button>
    <el-button type="success">Success</el-button>
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="Approved by">
        <el-input v-model="count" placeholder="Approved by" clearable />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
