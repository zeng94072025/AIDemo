/**
 * 圖片處理器
 * 負責所有圖片處理和優化功能
 */

class ImageProcessor {
    constructor() {
        this.canvas = document.getElementById('hiddenCanvas');
        if (!this.canvas) {
            console.error('找不到 hiddenCanvas 元素');
            throw new Error('Canvas 元素未找到');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('無法獲取 Canvas 2D 上下文');
            throw new Error('Canvas 2D 上下文獲取失敗');
        }
        
        this.currentImage = null;
        this.originalImage = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 20;
        
        console.log('ImageProcessor 初始化成功');
    }

    // 初始化圖片
    async loadImage(file) {
        try {
            console.log('ImageProcessor.loadImage 開始:', file.name);
            
            const base64 = await Utils.fileToBase64(file);
            console.log('文件轉換為 Base64 成功');
            
            const img = await Utils.createImageElement(base64);
            console.log('創建圖片元素成功:', {
                imgWidth: img.width,
                imgHeight: img.height
            });
            
            this.originalImage = {
                file: file,
                base64: base64,
                width: img.width,
                height: img.height,
                type: file.type
            };
            
            this.currentImage = Utils.deepClone(this.originalImage);
            this.setupCanvas(img.width, img.height);
            this.drawImage(img);
            
            // 確保 Canvas 有內容
            const canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            console.log('Canvas 數據檢查:', {
                canvasWidth: this.canvas.width,
                canvasHeight: this.canvas.height,
                dataLength: canvasData.data.length,
                hasData: canvasData.data.some(pixel => pixel !== 0)
            });
            
            this.addToHistory('載入圖片', this.currentImage);
            
            console.log('ImageProcessor.loadImage 完成');
            return this.currentImage;
        } catch (error) {
            console.error('載入圖片失敗:', error);
            throw error;
        }
    }

    // 設置Canvas尺寸
    setupCanvas(width, height) {
        console.log('設置 Canvas 尺寸:', { width, height });
        this.canvas.width = width;
        this.canvas.height = height;
    }

