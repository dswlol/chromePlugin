import pkg from '../package.json'

const manifest: chrome.runtime.Manifest = {
  manifest_version: 3,
  name: '众安插件助手',
  version: pkg.version,
  description: pkg.description,
  host_permissions: ['*://*/*'],
  background: {
    service_worker: 'src/entries/background/main.ts',
  },
  action: {
    default_icon: {
      '16': 'logo.png',
      '24': 'logo.png',
      '32': 'logo.png',
    },
    default_popup: 'src/entries/popup/index.html',
  },
  options_ui: {
    page: 'src/entries/options/index.html',
    open_in_tab: false,
  },
}

export default manifest
