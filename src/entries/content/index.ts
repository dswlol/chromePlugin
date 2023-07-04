console.log('hello world plugins2')
// 动态加载外部js
export function loadScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.setAttribute('crossorgin', 'anonymous')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Load script from ${url} failed`))
    script.src = url
    const head = document.head || document.getElementsByTagName('head')[0]
    ;(document.body || head).appendChild(script)
  })
}

// @param RESOURCE_LIST 外部地址集合["url"]
export function loadVoLteResourceList(RESOURCE_LIST: string[]) {
  return new Promise<void>((r) => {
    RESOURCE_LIST.reduce(
      (res, el) => res.then(() => loadScript(el)),
      Promise.resolve()
    )
      .then(() => {
        r()
      })
      .catch((error) => {
        console.error('js资源加载失败:', error.name, error.message)
        return Promise.reject(error)
      })
  })
}

chrome.runtime.onMessage.addListener(({ type, data }, sender, sendResponse) => {
  console.log(type, '接收到来自页面脚本的消息:', data)
  if (type === 'addScript' && data.length > 0) {
    console.log('接收到来自页面脚本的消息:', data)

    loadVoLteResourceList(data)

    // 发送响应消息给页面脚本
    sendResponse({ response: '收到你的消息了！' })
  }
})
