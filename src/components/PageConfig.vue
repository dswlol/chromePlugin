<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
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
function uuid() {
  var s: any = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substring(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substring((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  var uuid = s.join('')
  return uuid
}

interface List {
  url: string
  open: boolean
  script: string
  status: string
  codeId: string
}

interface CodeList {
  code: string
  name: string
  open: boolean
  id: string
  status: string
}

const state = reactive<{
  list: List[]
  codeList: CodeList[]
  activeName: string
}>({
  list: [],
  codeList: [],
  activeName: 'first',
})

const handleClick = () => {
  state.list.push({ url: '', script: '', codeId: '', open: true, status: '02' })
}

const handleClickCode = () => {
  state.codeList.push(
    state.codeList.length !== 0
      ? {
          id: uuid(),
          name: `自定义${state.codeList.length + 1}`,
          open: true,
          code: '',
          status: '02',
        }
      : {
          id: uuid(),
          status: '02',
          open: true,
          name: 'pageSpy',
          code: `if (window.PageSpy) {
    new window.PageSpy()
}`,
        }
  )
}

const saveData = (data: any[], type = 'saveData') => {
  chrome.runtime.sendMessage({ type, data }, (response: any) => {
    console.log('收到返回值了', response)
  })
}

const errorMessage = (data: string) => {
  // console.log(data, 'datadata')
  alert(data)
  // chrome.runtime.sendMessage({ type: 'error', data }, (response: any) => {
  //   console.log('收到返回值了', response)
  // })
}

const handleOptions = (row: any, i: number) => {
  if (row.status === '01') {
    state.codeList[i].status = '02'
  } else if (!row.name) {
    errorMessage('输入脚本名称不能为空！')
  } else {
    state.codeList[i].status = '01'
    saveData(state.codeList, 'saveCode')
  }
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
    saveData(state.list)
  }
}

const handleDel = (i: number, type = 'list') => {
  if (type === 'list') {
    state.list.splice(i, 1)
    saveData(state.list)
  } else if (type === 'code') {
    state.codeList.splice(i, 1)
    saveData(state.codeList, 'saveCode')
  }
}

const codeEnum = computed(() => {
  return state.codeList.filter((item: CodeList) => {
    return item.open
  })
})

onMounted(() => {
  chrome.runtime.sendMessage({ type: 'getData' }, () => {
    // console.log('收到返回值了', response)
  })
  chrome.runtime.onMessage.addListener((request, sender, response) => {
    console.log(request, 'request--popup===', sender)
    response('popup:ok')
    if (request.type === 'getData') {
      state.list = request?.data?.dataSource || []
      state.codeList = request?.data?.codeSource || []
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
      <el-tabs v-model="state.activeName" class="demo-tabs">
        <el-tab-pane label="脚本列表" name="first"
          ><el-button class="btn" @click="handleClick" type="primary"
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
                <el-input
                  v-else
                  v-model="row.url"
                  placeholder="网址"
                  clearable
                />
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="script"
              label="脚本地址"
            >
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
              width="160"
              show-overflow-tooltip
              prop="codeId"
              label="执行脚本"
            >
              <template #default="{ row }">
                <el-select
                  v-model="row.codeId"
                  clearable
                  placeholder="请选择执行脚本"
                  :disabled="row.status === '01'"
                >
                  <el-option
                    v-for="item in codeEnum"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
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
                  :disabled="row.status === '01'"
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
                <el-button
                  @click="() => handleSave(row, $index)"
                  type="danger"
                  >{{ row.status === '01' ? '编辑' : '保存' }}</el-button
                >
                <el-button @click="() => handleDel($index)" type="danger"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="配置代码" name="second">
          <el-button class="btn" @click="handleClickCode" type="primary"
            >新增</el-button
          >
          <div class="cards-wrap">
            <el-card
              v-for="(item, i) in state.codeList"
              :key="item.id"
              class="card-wrap"
              shadow="always"
            >
              <template #header>
                <div class="card-header">
                  <span v-if="item.status === '01'">{{ item.name }}</span>
                  <el-input
                    v-else
                    class="item-name"
                    maxlength="10"
                    v-model="item.name"
                    placeholder="请输入代码名称"
                    clearable
                  />
                  <el-switch
                    v-model="item.open"
                    inline-prompt
                    :disabled="item.status === '01'"
                    active-text="是"
                    inactive-text="否"
                  />
                </div>
              </template>
              <el-input
                v-model="item.code"
                maxlength="500"
                :rows="5"
                :disabled="item.status === '01'"
                placeholder="请输入代码"
                show-word-limit
                type="textarea"
              />
              <div class="footer-btn">
                <el-button type="primary" @click="handleOptions(item, i)">{{
                  item.status === '01' ? '编辑' : '保存'
                }}</el-button>
                <el-button @click="() => handleDel(i, 'code')" type="danger"
                  >删除</el-button
                >
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
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

    .cards-wrap {
      display: flex;
      flex-wrap: wrap;
      max-height: 400px;
      overflow-y: auto;
      .card-wrap {
        width: 47%;
        margin: 0 20px 20px 0;

        .card-header {
          display: flex;
          justify-content: space-between;

          .item-name {
            width: 200px;
          }
        }

        .footer-btn {
          margin-top: 10px;
          .btn {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>
