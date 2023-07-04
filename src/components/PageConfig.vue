<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import logoIcon from '@/assets/logo.png'

const isURL = (str_url: string) => {
  // 验证url
  var strRegex =
    '^((https|http|ftp|rtsp|mms)?://)' +
    "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + // ftp的user@
    '(([0-9]{1,3}\.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
    '|' + // 允许IP和DOMAIN（域名）
    "([0-9a-z_!~*'()-]+\.)*" + // 域名- www.
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.' + // 二级域名
    '[a-z]{2,6})' + // first level domain- .com or .museum
    '(:[0-9]{1,4})?' + // 端口- :80
    '((/?)|' + // a slash isn't required if there is no file name
    "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"
  var re = new RegExp(strRegex)
  return re.test(str_url)
}

// 可以获取到bj.js中设置的函数,
var port: any = chrome.runtime.connect({ name: 'popup-channel' })

const state = reactive<{
  list: {
    url: string
    open: boolean
    script: string
    status: string
  }[]
}>({
  list: [],
})

const handleClick = () => {
  port.postMessage({ message: 'Hello Background!' })
  state.list.push({ url: '', script: '', open: true, status: '02' })
}

const handleSave = (row: any, i: number) => {
  if (row.status === '01') {
    state.list[i].status = '02'
  } else if (!state.list[i].url || !state.list[i].script) {
    alert('输入内容不能为空！')
  } else if (!isURL(state.list[i].url) || !isURL(state.list[i].script)) {
    alert('输入内容不是正确的链接！')
  } else {
    state.list[i].status = '01'
    port.postMessage({ type: 'saveData', data: state.list })
  }
}

const handleDel = (i: number) => {
  state.list.splice(i, 1)
  port.postMessage({ type: 'saveData', data: state.list })
}

onMounted(() => {
  port.onMessage.addListener(({ type, data }: any) => {
    if (type === 'getData') {
      state.list = data
    }
  })
})
</script>

<template>
  <div class="page-wrap">
    <div class="container">
      <div class="banner">
        <img :src="logoIcon" />
      </div>
      <el-button class="btn" @click="handleClick" type="primary"
        >新增</el-button
      >
      <el-table :data="state.list" stripe style="width: 100%">
        <el-table-column show-overflow-tooltip prop="url" label="网址">
          <template #default="{ row }">
            <div
              v-if="row.status === '01'"
              style="display: flex; align-items: left"
            >
              {{ row.url }}
            </div>
            <el-input v-else v-model="row.url" placeholder="网址" clearable />
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="script" label="脚本地址">
          <template #default="{ row }">
            <div
              v-if="row.status === '01'"
              style="display: flex; align-items: left"
            >
              {{ row.script }}
            </div>
            <el-input
              v-else
              v-model="row.script"
              placeholder="脚本地址"
              clearable
            />
          </template>
        </el-table-column>
        <el-table-column
          width="80"
          show-overflow-tooltip
          prop="script"
          label="是否启用"
        >
          <template #default="{ row }"
            ><el-switch
              v-model="row.open"
              inline-prompt
              active-text="是"
              inactive-text="否"
            />
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          width="160"
          prop="opt"
          label="操作"
          align="center"
        >
          <template #default="{ row, $index }">
            <el-button @click="() => handleSave(row, $index)" type="danger">{{
              row.status === '01' ? '编辑' : '保存'
            }}</el-button>
            <el-button @click="() => handleDel($index)" type="danger"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-wrap {
  background: url('@/assets/bg.jpg') 100% 100% no-repeat;
  background-size: cover;
  height: 100%;
  width: 100%;

  .container {
    padding: 16px;

    .banner {
      img {
        height: 40px;
      }
      margin-bottom: 32px;
    }

    .btn {
      margin-bottom: 32px;
    }
  }
}
</style>