    // 繪製圖片到Canvas
    drawImage(img) {
        console.log('繪製圖片到 Canvas:', {
            imgWidth: img.width,
            imgHeight: img.height,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        });
        
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            // 驗證繪製是否成功
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const hasContent = imageData.data.some(pixel => pixel !== 0);
            
            console.log('繪製結果驗證:', {
                hasContent: hasContent,
                dataLength: imageData.data.length,
                nonZeroPixels: imageData.data.filter(pixel => pixel !== 0).length
            });
            
            if (!hasContent) {
                console.error('Canvas 繪製失敗，沒有內容');
            }
        } catch (error) {
            console.error('繪製圖片到 Canvas 失敗:', error);
            throw error;
        }
    }

    // 獲取當前圖片數據
    getCurrentImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    // 設置圖片數據
    setImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }

    // 轉換為Blob
    toBlob(type = 'image/jpeg', quality = 0.9) {
        return new Promise((resolve) => {
            this.canvas.toBlob(resolve, type, quality);
        });
    }

    // 轉換為Base64
    toBase64(type = 'image/jpeg', quality = 0.9) {
        try {
            if (!this.canvas) {
                console.error('Canvas 未初始化');
                return '';
            }
            
            if (this.canvas.width === 0 || this.canvas.height === 0) {
                console.error('Canvas 尺寸為 0');
                return '';
            }
            
            // 檢查 Canvas 是否有內容
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const hasContent = imageData.data.some(pixel => pixel !== 0);
            
            if (!hasContent) {
                console.error('Canvas 沒有內容，無法生成 Base64');
                return '';
            }
            
            const base64 = this.canvas.toDataURL(type, quality);
            console.log('toBase64 成功:', {
                type: type,
                quality: quality,
                base64Length: base64.length,
                base64Prefix: base64.substring(0, 50),
                hasContent: hasContent
            });
            return base64;
        } catch (error) {
            console.error('toBase64 失敗:', error);
            return '';
        }
    }

    // 添加到歷史記錄
    addToHistory(action, imageData) {
        // 移除當前位置之後的歷史記錄
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 添加新的歷史記錄
        this.history.push({
            action: action,
            timestamp: new Date(),
            imageData: imageData
        });
        
        // 限制歷史記錄大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    // 撤銷
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const historyItem = this.history[this.historyIndex];
            this.currentImage = Utils.deepClone(historyItem.imageData);
            this.restoreFromHistory(historyItem);
            return true;
        }
        return false;
    }

    // 重做
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const historyItem = this.history[this.historyIndex];
            this.currentImage = Utils.deepClone(historyItem.imageData);
            this.restoreFromHistory(historyItem);
            return true;
        }
        return false;
    }

    // 從歷史記錄恢復
    async restoreFromHistory(historyItem) {
        const img = await Utils.createImageElement(historyItem.imageData.base64);
        this.setupCanvas(img.width, img.height);
        this.drawImage(img);
    }

    // 智能優化
    async autoOptimize() {
        try {
            Utils.updateProgress(0, '正在進行智能優化...');
            
            const imageData = this.getCurrentImageData();
            const data = imageData.data;
            
            // 自動調整亮度和對比度
            const stats = this.calculateImageStats(data);
            const brightnessAdjust = (128 - stats.average) / 128 * 30;
            const contrastAdjust = (stats.stdDev < 30) ? 20 : 0;
            
            Utils.updateProgress(30, '調整亮度...');
            this.adjustBrightness(brightnessAdjust);
            
            Utils.updateProgress(60, '調整對比度...');
            this.adjustContrast(contrastAdjust);
            
            Utils.updateProgress(90, '銳化處理...');
            this.sharpen(10);
            
            Utils.updateProgress(100, '優化完成');
            
            this.addToHistory('智能優化', this.currentImage);
            return true;
        } catch (error) {
            console.error('智能優化失敗:', error);
            throw error;
        }
    }

    // 計算圖片統計信息
    calculateImageStats(data) {
        let sum = 0;
        let sumSq = 0;
        const length = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            sum += gray;
            sumSq += gray * gray;
        }
        
        const average = sum / length;
        const variance = (sumSq / length) - (average * average);
        const stdDev = Math.sqrt(variance);
        
        return { average, stdDev };
    }

    // 調整亮度
    adjustBrightness(value) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const factor = 1 + value / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] * factor));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor));
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
    }

    // 調整對比度
    adjustContrast(value) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
    }

    // 調整飽和度
    adjustSaturation(value) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const factor = 1 + value / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = Math.min(255, Math.max(0, gray + factor * (data[i] - gray)));
            data[i + 1] = Math.min(255, Math.max(0, gray + factor * (data[i + 1] - gray)));
            data[i + 2] = Math.min(255, Math.max(0, gray + factor * (data[i + 2] - gray)));
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
    }

    // 銳化
    sharpen(value) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const factor = value / 100;
        
        const kernel = [
            0, -factor, 0,
            -factor, 1 + 4 * factor, -factor,
            0, -factor, 0
        ];
        
        const newData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    const idx = (y * width + x) * 4 + c;
                    newData[idx] = Math.min(255, Math.max(0, sum));
                }
            }
        }
        
        imageData.data.set(newData);
        this.setImageData(imageData);
        this.updateCurrentImage();
    }

    // 調整色溫
    adjustTemperature(value) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const factor = value / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // 調整紅色和藍色通道
            data[i] = Math.min(255, Math.max(0, data[i] + factor * 20));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] - factor * 20));
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
    }

    // 調整暗部
    adjustShadows(value) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const factor = value / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (gray < 128) {
                const adjustment = factor * (128 - gray) / 128;
                data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
            }
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
    }

    // 應用濾鏡
    applyFilter(filterType) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        
        switch (filterType) {
            case 'grayscale':
                this.applyGrayscale(data);
                break;
            case 'sepia':
                this.applySepia(data);
                break;
            case 'vintage':
                this.applyVintage(data);
                break;
            case 'cool':
                this.applyCool(data);
                break;
            case 'warm':
                this.applyWarm(data);
                break;
            case 'dramatic':
                this.applyDramatic(data);
                break;
            case 'cinematic':
                this.applyCinematic(data);
                break;
            case 'portrait':
                this.applyPortrait(data);
                break;
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
        this.addToHistory(`應用${filterType}濾鏡`, this.currentImage);
    }

    // 黑白濾鏡
    applyGrayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    // 復古濾鏡
    applySepia(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
    }

    // 懷舊濾鏡
    applyVintage(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.2);
            data[i + 1] = Math.min(255, data[i + 1] * 0.9);
            data[i + 2] = Math.min(255, data[i + 2] * 0.8);
        }
    }

    // 冷色調濾鏡
    applyCool(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 0.8);
            data[i + 1] = Math.min(255, data[i + 1] * 0.9);
            data[i + 2] = Math.min(255, data[i + 2] * 1.2);
        }
    }

    // 暖色調濾鏡
    applyWarm(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.2);
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 0.8);
        }
    }

    // 戲劇化濾鏡
    applyDramatic(data) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const factor = gray < 128 ? 0.5 : 1.5;
            data[i] = Math.min(255, Math.max(0, data[i] * factor));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor));
        }
    }

    // 電影感濾鏡
    applyCinematic(data) {
        for (let i = 0; i < data.length; i += 4) {
            // 增加對比度
            const factor = 1.3;
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
            
            // 調整色調
            data[i] = Math.min(255, data[i] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 0.9);
        }
    }

    // 人像濾鏡
    applyPortrait(data) {
        for (let i = 0; i < data.length; i += 4) {
            // 柔化皮膚色調
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 檢測皮膚色調
            if (r > g && g > b && r - b > 20) {
                data[i] = Math.min(255, r * 1.05);
                data[i + 1] = Math.min(255, g * 1.02);
                data[i + 2] = Math.min(255, b * 0.95);
            }
        }
    }

    // 裁剪圖片
    async crop(x, y, width, height) {
        try {
            const imageData = this.ctx.getImageData(x, y, width, height);
            this.setupCanvas(width, height);
            this.ctx.putImageData(imageData, 0, 0);
            
            this.currentImage.width = width;
            this.currentImage.height = height;
            this.currentImage.base64 = this.toBase64();
            
            this.addToHistory('裁剪圖片', this.currentImage);
            return true;
        } catch (error) {
            console.error('裁剪失敗:', error);
            throw error;
        }
    }

    // 智能裁剪（按比例）
    async smartCrop(ratio) {
        const currentRatio = this.canvas.width / this.canvas.height;
        let newWidth, newHeight;
        
        if (ratio === '1:1') {
            const size = Math.min(this.canvas.width, this.canvas.height);
            newWidth = newHeight = size;
        } else if (ratio === '4:3') {
            if (currentRatio > 4/3) {
                newHeight = this.canvas.height;
                newWidth = this.canvas.height * 4/3;
            } else {
                newWidth = this.canvas.width;
                newHeight = this.canvas.width * 3/4;
            }
        } else if (ratio === '16:9') {
            if (currentRatio > 16/9) {
                newHeight = this.canvas.height;
                newWidth = this.canvas.height * 16/9;
            } else {
                newWidth = this.canvas.width;
                newHeight = this.canvas.width * 9/16;
            }
        } else if (ratio === '3:4') {
            if (currentRatio > 3/4) {
                newHeight = this.canvas.height;
                newWidth = this.canvas.height * 3/4;
            } else {
                newWidth = this.canvas.width;
                newHeight = this.canvas.width * 4/3;
            }
        }
        
        const x = (this.canvas.width - newWidth) / 2;
        const y = (this.canvas.height - newHeight) / 2;
        
        return await this.crop(x, y, newWidth, newHeight);
    }

    // 添加水印
    addWatermark(text, position = 'bottom-right', color = '#ffffff') {
        const ctx = this.ctx;
        const fontSize = Math.min(this.canvas.width, this.canvas.height) / 20;
        
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        let x, y;
        
        switch (position) {
            case 'top-left':
                x = 20;
                y = fontSize + 20;
                break;
            case 'top-right':
                x = this.canvas.width - textWidth - 20;
                y = fontSize + 20;
                break;
            case 'bottom-left':
                x = 20;
                y = this.canvas.height - 20;
                break;
            case 'bottom-right':
                x = this.canvas.width - textWidth - 20;
                y = this.canvas.height - 20;
                break;
            case 'center':
                x = (this.canvas.width - textWidth) / 2;
                y = (this.canvas.height + textHeight) / 2;
                break;
        }
        
        // 繪製文字陰影
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        this.updateCurrentImage();
        this.addToHistory('添加水印', this.currentImage);
    }

    // 反光消除
    removeReflection() {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 200) {
                const factor = (255 - brightness) / 55;
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
            }
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
        this.addToHistory('反光消除', this.currentImage);
    }

    // 去陰影
    removeShadow() {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 50) {
                const factor = 1 + (50 - brightness) / 50;
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
            }
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
        this.addToHistory('去陰影', this.currentImage);
    }

    // 馬賽克效果
    applyMosaic(blockSize = 10) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                // 計算塊內的平均顏色
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let by = 0; by < blockSize && y + by < height; by++) {
                    for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                        const idx = ((y + by) * width + (x + bx)) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        count++;
                    }
                }
                
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                
                // 填充塊
                for (let by = 0; by < blockSize && y + by < height; by++) {
                    for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                        const idx = ((y + by) * width + (x + bx)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                    }
                }
            }
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
        this.addToHistory('馬賽克效果', this.currentImage);
    }

    // 美顏效果
    applyBeautyEffect(type) {
        const imageData = this.getCurrentImageData();
        const data = imageData.data;
        
        switch (type) {
            case 'smooth-skin':
                this.smoothSkin(data);
                break;
            case 'whiten-teeth':
                this.whitenTeeth(data);
                break;
            case 'enlarge-eyes':
                this.enlargeEyes(data);
                break;
            case 'slim-face':
                this.slimFace(data);
                break;
        }
        
        this.setImageData(imageData);
        this.updateCurrentImage();
        this.addToHistory(`美顏效果: ${type}`, this.currentImage);
    }

    // 磨皮
    smoothSkin(data) {
        // 簡單的磨皮算法
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 檢測皮膚色調
            if (r > g && g > b && r - b > 20) {
                // 輕微模糊效果
                const factor = 0.9;
                data[i] = Math.min(255, data[i] * factor + 25);
                data[i + 1] = Math.min(255, data[i + 1] * factor + 25);
                data[i + 2] = Math.min(255, data[i + 2] * factor + 25);
            }
        }
    }

    // 美白牙齒
    whitenTeeth(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 檢測牙齒區域（偏白色）
            if (r > 200 && g > 200 && b > 200) {
                data[i] = Math.min(255, r + 20);
                data[i + 1] = Math.min(255, g + 20);
                data[i + 2] = Math.min(255, b + 20);
            }
        }
    }

    // 放大眼睛（簡化版本）
    enlargeEyes(data) {
        // 這裡需要更複雜的算法來檢測眼睛區域
        // 簡化版本只做基本的亮度調整
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 100) {
                const factor = 1.2;
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
            }
        }
    }

    // 瘦臉（簡化版本）
    slimFace(data) {
        // 簡化版本只做基本的對比度調整
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 150) {
                const factor = 0.9;
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
            }
        }
    }

    // 更新當前圖片
    updateCurrentImage() {
        this.currentImage.base64 = this.toBase64();
        this.currentImage.width = this.canvas.width;
        this.currentImage.height = this.canvas.height;
    }

    // 重置到原圖
    resetToOriginal() {
        if (this.originalImage) {
            this.currentImage = Utils.deepClone(this.originalImage);
            this.restoreFromHistory({ imageData: this.originalImage });
            this.addToHistory('重置到原圖', this.currentImage);
        }
    }

    // 獲取處理後的圖片
    getProcessedImage() {
        try {
            if (!this.canvas) {
                console.error('Canvas 未初始化');
                return this.currentImage || { base64: '', width: 0, height: 0 };
            }
            
            if (this.canvas.width === 0 || this.canvas.height === 0) {
                console.error('Canvas 尺寸為 0');
                return this.currentImage || { base64: '', width: 0, height: 0 };
            }
            
            const base64 = this.toBase64();
            console.log('getProcessedImage:', {
                hasCanvas: !!this.canvas,
                canvasWidth: this.canvas?.width,
                canvasHeight: this.canvas?.height,
                hasBase64: !!base64,
                base64Length: base64?.length,
                base64Prefix: base64?.substring(0, 50)
            });
            
            if (!base64) {
                console.error('無法生成 Base64 數據');
                return this.currentImage || { base64: '', width: 0, height: 0 };
            }
            
            return {
                base64: base64,
                width: this.canvas.width,
                height: this.canvas.height
            };
        } catch (error) {
            console.error('getProcessedImage 失敗:', error);
            return this.currentImage || { base64: '', width: 0, height: 0 };
        }
    }
}

// 導出圖片處理器
window.ImageProcessor = ImageProcessor; 