import { strFromU8, strToU8, unzipSync, zipSync } from '../public/vendor/fflate-0.8.2.js'

const supported = new Set(['xlsx', 'xlsm', 'pptx'])
const extensionOf = (name) => name.split('.').pop()?.toLowerCase() ?? ''

function removeProtectionXml(xml, extension, path) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error(`XML 解析失败：${path}`)
  let targets = []
  if (extension === 'xlsx' || extension === 'xlsm') {
    if (!path.endsWith('.xml') || !/(^|\/)(xl\/worksheets\/|xl\/workbook\.xml$)/i.test(path)) return { changed: false, content: xml }
    targets = [...doc.getElementsByTagName('*')].filter((node) => ['sheetProtection', 'workbookProtection'].includes(node.localName))
  } else if (extension === 'pptx') {
    if (!path.endsWith('.xml') || /(^|\/)(ppt\/slides\/|ppt\/slideLayouts\/|ppt\/slideMasters\/)/i.test(path)) return { changed: false, content: xml }
    targets = [...doc.getElementsByTagName('*')].filter((node) => node.localName === 'modifyVerifier')
  }
  for (const node of targets) node.parentNode?.removeChild(node)
  if (!targets.length) return { changed: false, content: xml }
  return { changed: true, content: new XMLSerializer().serializeToString(doc) }
}

export async function removeRestrictions(file) {
  const extension = extensionOf(file.name)
  if (!supported.has(extension)) throw new Error('仅支持 XLSX、XLSM 和 PPTX。')
  let archive
  try { archive = unzipSync(new Uint8Array(await file.arrayBuffer())) }
  catch { throw new Error('文件不是有效的 Office Open XML 压缩包，或文件已加密。') }
  let changedCount = 0
  for (const [path, bytes] of Object.entries(archive)) {
    if (path.endsWith('/')) continue
    const result = removeProtectionXml(strFromU8(bytes), extension, path)
    if (result.changed) { archive[path] = strToU8(result.content); changedCount += 1 }
  }
  if (!changedCount) throw new Error('没有找到可移除的编辑限制，文件可能没有此类保护，或使用了加密密码。')
  const output = zipSync(archive, { level: 6 })
  return { blob: new Blob([output], { type: file.type || 'application/octet-stream' }), changedCount }
}
