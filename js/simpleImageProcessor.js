/**
 * 簡單可靠的圖片處理器
 * 徹底解決圖片破損問題
 */

class SimpleImageProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalFile = null;
        this.originalImage = null;
        
        console.log('SimpleImageProcessor 初始化成功');
    }

    // 載入圖片
    async loadImage(file) {
        try {
            console.log('開始載入圖片:', file.name);
            
            this.originalFile = file;
            
            // 創建圖片元素
            const img = await this.createImageFromFile(file);
            
            // 保存原始圖片
            this.originalImage = img;
            
            // 設置 Canvas 尺寸
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            
            // 清空並繪製圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            console.log('圖片載入成功:', {
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type
            });
            
            return {
                file: file,
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type
            };
            
        } catch (error) {
            console.error('載入圖片失敗:', error);
            throw error;
        }
    }

    // 從文件創建圖片元素
    createImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log('圖片加載完成:', {
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete
                });
                resolve(img);
            };
            
            img.onerror = () => {
                console.error('圖片加載失敗');
                reject(new Error('圖片加載失敗'));
            };
            
            // 創建 URL
            const url = URL.createObjectURL(file);
            img.src = url;
            
            // 圖片加載完成後釋放 URL
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
        });
    }

    // 轉換為 Blob
    toBlob(type = 'image/jpeg', quality = 0.9) {
        return new Promise((resolve, reject) => {
            try {
                // 檢查 Canvas
                if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
                    reject(new Error('Canvas 無效'));
                    return;
                }
                
                // 檢查是否有圖片內容
                if (!this.originalImage) {
                    reject(new Error('沒有載入的圖片'));
                    return;
                }
                
                // 重新繪製圖片確保內容正確
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.originalImage, 0, 0);
                
                // 生成 Blob
                this.canvas.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        console.log('Blob 生成成功:', {
                            size: blob.size,
                            type: blob.type
                        });
                        resolve(blob);
                    } else {
                        reject(new Error('生成的 Blob 無效'));
                    }
                }, type, quality);
                
            } catch (error) {
                console.error('生成 Blob 失敗:', error);
                reject(error);
            }
        });
    }

    // 轉換為 Base64
    toBase64(type = 'image/jpeg', quality = 0.9) {
        try {
            if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
                console.error('Canvas 無效');
                return '';
            }
            
            if (!this.originalImage) {
                console.error('沒有載入的圖片');
                return '';
            }
            
            // 重新繪製圖片確保內容正確
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            const dataUrl = this.canvas.toDataURL(type, quality);
            console.log('Base64 生成成功:', {
                length: dataUrl.length,
                type: type
            });
            
            return dataUrl;
        } catch (error) {
            console.error('生成 Base64 失敗:', error);
            return '';
        }
    }

    // 調整亮度
    adjustBrightness(value) {
        try {
            if (!this.originalImage) {
                console.error('沒有載入的圖片');
                return;
            }
            
            // 重新繪製原始圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 獲取圖片數據
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // 調整亮度
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, data[i] + value));     // R
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value)); // G
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value)); // B
            }
            
            // 放回圖片數據
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('亮度調整完成:', value);
            
        } catch (error) {
            console.error('調整亮度失敗:', error);
        }
    }

    // 調整對比度
    adjustContrast(value) {
        try {
            if (!this.originalImage) {
                console.error('沒有載入的圖片');
                return;
            }
            
            // 重新繪製原始圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 獲取圖片數據
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            const factor = (259 * (value + 255)) / (255 * (259 - value));
            
            // 調整對比度
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // R
                data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
                data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
            }
            
            // 放回圖片數據
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('對比度調整完成:', value);
            
        } catch (error) {
            console.error('調整對比度失敗:', error);
        }
    }

    // 應用濾鏡
    applyFilter(filterType) {
        try {
            if (!this.originalImage) {
                console.error('沒有載入的圖片');
                return;
            }
            
            // 重新繪製原始圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 獲取圖片數據
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // 應用濾鏡
            switch (filterType) {
                case 'grayscale':
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        data[i] = gray;     // R
                        data[i + 1] = gray; // G
                        data[i + 2] = gray; // B
                    }
                    break;
                    
                case 'sepia':
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
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i];     // R
                        data[i + 1] = 255 - data[i + 1]; // G
                        data[i + 2] = 255 - data[i + 2]; // B
                    }
                    break;
                    
                default:
                    console.warn('不支持的濾鏡類型:', filterType);
                    return;
            }
            
            // 放回圖片數據
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('濾鏡應用完成:', filterType);
            
        } catch (error) {
            console.error('應用濾鏡失敗:', error);
        }
    }

    // 重置到原始圖片
    resetToOriginal() {
        if (this.originalImage) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            console.log('圖片已重置到原始狀態');
        }
    }

    // 銷毀處理器
    destroy() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
        this.originalFile = null;
        this.originalImage = null;
    }
}

// 導出簡單圖片處理器
window.SimpleImageProcessor = SimpleImageProcessor; 