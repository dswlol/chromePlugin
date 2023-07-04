chrome.runtime.onInstalled.addListener(async () => {
  const url = chrome.runtime.getURL('src/entries/options/index.html')

  const tab = await chrome.tabs.create({ url: url })

  console.log(`Created tab ${tab.id}`)
})

/**
 * 通信函数
 */
chrome.runtime.onConnect.addListener((port) => {
  console.log('Popup connected! 通信模式开启')
  // 监听Popup发送的消息
  port.onMessage.addListener(({ type, data }) => {
    if (type === 'saveData') {
      chrome.storage.local.set({ dataSource: data }).then(() => {
        console.log('Value is set')
      })
    }
    // console.log('Received message from Popup: ', type, data)
  })

  chrome.storage.local.get(['dataSource']).then((result) => {
    // console.log('加载初始数据' + result.dataSource)
    port.postMessage({
      type: 'getData',
      data: result.dataSource,
    })
  })

  // 发送消息给Popup
})

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  // console.log('New tab onActivated:', tabId)
  chrome.tabs.get(tabId, function (tab) {
    // console.log('Tab information:', tab)
    if (tab.url) {
      const pageUrl = tab.url.substring(0, tab.url.length - 1)
      // console.log('pageUrl', pageUrl)
      chrome.storage.local.get(['dataSource']).then((result) => {
        const scriptUrls = result.dataSource
          .filter((item: any) => item.open && item.url.indexOf(pageUrl) !== -1)
          .map((item: any) => item.script)
        if (scriptUrls.length > 0) {
          console.log(scriptUrls, 'pageInfo', tabId)
          // 接收来自页面脚本的消息
          chrome.tabs.sendMessage(tabId, {
            type: 'addScript',
            data: scriptUrls,
          })
          // chrome.scripting.executeScript(
          //   {
          //     target: { tabId: tabId },
          //     files: scriptUrls,
          //   },
          //   (results) => {
          //     console.log('script injected in all frames', results)
          //   }
          // )
        }
      })
    }

    // 在这里可以使用 tab 对象中的信息，例如 URL、标题等
  })
})
