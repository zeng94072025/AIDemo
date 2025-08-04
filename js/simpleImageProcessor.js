/**
 * 简单可靠的图片处理器
 * 彻底解决图片破损问题
 * 
 * 功能特性：
 * - 支持多种图片格式加载和处理
 * - 提供亮度、对比度调整功能
 * - 支持黑白、复古、反转等滤镜效果
 * - 安全的Canvas操作，避免内存泄漏
 * - 完整的错误处理和状态管理
 */

class SimpleImageProcessor {
    /**
     * 构造函数 - 初始化图片处理器
     * 创建Canvas元素和2D绘图上下文
     */
    constructor() {
        // 创建Canvas元素用于图片处理
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 存储原始文件对象
        this.originalFile = null;
        
        // 存储原始图片对象
        this.originalImage = null;
        
        console.log('SimpleImageProcessor 初始化成功');
    }

    /**
     * 加载图片文件
     * @param {File} file - 要加载的图片文件
     * @returns {Promise<Object>} 返回图片信息对象
     */
    async loadImage(file) {
        try {
            console.log('开始加载图片:', file.name);
            
            // 保存原始文件引用
            this.originalFile = file;
            
            // 创建图片元素并等待加载完成
            const img = await this.createImageFromFile(file);
            
            // 保存原始图片对象
            this.originalImage = img;
            
            // 设置Canvas尺寸与图片一致
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            
            // 清空Canvas并绘制原始图片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            console.log('图片加载成功:', {
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type
            });
            
