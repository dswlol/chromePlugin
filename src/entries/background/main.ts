chrome.runtime.onInstalled.addListener(async () => {
  const url = chrome.runtime.getURL('src/entries/options/index.html')

  await chrome.tabs.create({ url: url })

  // console.log(`Created tab ${tab.id}`)
})

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

const sendScript = (urlSource: any, tabId: number) => {
  if (urlSource) {
    const url = new URL(urlSource)
    const pageUrl = url.host
    chrome.storage.sync.get(['dataSource', 'codeSource'], (result) => {
      // console.log('target====target111', result)
      const scriptInfo = result.dataSource
        ?.filter((item: any) => item.open && item.url.indexOf(pageUrl) !== -1)
        ?.map(({ script, codeId }: any) => {
          const temp: any = { script, code: '' }
          if (codeId && result?.codeSource && result?.codeSource?.length > 0) {
            const target = result.codeSource.find(
              (node: any) => node.id === codeId
            )
            // console.log('target====target', target)
            if (target) {
              temp.code = target.code
            }
          }
          return temp
        })
      if (scriptInfo.length > 0) {
        // console.log(scriptInfo, 'pageInfo', tabId)
        // 接收来自页面脚本的消息
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, {
            type: 'addScript',
            data: scriptInfo,
          })
        }, 1000)
      }
    })
  }
}

/**
 * 通信函数
 */
chrome.runtime.onMessage.addListener((request, sender, response) => {
  response('收到：ok')
  if (request.type === 'getData') {
    chrome.storage.sync.get(['dataSource', 'codeSource'], (result) => {
      // console.log('加载初始数据' + JSON.stringify(result))

      chrome.runtime.sendMessage(
        {
          type: request.type,
          data: result,
        },
        (response: any) => {
          console.log('popup已经收到', response, sender)
        }
      )
    })
  } else if (request.type === 'saveData') {
    chrome.storage.sync.set({ dataSource: request.data }, () => {
      // console.log('保存成功')
    })
  } else if (request.type === 'saveCode') {
    chrome.storage.sync.set({ codeSource: request.data }, () => {
      // console.log('保存成功')
    })
  } else if (request.type === 'error') {
    // chrome.notifications.create(
    //   {
    //     type: 'basic',
    //     title: '操作错误',
    //     message: request.data,
    //     iconUrl: 'logo.png',
    //   },
    //   function (notificationId) {
    //     console.log('Notification created with ID: ' + notificationId)
    //   }
    // )
  }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // console.log('akakakkonUpdated', tabId, changeInfo, tab)
  if (changeInfo.status === 'loading') {
    // 页面开始加载时的操作
  }
  if (changeInfo.status === 'complete') {
    // 页面加载完成时的操作，包括刷新
    sendScript(tab.url, tabId)
  }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, function (tab) {
    sendScript(tab.url, tabId)
  })
})
