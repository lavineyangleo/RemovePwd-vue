<script setup>
import { computed, ref } from 'vue'
import { removeRestrictions } from './processor.js'

const files = ref([])
const busy = ref(false)
const dragOver = ref(false)
const notice = ref('')
const noticeType = ref('info')
const input = ref(null)
const accepted = '.docx,.xlsx,.xlsm,.pptx'
const queueCount = computed(() => files.value.length)

function addFiles(list) {
  const incoming = [...list]
  const seen = new Set(files.value.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`))
  for (const file of incoming) {
    const id = `${file.name}:${file.size}:${file.lastModified}`
    if (!seen.has(id)) files.value.push({ id, file, status: '待处理', result: null, error: '' })
    seen.add(id)
  }
  if (incoming.length) setNotice(`已加入 ${incoming.length} 个文件。文件只在当前浏览器中处理。`, 'info')
}

function handleInput(event) {
  addFiles(event.target.files ?? [])
  event.target.value = ''
}

function handleDrop(event) {
  dragOver.value = false
  addFiles(event.dataTransfer?.files ?? [])
}

function setNotice(message, type = 'info') {
  notice.value = message
  noticeType.value = type
}

function download(item) {
  if (!item.result) return
  const url = URL.createObjectURL(item.result)
  const anchor = document.createElement('a')
  anchor.href = url
  const dot = item.file.name.lastIndexOf('.')
  anchor.download = `${item.file.name.slice(0, dot)}_removepwd${item.file.name.slice(dot)}`
  anchor.click()
  URL.revokeObjectURL(url)
}

async function processAll() {
  if (!queueCount.value || busy.value) return
  busy.value = true
  let success = 0
  for (const item of files.value) {
    if (item.result) continue
    item.status = '处理中'
    item.error = ''
    try {
      const { blob, changedCount } = await removeRestrictions(item.file)
      item.result = blob
      item.status = `完成 · 清理 ${changedCount} 处限制`
      success += 1
    } catch (error) {
      item.status = '未完成'
      item.error = error instanceof Error ? error.message : '处理失败'
    }
  }
  busy.value = false
  const failures = files.value.filter((item) => item.error).length
  setNotice(`处理结束：${success} 个成功，${failures} 个未完成。`, failures ? 'warning' : 'success')
}

function removeItem(id) {
  files.value = files.value.filter((item) => item.id !== id)
}
</script>

<template>
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="RemovePwd 首页"><span class="brand-mark">R</span><span>RemovePwd</span></a>
      <span class="top-note">浏览器本地处理 · 文件不上传</span>
    </header>

    <section class="hero">
      <div class="eyebrow"><span class="eyebrow-dot"></span> DOCUMENT PERMISSION CLEANER</div>
      <h1>让文档回到<br /><span>可编辑状态</span></h1>
      <p class="intro">移除 Office 文档中的编辑限制。选择文件后，所有处理都在你的浏览器本地完成。</p>

      <div class="privacy"><span class="lock-icon">▣</span><div><strong>你的文件留在你的设备上</strong><small>不会上传到 Netlify 或任何服务器</small></div><span class="privacy-check">✓</span></div>

      <div class="dropzone" :class="{ 'is-over': dragOver }" @click="input?.click()" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="handleDrop">
        <input ref="input" class="visually-hidden" type="file" :accept="accepted" multiple @change="handleInput" />
        <div class="upload-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" /></svg></div>
        <strong>拖放文件到这里</strong>
        <span>或者 <button class="link-button" type="button" @click.stop="input?.click()">浏览文件</button></span>
        <small>支持 DOCX、XLSX、XLSM、PPTX · 可多选</small>
      </div>

      <div v-if="notice" class="notice" :class="`notice-${noticeType}`" role="status">{{ notice }}</div>

      <section v-if="queueCount" class="queue">
        <div class="queue-heading"><h2>待处理文件 <span>{{ queueCount }}</span></h2><button class="clear-button" type="button" :disabled="busy" @click="files = []">清空列表</button></div>
        <ul>
          <li v-for="item in files" :key="item.id" class="file-row">
            <span class="file-icon">{{ item.file.name.toLowerCase().endsWith('.pptx') ? 'P' : item.file.name.toLowerCase().endsWith('.docx') ? 'W' : 'X' }}</span>
            <div class="file-meta"><strong>{{ item.file.name }}</strong><small>{{ (item.file.size / 1024 / 1024).toFixed(2) }} MB · {{ item.status }}</small><small v-if="item.error" class="error-text">{{ item.error }}</small></div>
            <button v-if="item.result" class="download-button" type="button" @click="download(item)">下载</button>
            <button v-else class="remove-button" type="button" :disabled="busy" aria-label="移除文件" @click="removeItem(item.id)">×</button>
          </li>
        </ul>
        <button class="primary-button" type="button" :disabled="busy || !files.some(item => !item.result)" @click="processAll">{{ busy ? '正在本地处理…' : '开始移除限制' }}</button>
      </section>

      <section class="limitations">
        <h2>支持范围</h2>
        <div class="format-grid">
          <div><span class="format-badge excel">X</span><span><strong>Excel</strong><small>XLSX、XLSM 工作表与工作簿保护</small></span><b>支持</b></div>
          <div><span class="format-badge powerpoint">P</span><span><strong>PowerPoint</strong><small>PPTX 修改限制</small></span><b>支持</b></div>
          <div><span class="format-badge word">W</span><span><strong>Word</strong><small>DOCX 文档编辑保护</small></span><b>支持</b></div>
          <div><span class="format-badge pdf">PDF</span><span><strong>PDF</strong><small>浏览器版暂不支持 PDF 文件</small></span><b class="muted">暂不支持</b></div>
          <div><span class="format-badge encrypted">锁</span><span><strong>需要密码才能打开的文件</strong><small>不支持解密打开密码</small></span><b class="muted">暂不支持</b></div>
        </div>
        <p>支持清除以上 Office 格式的编辑保护标记，但不会破解打开密码。请仅处理你有权修改的文档。</p>
      </section>
      <footer>RemovePwd · Vue 浏览器版 <span>文件由你的浏览器处理</span></footer>
    </section>
  </main>
</template>
