import pkg from '../package.json'

const manifest: chrome.runtime.Manifest = {
  manifest_version: 3,
  name: '众安插件助手',
  version: pkg.version,
  description: pkg.description,
  host_permissions: ['*://*/*'],
  icons: {
    '16': 'logo.png',
    '48': 'logo.png',
    '32': 'logo.png',
  },
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
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/entries/content/index.ts'],
    },
  ],
  options_ui: {
    page: 'src/entries/options/index.html',
    open_in_tab: false,
  },
  permissions: [
    'storage',
    'tabs',
    'scripting',
    'background',
    '<all_urls>',
    'https://cdn.jsdelivr.net',
  ],
}

export default manifest
