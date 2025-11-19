import { createI18n } from 'vue-i18n'

// 导入所有语言包（对应 locales 文件夹下的 json 文件）
import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import zhTw from './locales/zh-tw.json'

// i18n 核心配置
const i18n = createI18n({
    legacy: false, // 关闭 Vue2 兼容，启用 Vue3 组合式 API
    locale: localStorage.getItem('lang') || 'zh', // 默认语言（优先读本地存储，上次选的语言）
    fallbackLocale: 'en', // 翻译缺失时，默认显示英语
    globalInjection: true, // 全局注入 $t 方法，组件中直接用 {{ $t('key') }}
    messages: { // 注册所有语言包
        zh,
        en,
        ja,
        ko,
        de,
        fr,
        es,
        'zh-tw': zhTw
    }
})

export default i18n