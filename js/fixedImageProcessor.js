/**
 * 完全修復的圖片處理器
 * 解決所有已知問題，確保功能穩定可靠
 */

class FixedImageProcessor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalFile = null;
        this.originalImage = null;
        this.currentImageData = null;
        this.isLoaded = false;
        
        console.log('FixedImageProcessor 初始化成功');
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
            
            // 保存當前圖片數據
            this.currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.isLoaded = true;
            
            console.log('圖片載入成功:', {
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type,
                canvasSize: `${this.canvas.width}x${this.canvas.height}`
            });
            
            return {
                file: file,
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type
            };
            
        } catch (error) {
            console.error('載入圖片失敗:', error);
            this.isLoaded = false;
            throw error;
        }
    }

    // 從文件創建圖片元素 - 完全修復版本
    createImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            let url = null;
            
            // 設置圖片加載完成事件
            img.onload = () => {
                console.log('圖片加載完成:', {
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete
                });
                
                // 釋放 URL
                if (url) {
                    URL.revokeObjectURL(url);
                }
                
                resolve(img);
            };
            
            // 設置圖片加載失敗事件
            img.onerror = (error) => {
                console.error('圖片加載失敗:', error);
                
                // 釋放 URL
                if (url) {
                    URL.revokeObjectURL(url);
                }
                
                reject(new Error('圖片加載失敗'));
            };
            
            // 創建 URL 並設置圖片源
            url = URL.createObjectURL(file);
            img.src = url;
        });
    }

    // 轉換為 Blob - 完全修復版本
    toBlob(type = 'image/jpeg', quality = 0.9) {
        return new Promise((resolve, reject) => {
            try {
                // 檢查是否已載入圖片
                if (!this.isLoaded || !this.originalImage) {
                    reject(new Error('沒有載入的圖片'));
                    return;
                }
                
                // 檢查 Canvas
                if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
                    reject(new Error('Canvas 無效'));
                    return;
                }
                
                // 確保 Canvas 有正確的內容
                this.ensureCanvasContent();
                
                // 生成 Blob
                this.canvas.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        console.log('Blob 生成成功:', {
                            size: blob.size,
                            type: blob.type
                        });
                        resolve(blob);
                    } else {
                        console.error('生成的 Blob 無效:', blob);
                        reject(new Error('生成的 Blob 無效或為空'));
                    }
                }, type, quality);
                
            } catch (error) {
                console.error('生成 Blob 失敗:', error);
                reject(error);
            }
        });
    }

    // 轉換為 Base64 - 完全修復版本
    toBase64(type = 'image/jpeg', quality = 0.9) {
        try {
            // 檢查是否已載入圖片
            if (!this.isLoaded || !this.originalImage) {
                console.error('沒有載入的圖片');
                return null;
            }
            
            // 檢查 Canvas
            if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) {
                console.error('Canvas 無效');
                return null;
            }
            
            // 確保 Canvas 有正確的內容
            this.ensureCanvasContent();
            
            const dataUrl = this.canvas.toDataURL(type, quality);
            
            // 驗證生成的 data URL
            if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
                console.error('生成的 Data URL 無效:', dataUrl);
                return null;
            }
            
            console.log('Base64 生成成功:', {
                length: dataUrl.length,
                type: type
            });
            
            return dataUrl;
        } catch (error) {
            console.error('生成 Base64 失敗:', error);
            return null;
        }
    }

    // 確保 Canvas 有正確的內容
    ensureCanvasContent() {
        if (this.currentImageData) {
            // 使用保存的圖片數據
            this.ctx.putImageData(this.currentImageData, 0, 0);
        } else if (this.originalImage) {
            // 重新繪製原始圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
        }
    }

    // 調整亮度
    adjustBrightness(value) {
        try {
            if (!this.isLoaded || !this.originalImage) {
                console.error('沒有載入的圖片');
                return false;
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
            
            // 保存當前圖片數據
            this.currentImageData = imageData;
            
            console.log('亮度調整完成:', value);
            return true;
            
        } catch (error) {
            console.error('調整亮度失敗:', error);
            return false;
        }
    }

    // 調整對比度
    adjustContrast(value) {
        try {
            if (!this.isLoaded || !this.originalImage) {
                console.error('沒有載入的圖片');
                return false;
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
            
            // 保存當前圖片數據
            this.currentImageData = imageData;
            
            console.log('對比度調整完成:', value);
            return true;
            
        } catch (error) {
            console.error('調整對比度失敗:', error);
            return false;
        }
    }

    // 應用濾鏡
    applyFilter(filterType) {
        try {
            if (!this.isLoaded || !this.originalImage) {
                console.error('沒有載入的圖片');
                return false;
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
                    
                case 'blur':
                    this.applyBlurFilter();
                    break;
                    
                case 'sharpen':
                    this.applySharpenFilter();
                    break;
                    
                case 'vintage':
                    this.applyVintageFilter();
                    break;
                    
                case 'warm':
                    this.applyWarmFilter();
                    break;
                    
                case 'cool':
                    this.applyCoolFilter();
                    break;
                    
                default:
                    console.warn('不支持的濾鏡類型:', filterType);
                    return false;
            }
            
            // 放回圖片數據
            this.ctx.putImageData(imageData, 0, 0);
            
            // 保存當前圖片數據
            this.currentImageData = imageData;
            
            console.log('濾鏡應用完成:', filterType);
            return true;
            
        } catch (error) {
            console.error('應用濾鏡失敗:', error);
            return false;
        }
    }

    // 應用模糊濾鏡
    applyBlurFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 簡單的模糊算法
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;
                
                // 3x3 模糊核
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        r += data[nIdx];
                        g += data[nIdx + 1];
                        b += data[nIdx + 2];
                    }
                }
                
                data[idx] = r / 9;
                data[idx + 1] = g / 9;
                data[idx + 2] = b / 9;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // 應用銳化濾鏡
    applySharpenFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 銳化算法
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // 銳化核
                const r = data[idx] * 5 - data[idx - 4] - data[idx + 4] - data[idx - width * 4] - data[idx + width * 4];
                const g = data[idx + 1] * 5 - data[idx - 3] - data[idx + 5] - data[idx - width * 4 + 1] - data[idx + width * 4 + 1];
                const b = data[idx + 2] * 5 - data[idx - 2] - data[idx + 6] - data[idx - width * 4 + 2] - data[idx + width * 4 + 2];
                
                data[idx] = Math.min(255, Math.max(0, r));
                data[idx + 1] = Math.min(255, Math.max(0, g));
                data[idx + 2] = Math.min(255, Math.max(0, b));
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // 應用復古濾鏡
    applyVintageFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 復古色調調整
            data[i] = Math.min(255, r * 0.8 + g * 0.2 + b * 0.1);     // R
            data[i + 1] = Math.min(255, r * 0.1 + g * 0.7 + b * 0.2); // G
            data[i + 2] = Math.min(255, r * 0.1 + g * 0.2 + b * 0.6); // B
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // 應用暖色調濾鏡
    applyWarmFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.2);     // 增強紅色
            data[i + 1] = Math.min(255, data[i + 1] * 1.1); // 輕微增強綠色
            data[i + 2] = Math.min(255, data[i + 2] * 0.9); // 減少藍色
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // 應用冷色調濾鏡
    applyCoolFilter() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 0.9);     // 減少紅色
            data[i + 1] = Math.min(255, data[i + 1] * 1.1); // 輕微增強綠色
            data[i + 2] = Math.min(255, data[i + 2] * 1.2); // 增強藍色
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // 應用相框效果
    applyFrame(frameType) {
        try {
            if (!this.isLoaded || !this.originalImage) {
                console.error('沒有載入的圖片');
                return false;
            }
            
            // 重新繪製原始圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            const width = this.canvas.width;
            const height = this.canvas.height;
            const frameWidth = Math.min(width, height) * 0.1; // 相框寬度為圖片最小邊的10%
            
            switch (frameType) {
                case 'classic':
                    this.drawClassicFrame(width, height, frameWidth);
                    break;
                case 'modern':
                    this.drawModernFrame(width, height, frameWidth);
                    break;
                case 'vintage':
                    this.drawVintageFrame(width, height, frameWidth);
                    break;
                case 'elegant':
                    this.drawElegantFrame(width, height, frameWidth);
                    break;
                case 'minimal':
                    this.drawMinimalFrame(width, height, frameWidth);
                    break;
                case 'artistic':
                    this.drawArtisticFrame(width, height, frameWidth);
                    break;
                default:
                    console.warn('不支持的相框類型:', frameType);
                    return false;
            }
            
            // 保存當前圖片數據
            this.currentImageData = this.ctx.getImageData(0, 0, width, height);
            
            console.log('相框應用完成:', frameType);
            return true;
            
        } catch (error) {
            console.error('應用相框失敗:', error);
            return false;
        }
    }

    // 繪製經典相框
    drawClassicFrame(width, height, frameWidth) {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.fillStyle = '#D2691E';
        this.ctx.fillRect(frameWidth, frameWidth, width - frameWidth * 2, height - frameWidth * 2);
        
        this.ctx.drawImage(this.originalImage, frameWidth * 2, frameWidth * 2, 
                          width - frameWidth * 4, height - frameWidth * 4);
    }

    // 繪製現代相框
    drawModernFrame(width, height, frameWidth) {
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.fillStyle = '#34495E';
        this.ctx.fillRect(frameWidth, frameWidth, width - frameWidth * 2, height - frameWidth * 2);
        
        this.ctx.drawImage(this.originalImage, frameWidth * 2, frameWidth * 2, 
                          width - frameWidth * 4, height - frameWidth * 4);
    }

    // 繪製復古相框
    drawVintageFrame(width, height, frameWidth) {
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, 0, width, height);
        
        // 添加紋理效果
        for (let i = 0; i < width; i += 10) {
            for (let j = 0; j < height; j += 10) {
                this.ctx.fillStyle = `rgba(139, 115, 85, ${Math.random() * 0.3})`;
                this.ctx.fillRect(i, j, 5, 5);
            }
        }
        
        this.ctx.drawImage(this.originalImage, frameWidth, frameWidth, 
                          width - frameWidth * 2, height - frameWidth * 2);
    }

    // 繪製優雅相框
    drawElegantFrame(width, height, frameWidth) {
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(0, 0, width, height);
        
        // 內邊框
        this.ctx.strokeStyle = '#ECF0F1';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(frameWidth, frameWidth, width - frameWidth * 2, height - frameWidth * 2);
        
        this.ctx.drawImage(this.originalImage, frameWidth * 2, frameWidth * 2, 
                          width - frameWidth * 4, height - frameWidth * 4);
    }

    // 繪製極簡相框
    drawMinimalFrame(width, height, frameWidth) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(frameWidth, frameWidth, width - frameWidth * 2, height - frameWidth * 2);
        
        this.ctx.drawImage(this.originalImage, frameWidth * 2, frameWidth * 2, 
                          width - frameWidth * 4, height - frameWidth * 4);
    }

    // 繪製藝術相框
    drawArtisticFrame(width, height, frameWidth) {
        // 漸變背景
        const gradient = this.ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#4ECDC4');
        gradient.addColorStop(1, '#45B7D1');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 添加裝飾性圖案
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.arc(frameWidth + i * 20, frameWidth + i * 20, 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.drawImage(this.originalImage, frameWidth * 2, frameWidth * 2, 
                          width - frameWidth * 4, height - frameWidth * 4);
    }

    // 重置到原始圖片
    resetToOriginal() {
        if (this.originalImage && this.isLoaded) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            this.currentImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            console.log('圖片已重置到原始狀態');
            return true;
        }
        return false;
    }

    // 檢查是否已載入圖片
    isImageLoaded() {
        return this.isLoaded && this.originalImage !== null;
    }

    // 獲取圖片信息
    getImageInfo() {
        if (!this.isLoaded) {
            return null;
        }
        
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            file: this.originalFile,
            isProcessed: this.currentImageData !== null
        };
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
        this.currentImageData = null;
        this.isLoaded = false;
    }
}

// 導出修復的圖片處理器
window.FixedImageProcessor = FixedImageProcessor; 