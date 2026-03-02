/**
 * 富文本内容格式化，供 UniApp 小程序 rich-text 的 nodes 使用
 * 用法：在 UniApp 项目中复制此文件到 utils/formatRichText.js，然后：
 *   import { formatRichTextNodes } from '@/utils/formatRichText'
 *   const html = formatRichTextNodes(apiData.user_agreement)
 *   <rich-text :nodes="html" class="richtext-content" />
 *
 * 支持：
 * 1. 纯文本（含 \n）→ 转成带换行的 HTML，并带上基础样式
 * 2. 已是 HTML 的字符串 → 仅把 \n 转为 <br/>，保留原有标签和样式
 */

/**
 * 判断字符串是否已包含 HTML 标签
 * @param {string} str
 * @returns {boolean}
 */
function isHTMLString(str) {
  if (!str || typeof str !== 'string') return false
  return /<[a-z][\s\S]*>/i.test(str.trim())
}

/**
 * 转义 HTML 特殊字符，防止纯文本中的 < > & 破坏节点结构
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 将后台返回的 user_agreement / about_us 等字段转为 rich-text 可用的 HTML
 * - 纯文本：\n → <br/>，并包一层带样式的 div，便于小程序解析样式
 * - 已是 HTML：只做 \n → <br/>，不破坏原有标签
 *
 * @param {string} content 接口返回的原文（可能带 \n 或已是 HTML）
 * @returns {string} 适合 <rich-text :nodes="..." /> 的 HTML 字符串
 */
export function formatRichTextNodes(content) {
  if (content == null || typeof content !== 'string') return ''
  const trimmed = content.trim()
  if (!trimmed) return ''

  const withBreaks = trimmed.replace(/\n/g, '<br/>')

  if (isHTMLString(trimmed)) {
    return withBreaks
  }

  const paragraphs = trimmed.split(/\n/)
  const escapedParts = paragraphs.map((p) => escapeHTML(p))
  const withBreaksEscaped = escapedParts.join('<br/>')
  return `<div style="font-size: 14px; line-height: 1.6; color: #333;">${withBreaksEscaped}</div>`
}
