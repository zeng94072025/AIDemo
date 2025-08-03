/**
 * 專門修復下載問題的圖片處理器
 * 確保生成的圖片文件可以正常打開，解決"圖片已破損"問題
 */

class DownloadFixedImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalFile = null;
        this.originalImage = null;
        this.isLoaded = false;
        this.history = []; // 操作歷史
        this.historyIndex = -1; // 當前歷史索引
        
        console.log('DownloadFixedImageProcessor 初始化成功');
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
            
            // 創建新的 Canvas
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            // 設置 Canvas 尺寸
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            
            // 清空並繪製圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            this.isLoaded = true;
            
            // 保存初始狀態到歷史
            this.saveToHistory();
            
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

    // 從文件創建圖片元素
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

    // 保存當前狀態到歷史
    saveToHistory() {
        if (!this.isLoaded) return;
        
        try {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.history.push(imageData);
            
            // 限制歷史記錄數量
            if (this.history.length > 20) {
                this.history.shift();
            }
            
            this.historyIndex = this.history.length - 1;
        } catch (error) {
            console.error('保存歷史失敗:', error);
        }
    }

    // 撤銷操作
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
            return true;
        }
        return false;
    }

    // 重做操作
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
            return true;
        }
        return false;
    }

    // 修復版本的 Blob 生成方法
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
                
                // 重新繪製圖片確保數據完整
                this.ensureCanvasContent();
                
                // 驗證 Canvas 內容
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                const hasData = imageData.data.some(pixel => pixel !== 0);
                
                if (!hasData) {
                    reject(new Error('Canvas 沒有有效數據'));
                    return;
                }
                
                console.log('Canvas 驗證通過:', {
                    width: this.canvas.width,
                    height: this.canvas.height,
                    dataSize: imageData.data.length,
                    hasData: hasData
                });
                
                // 生成 Blob
                this.canvas.toBlob((blob) => {
                    if (blob && blob.size > 0) {
                        // 驗證 Blob 內容
                        this.validateBlob(blob).then(isValid => {
                            if (isValid) {
                                console.log('Blob 生成成功:', {
                                    size: blob.size,
                                    type: blob.type
                                });
                                resolve(blob);
                            } else {
                                reject(new Error('生成的 Blob 內容無效'));
                            }
                        }).catch(error => {
                            console.error('Blob 驗證失敗:', error);
                            reject(error);
                        });
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

    // 確保 Canvas 有正確的內容
    ensureCanvasContent() {
        if (this.originalImage) {
            // 重新繪製原始圖片
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
        }
    }

    // 驗證 Blob 內容
    validateBlob(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const arrayBuffer = e.target.result;
                    const uint8Array = new Uint8Array(arrayBuffer);
                    
                    // 檢查文件頭
                    const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
                    const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50;
                    const isWebP = uint8Array[0] === 0x52 && uint8Array[1] === 0x49;
                    
                    const isValid = isJPEG || isPNG || isWebP;
                    
                    console.log('Blob 驗證結果:', {
                        size: blob.size,
                        type: blob.type,
                        isJPEG: isJPEG,
                        isPNG: isPNG,
                        isWebP: isWebP,
                        isValid: isValid,
                        header: uint8Array.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join(' ')
                    });
                    
                    resolve(isValid);
                } catch (error) {
                    console.error('Blob 驗證過程出錯:', error);
                    reject(error);
                }
            };
            reader.onerror = function(error) {
                console.error('Blob 讀取失敗:', error);
                reject(error);
            };
            reader.readAsArrayBuffer(blob);
        });
    }

    // 修復版本的 Base64 轉換方法
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
            
            // 保存到歷史
            this.saveToHistory();
            
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
            
            // 保存到歷史
            this.saveToHistory();
            
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
                    this.applyBlurFilter(data, imageData.width, imageData.height);
                    break;
                    
                case 'sharpen':
                    this.applySharpenFilter(data, imageData.width, imageData.height);
                    break;
                    
                case 'vintage':
                    this.applyVintageFilter(data);
                    break;
                    
                case 'warm':
                    this.applyWarmFilter(data);
                    break;
                    
                case 'cool':
                    this.applyCoolFilter(data);
                    break;
                    
                default:
                    console.warn('不支持的濾鏡類型:', filterType);
                    return false;
            }
            
            // 放回圖片數據
            this.ctx.putImageData(imageData, 0, 0);
            
            // 保存到歷史
            this.saveToHistory();
            
            console.log('濾鏡應用完成:', filterType);
            return true;
            
        } catch (error) {
            console.error('應用濾鏡失敗:', error);
            return false;
        }
    }

    // 應用模糊濾鏡
    applyBlurFilter(data, width, height) {
        const tempData = new Uint8ClampedArray(data);
        const kernel = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
        const kernelSize = 3;
        const half = Math.floor(kernelSize / 2);
        
        for (let y = half; y < height - half; y++) {
            for (let x = half; x < width - half; x++) {
                let r = 0, g = 0, b = 0;
                
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const idx = ((y + ky - half) * width + (x + kx - half)) * 4;
                        r += tempData[idx] * kernel[ky][kx];
                        g += tempData[idx + 1] * kernel[ky][kx];
                        b += tempData[idx + 2] * kernel[ky][kx];
                    }
                }
                
                const idx = (y * width + x) * 4;
                data[idx] = r / 9;
                data[idx + 1] = g / 9;
                data[idx + 2] = b / 9;
            }
        }
    }

    // 應用銳化濾鏡
    applySharpenFilter(data, width, height) {
        const tempData = new Uint8ClampedArray(data);
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        const kernelSize = 3;
        const half = Math.floor(kernelSize / 2);
        
        for (let y = half; y < height - half; y++) {
            for (let x = half; x < width - half; x++) {
                let r = 0, g = 0, b = 0;
                
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const idx = ((y + ky - half) * width + (x + kx - half)) * 4;
                        r += tempData[idx] * kernel[ky][kx];
                        g += tempData[idx + 1] * kernel[ky][kx];
                        b += tempData[idx + 2] * kernel[ky][kx];
                    }
                }
                
                const idx = (y * width + x) * 4;
                data[idx] = Math.min(255, Math.max(0, r));
                data[idx + 1] = Math.min(255, Math.max(0, g));
                data[idx + 2] = Math.min(255, Math.max(0, b));
            }
        }
    }

    // 應用懷舊濾鏡
    applyVintageFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 懷舊色調調整
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189) + 20);
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168) + 10);
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131) - 10);
        }
    }

    // 應用暖色調濾鏡
    applyWarmFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.1);     // 增強紅色
            data[i + 1] = Math.min(255, data[i + 1] * 1.05); // 輕微增強綠色
            data[i + 2] = Math.max(0, data[i + 2] * 0.9);    // 減少藍色
        }
    }

    // 應用冷色調濾鏡
    applyCoolFilter(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, data[i] * 0.9);      // 減少紅色
            data[i + 1] = Math.max(0, data[i + 1] * 0.95); // 輕微減少綠色
            data[i + 2] = Math.min(255, data[i + 2] * 1.1); // 增強藍色
        }
    }

    // 應用相框
    applyFrame(frameType) {
        try {
            if (!this.isLoaded || !this.originalImage) {
                console.error('沒有載入的圖片');
                return false;
            }
            
            // 創建新的 Canvas 來添加相框
            const frameCanvas = document.createElement('canvas');
            const frameCtx = frameCanvas.getContext('2d');
            
            // 設置相框尺寸
            const frameWidth = this.canvas.width + 40;
            const frameHeight = this.canvas.height + 40;
            frameCanvas.width = frameWidth;
            frameCanvas.height = frameHeight;
            
            // 繪製相框背景
            this.drawFrameBackground(frameCtx, frameWidth, frameHeight, frameType);
            
            // 在相框中央繪製圖片
            frameCtx.drawImage(this.canvas, 20, 20);
            
            // 更新主 Canvas
            this.canvas.width = frameWidth;
            this.canvas.height = frameHeight;
            this.ctx.clearRect(0, 0, frameWidth, frameHeight);
            this.ctx.drawImage(frameCanvas, 0, 0);
            
            // 保存到歷史
            this.saveToHistory();
            
            console.log('相框應用完成:', frameType);
            return true;
            
        } catch (error) {
            console.error('應用相框失敗:', error);
            return false;
        }
    }

    // 繪製相框背景
    drawFrameBackground(ctx, width, height, frameType) {
        switch (frameType) {
            case 'classic':
                // 經典木質相框
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(10, 10, width - 20, height - 20);
                break;
                
            case 'modern':
                // 現代黑色相框
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(5, 5, width - 10, height - 10);
                break;
                
            case 'vintage':
                // 復古紋理相框
                ctx.fillStyle = '#CD853F';
                ctx.fillRect(0, 0, width, height);
                // 添加紋理效果
                for (let i = 0; i < width; i += 10) {
                    for (let j = 0; j < height; j += 10) {
                        ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3})`;
                        ctx.fillRect(i, j, 5, 5);
                    }
                }
                break;
                
            case 'elegant':
                // 優雅邊框相框
                ctx.fillStyle = '#F5F5DC';
                ctx.fillRect(0, 0, width, height);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 3;
                ctx.strokeRect(10, 10, width - 20, height - 20);
                break;
                
            case 'minimal':
                // 極簡白色相框
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.strokeStyle = '#CCCCCC';
                ctx.lineWidth = 1;
                ctx.strokeRect(15, 15, width - 30, height - 30);
                break;
                
            case 'artistic':
                // 藝術漸變相框
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#FF6B6B');
                gradient.addColorStop(0.5, '#4ECDC4');
                gradient.addColorStop(1, '#45B7D1');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                break;
                
            default:
                // 默認相框
                ctx.fillStyle = '#CCCCCC';
                ctx.fillRect(0, 0, width, height);
                break;
        }
    }

    // 重置到原始圖片
    resetToOriginal() {
        if (this.originalImage && this.isLoaded) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.originalImage, 0, 0);
            
            // 清空歷史
            this.history = [];
            this.historyIndex = -1;
            this.saveToHistory();
            
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
            isProcessed: this.history.length > 1
        };
    }

    // 獲取處理後的圖片
    getProcessedImage() {
        if (!this.isLoaded) return null;
        
        return {
            base64: this.toBase64('image/jpeg', 0.9),
            width: this.canvas.width,
            height: this.canvas.height
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
        this.isLoaded = false;
        this.history = [];
        this.historyIndex = -1;
    }
}

// 導出修復的圖片處理器
window.DownloadFixedImageProcessor = DownloadFixedImageProcessor; 