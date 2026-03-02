/**
 * 富文本内容格式化，供 UniApp 小程序 rich-text 的 nodes 使用
 * 支持：纯文本（\n → <br/>）+ 已是 HTML 的字符串
 */

function isHTMLString(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(str.trim());
}

function escapeHTML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 将后台返回的 user_agreement / about_us 等转为 rich-text 可用的 HTML
 */
export function formatRichTextNodes(content: string | null | undefined): string {
  if (content == null || typeof content !== 'string') return '';
  const trimmed = content.trim();
  if (!trimmed) return '';

  const withBreaks = trimmed.replace(/\n/g, '<br/>');

  if (isHTMLString(trimmed)) {
    return withBreaks;
  }

  const paragraphs = trimmed.split(/\n/);
  const escapedParts = paragraphs.map((p) => escapeHTML(p));
  const withBreaksEscaped = escapedParts.join('<br/>');
  return `<div style="font-size: 14px; line-height: 1.6; color: #333;">${withBreaksEscaped}</div>`;
}
