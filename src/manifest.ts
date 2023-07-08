import pkg from '../package.json'

const manifest: chrome.runtime.Manifest = {
  manifest_version: 2,
  name: '众安插件助手',
  version: pkg.version,
  description: pkg.description,
  icons: {
    '16': 'logo.png',
    '48': 'logo.png',
    '32': 'logo.png',
  },
  background: {
    scripts: ['src/entries/background/main.ts'],
    persistent: false,
  },
  browser_action: {
    default_icon: 'logo.png',
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
    'notifications',
    'tabs',
    'scripting',
    'background',
    '<all_urls>',
  ],
}

export default manifest
