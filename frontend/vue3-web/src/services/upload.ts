// 文件上传服务，处理图片选择和Base64转换
import type { FileUploadOptions, UploadResult } from '@/types'

export class UploadService {
  private static readonly DEFAULT_OPTIONS: Required<FileUploadOptions> = {
    maxSize: 5 * 1024 * 1024, // 5MB
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  }

  /**
   * 选择图片文件
   */
  static selectImage(options: FileUploadOptions = {}): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = false

      input.onchange = (event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]
        
        if (!file) {
          resolve(null)
          return
        }

        // 检查文件大小
        const maxSize = options.maxSize || this.DEFAULT_OPTIONS.maxSize
        if (file.size > maxSize) {
          console.error(`File size ${file.size} exceeds maximum ${maxSize}`)
          resolve(null)
          return
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          console.error(`Invalid file type: ${file.type}`)
          resolve(null)
          return
        }

        resolve(file)
      }

      input.oncancel = () => resolve(null)
      input.click()
    })
  }

  /**
   * 将文件转换为Base64
   */
  static fileToBase64(file: File, options: FileUploadOptions = {}): Promise<UploadResult> {
    return new Promise((resolve) => {
      const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options }
      
      // 如果是小文件且不需要压缩，直接转换
      if (file.size <= 1024 * 1024 && mergedOptions.quality >= 1) {
        const reader = new FileReader()
        
        reader.onload = () => {
          const base64 = reader.result as string
          resolve({
            success: true,
            data: {
              base64: base64.split(',')[1], // 移除 data:image/xxx;base64, 前缀
              size: file.size,
              width: 0, // 原始文件无法直接获取尺寸
              height: 0
            }
          })
        }
        
        reader.onerror = () => {
          resolve({
            success: false,
            error: 'Failed to read file'
          })
        }
        
        reader.readAsDataURL(file)
        return
      }

      // 需要压缩的情况
      this.compressImage(file, mergedOptions)
        .then(resolve)
        .catch(error => {
          resolve({
            success: false,
            error: error.message
          })
        })
    })
  }

  /**
   * 压缩图片
   */
  private static compressImage(file: File, options: Required<FileUploadOptions>): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
          }

          // 计算新尺寸
          const { width: newWidth, height: newHeight } = this.calculateDimensions(
            img.width,
            img.height,
            options.maxWidth,
            options.maxHeight
          )

          canvas.width = newWidth
          canvas.height = newHeight

          // 绘制压缩后的图片
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // 转换为Base64
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              const reader = new FileReader()
              
              reader.onload = () => {
                const base64 = reader.result as string
                resolve({
                  success: true,
                  data: {
                    base64: base64.split(',')[1], // 移除前缀
                    size: blob.size,
                    width: newWidth,
                    height: newHeight
                  }
                })
              }
              
              reader.onerror = () => {
                reject(new Error('Failed to read compressed image'))
              }
              
              reader.readAsDataURL(blob)
            },
            'image/jpeg',
            options.quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      // 创建图片URL
      const url = URL.createObjectURL(file)
      img.src = url
      
      // 清理URL（在图片加载完成后）
      img.onload = () => {
        URL.revokeObjectURL(url)
        img.onload() // 调用原始的onload
      }
    })
  }

  /**
   * 计算压缩后的尺寸
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // 如果图片尺寸小于最大限制，保持原尺寸
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height }
    }

    // 计算缩放比例
    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    }
  }

  /**
   * 选择并处理图片（一步完成）
   */
  static async selectAndProcessImage(options: FileUploadOptions = {}): Promise<UploadResult> {
    try {
      const file = await this.selectImage(options)
      
      if (!file) {
        return {
          success: false,
          error: 'No file selected'
        }
      }

      return await this.fileToBase64(file, options)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 从URL加载图片并转换为Base64
   */
  static async urlToBase64(url: string, options: FileUploadOptions = {}): Promise<UploadResult> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to an image')
      }

      const file = new File([blob], 'image', { type: blob.type })
      return await this.fileToBase64(file, options)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load image from URL'
      }
    }
  }

  /**
   * 验证Base64图片数据
   */
  static validateBase64Image(base64: string): boolean {
    try {
      // 检查Base64格式
      if (!base64 || typeof base64 !== 'string') {
        return false
      }

      // 尝试解码
      const decoded = atob(base64)
      
      // 检查是否为图片（简单的魔数检查）
      const uint8Array = new Uint8Array(decoded.length)
      for (let i = 0; i < decoded.length; i++) {
        uint8Array[i] = decoded.charCodeAt(i)
      }

      // 检查常见图片格式的魔数
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8
      const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47
      const isGIF = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46
      const isWebP = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50

      return isJPEG || isPNG || isGIF || isWebP
    } catch (error) {
      return false
    }
  }

  /**
   * 获取Base64图片信息
   */
  static getBase64ImageInfo(base64: string): Promise<{ width: number; height: number; size: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: Math.round((base64.length * 3) / 4) // 估算文件大小
        })
      }
      
      img.onerror = () => {
        reject(new Error('Invalid image data'))
      }
      
      img.src = `data:image/jpeg;base64,${base64}`
    })
  }

  /**
   * 创建图片预览URL
   */
  static createPreviewUrl(base64: string, mimeType: string = 'image/jpeg'): string {
    return `data:${mimeType};base64,${base64}`
  }

  /**
   * 下载Base64图片
   */
  static downloadBase64Image(base64: string, filename: string = 'image.jpg', mimeType: string = 'image/jpeg'): void {
    try {
      const link = document.createElement('a')
      link.href = this.createPreviewUrl(base64, mimeType)
      link.download = filename
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }
}