            // 返回图片信息
            return {
                file: file,
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type
            };
            
        } catch (error) {
            console.error('加载图片失败:', error);
            throw error;
        }
    }

    /**
     * 从文件创建图片元素
     * @param {File} file - 图片文件
     * @returns {Promise<HTMLImageElement>} 返回加载完成的图片元素
     */
    createImageFromFile(file) {
        return new Promise((resolve, reject) => {
            // 创建新的图片对象
            const img = new Image();
            
            // 图片加载成功回调
            img.onload = () => {
                console.log('图片加载完成:', {
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete
                });
                resolve(img);
            };
            
            // 图片加载失败回调
            img.onerror = () => {
                console.error('图片加载失败');
                reject(new Error('图片加载失败'));
            };
            
            // 创建文件URL
            const url = URL.createObjectURL(file);
            img.src = url;
            
            // 图片加载完成后释放URL，避免内存泄漏
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
        });
    }

    /**
     * 将Canvas内容转换为Blob对象
     * @param {string} type - 图片格式，默认为'image/jpeg'
     * @param {number} quality - 图片质量，范围0-1，默认为0.9
     * @returns {Promise<Blob>} 返回Blob对象
     */
    toBlob(type = 'image/jpeg', quality = 0.9) {
        return new Promise((resolve, reject) => {
            try {
                // 检查Canvas是否有效
                if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
                    reject(new Error('Canvas 无效'));
                    return;
                }
                
                // 检查是否有加载的图片
                if (!this.originalImage) {
                    reject(new Error('没有加载的图片'));
                    return;
                }
                
                // 重新绘制图片确保内容正确
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.originalImage, 0, 0);
                
                // 生成Blob对象
                this.canvas.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        console.log('Blob 生成成功:', {
                            size: blob.size,
                            type: blob.type
                        });
                        resolve(blob);
                    } else {
                        reject(new Error('生成的 Blob 无效'));
                    }
                }, type, quality);
                
            } catch (error) {
                console.error('生成 Blob 失败:', error);
                reject(error);
            }
        });
    }

    /**
     * 将Canvas内容转换为Base64字符串
     * @param {string} type - 图片格式，默认为'image/jpeg'
     * @param {number} quality - 图片质量，范围0-1，默认为0.9
     * @returns {string} 返回Base64字符串
     */
    toBase64(type = 'image/jpeg', quality = 0.9) {
        try {
            // 检查Canvas是否有效
            if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
                console.error('Canvas 无效');
                return '';
            }
            
            // 检查是否有加载的图片
            if (!this.originalImage) {
                console.error('没有加载的图片');
                return '';
            }
            
            // 重新绘制图片确保内容正确
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 生成Base64字符串
            const dataUrl = this.canvas.toDataURL(type, quality);
            console.log('Base64 生成成功:', {
                length: dataUrl.length,
                type: type
            });
            
            return dataUrl;
        } catch (error) {
            console.error('生成 Base64 失败:', error);
            return '';
        }
    }

    /**
     * 调整图片亮度
     * @param {number} value - 亮度调整值，正数增加亮度，负数减少亮度
     */
    adjustBrightness(value) {
        try {
            // 检查是否有加载的图片
            if (!this.originalImage) {
                console.error('没有加载的图片');
                return;
            }
            
            // 重新绘制原始图片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 获取图片像素数据
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // 调整每个像素的RGB值来改变亮度
            for (let i = 0; i < data.length; i += 4) {
                // 红色通道
                data[i] = Math.min(255, Math.max(0, data[i] + value));
                // 绿色通道
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
                // 蓝色通道
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
                // Alpha通道保持不变
            }
            
            // 将修改后的像素数据放回Canvas
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('亮度调整完成:', value);
            
        } catch (error) {
            console.error('调整亮度失败:', error);
        }
    }

    /**
     * 调整图片对比度
     * @param {number} value - 对比度调整值，范围-255到255
     */
    adjustContrast(value) {
        try {
            // 检查是否有加载的图片
            if (!this.originalImage) {
                console.error('没有加载的图片');
                return;
            }
            
            // 重新绘制原始图片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 获取图片像素数据
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // 计算对比度因子
            const factor = (259 * (value + 255)) / (255 * (259 - value));
            
            // 调整每个像素的RGB值来改变对比度
            for (let i = 0; i < data.length; i += 4) {
                // 红色通道
                data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                // 绿色通道
                data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
                // 蓝色通道
                data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
                // Alpha通道保持不变
            }
            
            // 将修改后的像素数据放回Canvas
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('对比度调整完成:', value);
            
        } catch (error) {
            console.error('调整对比度失败:', error);
        }
    }

    /**
     * 应用滤镜效果
     * @param {string} filterType - 滤镜类型：'grayscale'|'sepia'|'invert'
     */
    applyFilter(filterType) {
        try {
            // 检查是否有加载的图片
            if (!this.originalImage) {
                console.error('没有加载的图片');
                return;
            }
            
            // 重新绘制原始图片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 获取图片像素数据
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // 根据滤镜类型处理像素
            switch (filterType) {
                case 'grayscale':
                    // 黑白滤镜：将RGB值转换为灰度值
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        data[i] = gray;     // R
                        data[i + 1] = gray; // G
                        data[i + 2] = gray; // B
                    }
                    break;
                    
                case 'sepia':
                    // 复古滤镜：应用棕褐色调
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        
                        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));     // R
                        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); // G
                        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131)); // B
                    }
                    break;
                    
                case 'invert':
                    // 反转滤镜：将颜色值反转
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i];     // R
                        data[i + 1] = 255 - data[i + 1]; // G
                        data[i + 2] = 255 - data[i + 2]; // B
                    }
                    break;
                    
                default:
                    console.warn('不支持的滤镜类型:', filterType);
                    return;
            }
            
            // 将修改后的像素数据放回Canvas
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('滤镜应用完成:', filterType);
            
        } catch (error) {
            console.error('应用滤镜失败:', error);
        }
    }

    /**
     * 重置到原始图片状态
     * 清除所有处理效果，恢复到原始图片
     */
    resetToOriginal() {
        if (this.originalImage) {
            // 清空Canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // 重新绘制原始图片
            this.ctx.drawImage(this.originalImage, 0, 0);
            console.log('图片已重置到原始状态');
        }
    }

    /**
     * 销毁处理器
     * 清理资源，避免内存泄漏
     */
    destroy() {
        // 移除Canvas元素
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
        
        // 清理引用
        this.originalFile = null;
        this.originalImage = null;
    }
}

// 导出简单图片处理器到全局作用域
window.SimpleImageProcessor = SimpleImageProcessor; 