/**
 * D26 图片优化的统一入口（零新增依赖）
 *
 * 三件事：
 *   1) PLACEHOLDER —— 内联 SVG 占位图，图片加载失败时立刻有东西可看，不额外发请求
 *   2) imageUrl()  —— 图片 URL 的唯一出口，将来接 CDN / OSS 只改这一个函数
 *   3) compressImage() —— 后台上传前用 canvas 压缩，别把 4MB 原图直接丢给服务器
 */

export const PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f1f3f5"/>
      <path d="M48 296l100-116 68 80 48-54 88 90z" fill="#d9dee5"/>
      <circle cx="132" cy="132" r="26" fill="#d9dee5"/>
      <text x="200" y="352" text-anchor="middle" font-size="20" fill="#9ca3af" font-family="sans-serif">图片暂时无法加载</text>
    </svg>`
  )

/**
 * 图片 URL 出口。
 * 后端已按「图片 URL 契约」返回完整 URL（见 backend/README.md），这里原样透传。
 * 接 CDN 后只改这里就能给全站图片加尺寸 / 格式参数，不用回头改十几个页面，例如：
 *   return `${url}?imageMogr2/thumbnail/${width}x/format/webp/quality/${quality}`
 * 本地后端不支持图片加工，所以现在不拼任何参数，避免产生 404 查询串。
 */
export function imageUrl(url, _opts = {}) {
  if (!url) return PLACEHOLDER
  return url
}

function loadBitmap(file) {
  // createImageBitmap 更快且不占用 DOM；老浏览器回退到 Image + objectURL
  if (typeof createImageBitmap === 'function') return createImageBitmap(file)
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl)
      reject(err)
    }
    img.src = objectUrl
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality))
}

/**
 * 上传前压缩：等比缩到 maxSide 以内 + JPEG 重编码，压不动 / 压缩后更大就还用原文件。
 * gif 不动（重编码会丢动画）；小于 minBytes 的图也不动，省一次解码。
 * 目标是稳稳落在后端 2MB 上传限制之内。
 */
export async function compressImage(file, opts = {}) {
  const {
    maxSide = 1600,
    quality = 0.82,
    maxBytes = 2 * 1024 * 1024,
    minBytes = 300 * 1024,
  } = opts

  if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file
  if (file.size <= minBytes) return file

  let bitmap
  try {
    bitmap = await loadBitmap(file)
    const bw = bitmap.naturalWidth || bitmap.width
    const bh = bitmap.naturalHeight || bitmap.height
    if (!bw || !bh) return file

    const scale = Math.min(1, maxSide / Math.max(bw, bh))
    const w = Math.max(1, Math.round(bw * scale))
    const h = Math.max(1, Math.round(bh * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    // 统一输出 JPEG：先铺白底，避免 PNG 透明区域转出来变成黑块
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(bitmap, 0, 0, w, h)

    let q = quality
    let blob = await canvasToBlob(canvas, 'image/jpeg', q)
    // 还不达标就继续降质量，最低 0.5，再压不下去交给后端拦截并提示
    while (blob && blob.size > maxBytes && q > 0.5) {
      q = Math.max(0.5, q - 0.15)
      blob = await canvasToBlob(canvas, 'image/jpeg', q)
    }
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.(jpe?g|png|webp)$/i, '.jpg')
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch (e) {
    // 压缩失败绝不阻断上传，退回到原文件
    console.warn('[image] 压缩失败，改用原文件：', e)
    return file
  } finally {
    if (bitmap && typeof bitmap.close === 'function') bitmap.close()
  }
}
