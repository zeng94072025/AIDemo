/**
 * AI圖片處理器
 * 提供畫質修復、智能摳圖、風格化生成等AI功能
 */

class AIImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.originalImage = null;
        this.isLoaded = false;
        this.aiProcessing = false;
        
        console.log('AI圖片處理器初始化成功');
    }

    // 載入圖片
    async loadImage(file) {
        try {
            console.log('開始載入圖片:', file.name);
            
            const img = await this.createImageFromFile(file);
            this.originalImage = img;
            
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            this.isLoaded = true;
            
            console.log('AI圖片載入成功:', {
                width: img.naturalWidth,
                height: img.naturalHeight
            });
            
            return {
                file: file,
                width: img.naturalWidth,
                height: img.naturalHeight,
                type: file.type
            };
            
        } catch (error) {
            console.error('AI圖片載入失敗:', error);
            this.isLoaded = false;
            throw error;
        }
    }

    // 從DataURL載入圖片
    async loadImageFromDataURL(dataURL) {
        try {
            console.log('開始從DataURL載入圖片');
            
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = dataURL;
            });
            
            this.originalImage = img;
            
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            this.isLoaded = true;
            
            console.log('AI圖片從DataURL載入成功:', {
                width: img.naturalWidth,
                height: img.naturalHeight
            });
            
            return {
                width: img.naturalWidth,
                height: img.naturalHeight
            };
            
        } catch (error) {
            console.error('AI圖片從DataURL載入失敗:', error);
            this.isLoaded = false;
            throw error;
        }
    }

    // 從文件創建圖片元素
    createImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            let url = null;
            
            img.onload = () => {
                if (url) URL.revokeObjectURL(url);
                resolve(img);
            };
            
            img.onerror = (error) => {
                if (url) URL.revokeObjectURL(url);
                reject(error);
            };
            
            url = URL.createObjectURL(file);
            img.src = url;
        });
    }

    // 老照片修復
    async repairOldPhoto() {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log('開始老照片修復...');

        try {
            await this.simulateAIProcessing('老照片修復', 3000);
            
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // 增強對比度和銳度
            for (let i = 0; i < data.length; i += 4) {
                const factor = 1.2;
                data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
                data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
                
                // 減少噪點
                if (data[i] < 30) data[i] = 0;
                if (data[i + 1] < 30) data[i + 1] = 0;
                if (data[i + 2] < 30) data[i + 2] = 0;
            }
            
            this.ctx.putImageData(imageData, 0, 0);
            console.log('老照片修復完成');
            return true;
            
        } catch (error) {
            console.error('老照片修復失敗:', error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 8K超分辨率
    async upscaleTo8K() {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log('開始8K超分辨率處理...');

        try {
            await this.simulateAIProcessing('8K超分辨率', 5000);
            
            const originalWidth = this.canvas.width;
            const originalHeight = this.canvas.height;
            const scaleFactor = 4;
            
            const upscaledCanvas = document.createElement('canvas');
            const upscaledCtx = upscaledCanvas.getContext('2d');
            
            upscaledCanvas.width = originalWidth * scaleFactor;
            upscaledCanvas.height = originalHeight * scaleFactor;
            
            upscaledCtx.imageSmoothingEnabled = true;
            upscaledCtx.imageSmoothingQuality = 'high';
            
            upscaledCtx.drawImage(this.canvas, 0, 0, upscaledCanvas.width, upscaledCanvas.height);
            
            // 應用銳化
            const imageData = upscaledCtx.getImageData(0, 0, upscaledCanvas.width, upscaledCanvas.height);
            this.applySharpenFilter(imageData.data, upscaledCanvas.width, upscaledCanvas.height);
            upscaledCtx.putImageData(imageData, 0, 0);
            
            this.canvas = upscaledCanvas;
            this.ctx = upscaledCtx;
            
            console.log('8K超分辨率完成');
            return true;
            
        } catch (error) {
            console.error('8K超分辨率失敗:', error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 人像摳圖
    async extractPortrait() {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log('開始人像摳圖...');

        try {
            await this.simulateAIProcessing('人像摳圖', 4000);
            
            const portraitCanvas = document.createElement('canvas');
            const portraitCtx = portraitCanvas.getContext('2d');
            
            portraitCanvas.width = this.canvas.width;
            portraitCanvas.height = this.canvas.height;
            
            portraitCtx.drawImage(this.canvas, 0, 0);
            
            const imageData = portraitCtx.getImageData(0, 0, portraitCanvas.width, portraitCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const isSkinTone = this.isSkinTone(r, g, b);
                const brightness = (r + g + b) / 3;
                const isBackground = brightness > 240 || brightness < 30;
                
                if (!isSkinTone && isBackground) {
                    data[i + 3] = 0;
                }
            }
            
            portraitCtx.putImageData(imageData, 0, 0);
            
            this.canvas = portraitCanvas;
            this.ctx = portraitCtx;
            
            console.log('人像摳圖完成');
            return true;
            
        } catch (error) {
            console.error('人像摳圖失敗:', error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 物體摳圖
    async extractObject() {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log('開始物體摳圖...');

        try {
            await this.simulateAIProcessing('物體摳圖', 3500);
            
            const objectCanvas = document.createElement('canvas');
            const objectCtx = objectCanvas.getContext('2d');
            
            objectCanvas.width = this.canvas.width;
            objectCanvas.height = this.canvas.height;
            
            objectCtx.drawImage(this.canvas, 0, 0);
            
            const imageData = objectCtx.getImageData(0, 0, objectCanvas.width, objectCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const isEdge = brightness < 50 || brightness > 200;
                
                if (isEdge) {
                    data[i + 3] = 0;
                }
            }
            
            objectCtx.putImageData(imageData, 0, 0);
            
            this.canvas = objectCanvas;
            this.ctx = objectCtx;
            
            console.log('物體摳圖完成');
            return true;
            
        } catch (error) {
            console.error('物體摳圖失敗:', error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 藝術風格化
    async applyArtisticStyle(style) {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log(`開始應用藝術風格: ${style}`);

        try {
            await this.simulateAIProcessing(`藝術風格: ${style}`, 2500);
            
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            switch (style) {
                case 'oil-painting':
                    this.applyOilPaintingEffect(data);
                    break;
                case 'watercolor':
                    this.applyWatercolorEffect(data);
                    break;
                case 'sketch':
                    this.applySketchEffect(data);
                    break;
                case 'cartoon':
                    this.applyCartoonEffect(data);
                    break;
                case 'vintage':
                    this.applyVintageEffect(data);
                    break;
                default:
                    throw new Error(`不支持的藝術風格: ${style}`);
            }
            
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log(`藝術風格 ${style} 應用完成`);
            return true;
            
        } catch (error) {
            console.error(`藝術風格應用失敗:`, error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 卡通化
    async cartoonize() {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log('開始卡通化處理...');

        try {
            await this.simulateAIProcessing('卡通化', 3000);
            
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            this.applyCartoonEffect(data);
            
            this.ctx.putImageData(imageData, 0, 0);
            
            console.log('卡通化完成');
            return true;
            
        } catch (error) {
            console.error('卡通化失敗:', error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 一鍵修復 - 智能去除背景和無關人物，自動補充背景
    async oneClickRepair(selectedRegion = null) {
        if (!this.isLoaded) throw new Error('沒有載入的圖片');

        this.aiProcessing = true;
        console.log('開始智能一鍵修復處理...');

        try {
            await this.simulateAIProcessing('智能一鍵修復', 6000);
            
            const repairCanvas = document.createElement('canvas');
            const repairCtx = repairCanvas.getContext('2d');
            
            repairCanvas.width = this.canvas.width;
            repairCanvas.height = this.canvas.height;
            
            repairCtx.drawImage(this.canvas, 0, 0);
            
            const imageData = repairCtx.getImageData(0, 0, repairCanvas.width, repairCanvas.height);
            const data = imageData.data;
            
            // 創建區域掩碼
            const regionMask = this.createRegionMask(repairCanvas.width, repairCanvas.height, selectedRegion);
            console.log('區域掩碼創建完成');
            
            // 第一步：智能檢測主要人物和需要保留的區域（僅在選定區域內）
            const mainSubjectMask = this.detectMainSubjectAdvanced(data, repairCanvas.width, repairCanvas.height, regionMask);
            console.log('主要人物檢測完成');
            
            // 第二步：識別需要刪除的無關人物（僅在選定區域內）
            const removalMask = this.detectUnwantedSubjects(data, repairCanvas.width, repairCanvas.height, mainSubjectMask, regionMask);
            console.log('無關人物檢測完成');
            
            // 第三步：實際刪除無關人物（設置為透明）
            this.removeUnwantedSubjects(data, repairCanvas.width, repairCanvas.height, removalMask);
            console.log('無關人物刪除完成');
            
            // 第四步：創建需要填充的區域掩碼（包括被刪除的無關人物區域）
            const fillMask = this.createFillMask(repairCanvas.width, repairCanvas.height, mainSubjectMask, removalMask, regionMask);
            console.log('填充區域掩碼創建完成');
            
            // 第五步：內容感知填充算法
            this.contentAwareFill(data, repairCanvas.width, repairCanvas.height, fillMask);
            console.log('內容感知填充完成');
            
            // 第六步：邊緣平滑和自然化處理
            this.smoothEdgesAndNaturalize(data, repairCanvas.width, repairCanvas.height, mainSubjectMask, regionMask);
            console.log('邊緣平滑處理完成');
            
            repairCtx.putImageData(imageData, 0, 0);
            
            this.canvas = repairCanvas;
            this.ctx = repairCtx;
            
            console.log('智能一鍵修復完成');
            return true;
            
        } catch (error) {
            console.error('智能一鍵修復失敗:', error);
            return false;
        } finally {
            this.aiProcessing = false;
        }
    }

    // 創建區域掩碼
    createRegionMask(width, height, selectedRegion) {
        const mask = new Array(width * height).fill(0);
        
        // 如果沒有選擇區域，則整個圖片都是處理區域
        if (!selectedRegion) {
            for (let i = 0; i < mask.length; i++) {
                mask[i] = 1;
            }
            console.log('使用全圖區域掩碼');
            return mask;
        }
        
        // 創建選定區域的掩碼
        const { x, y, width: regionWidth, height: regionHeight } = selectedRegion;
        
        // 確保區域在圖片範圍內
        const startX = Math.max(0, Math.min(x, width - 1));
        const startY = Math.max(0, Math.min(y, height - 1));
        const endX = Math.min(width, startX + regionWidth);
        const endY = Math.min(height, startY + regionHeight);
        
        // 填充選定區域
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const idx = y * width + x;
                mask[idx] = 1;
            }
        }
        
        console.log(`區域掩碼創建完成: x=${startX}, y=${startY}, width=${endX-startX}, height=${endY-startY}`);
        return mask;
    }

    // 高級主要人物檢測算法
    detectMainSubjectAdvanced(data, width, height, regionMask) {
        const mask = new Array(width * height).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const maskIdx = y * width + x;
                
                // 只在選定區域內進行檢測
                if (regionMask && regionMask[maskIdx] === 0) {
                    continue;
                }
                
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                
                // 膚色檢測（更精確的算法）
                const isSkinTone = this.isAdvancedSkinTone(r, g, b);
                
                // 亮度檢測（排除過亮或過暗的背景）
                const brightness = (r + g + b) / 3;
                const isReasonableBrightness = brightness > 25 && brightness < 235;
                
                // 色彩飽和度檢測
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max - min;
                const hasColor = saturation > 20;
                
                // 邊緣檢測（排除圖片邊緣）
                const isNotEdge = x > width * 0.03 && x < width * 0.97 && 
                                y > height * 0.03 && y < height * 0.97;
                
                // 中心區域優先（假設主要人物在中心）
                const centerX = width / 2;
                const centerY = height / 2;
                const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.min(width, height) * 0.4;
                const isNearCenter = distanceFromCenter < maxDistance;
                
                // 綜合評分系統
                let score = 0;
                if (isSkinTone) score += 4; // 增加膚色權重
                if (hasColor) score += 2;
                if (isReasonableBrightness) score += 2;
                if (isNotEdge) score += 1;
                if (isNearCenter) score += 3; // 增加中心區域權重
                
                // 檢查周圍是否有其他膚色像素（形成人物輪廓）
                let hasSkinNeighbors = false;
                if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                    const neighbors = [
                        this.isAdvancedSkinTone(data[((y-1) * width + x) * 4], data[((y-1) * width + x) * 4 + 1], data[((y-1) * width + x) * 4 + 2]),
                        this.isAdvancedSkinTone(data[((y+1) * width + x) * 4], data[((y+1) * width + x) * 4 + 1], data[((y+1) * width + x) * 4 + 2]),
                        this.isAdvancedSkinTone(data[(y * width + (x-1)) * 4], data[(y * width + (x-1)) * 4 + 1], data[(y * width + (x-1)) * 4 + 2]),
                        this.isAdvancedSkinTone(data[(y * width + (x+1)) * 4], data[(y * width + (x+1)) * 4 + 1], data[(y * width + (x+1)) * 4 + 2])
                    ];
                    hasSkinNeighbors = neighbors.filter(n => n).length >= 2;
                }
                if (hasSkinNeighbors) score += 2;
                
                if (score >= 6) { // 提高閾值以更準確識別
                    mask[maskIdx] = 1;
                }
            }
        }
        
        return mask;
    }

    // 檢測無關人物
    detectUnwantedSubjects(data, width, height, mainSubjectMask, regionMask) {
        const removalMask = new Array(width * height).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const maskIdx = y * width + x;
                
                // 只在選定區域內進行檢測
                if (regionMask && regionMask[maskIdx] === 0) {
                    continue;
                }
                
                // 如果已經被標記為主要人物，跳過
                if (mainSubjectMask[maskIdx] === 1) {
                    continue;
                }
                
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                
                // 檢測可能是人物的區域（膚色但不在主要人物區域）
                const isSkinTone = this.isAdvancedSkinTone(r, g, b);
                const brightness = (r + g + b) / 3;
                const isReasonableBrightness = brightness > 30 && brightness < 230;
                
                // 檢查周圍是否有其他膚色像素（形成人物輪廓）
                let hasSkinNeighbors = false;
                if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                    const neighbors = [
                        this.isAdvancedSkinTone(data[((y-1) * width + x) * 4], data[((y-1) * width + x) * 4 + 1], data[((y-1) * width + x) * 4 + 2]),
                        this.isAdvancedSkinTone(data[((y+1) * width + x) * 4], data[((y+1) * width + x) * 4 + 1], data[((y+1) * width + x) * 4 + 2]),
                        this.isAdvancedSkinTone(data[(y * width + (x-1)) * 4], data[(y * width + (x-1)) * 4 + 1], data[(y * width + (x-1)) * 4 + 2]),
                        this.isAdvancedSkinTone(data[(y * width + (x+1)) * 4], data[(y * width + (x+1)) * 4 + 1], data[(y * width + (x+1)) * 4 + 2])
                    ];
                    hasSkinNeighbors = neighbors.filter(n => n).length >= 2;
                }
                
                // 更嚴格的條件：必須是膚色且有膚色鄰居
                if (isSkinTone && isReasonableBrightness && hasSkinNeighbors) {
                    removalMask[maskIdx] = 1;
                }
            }
        }
        
        return removalMask;
    }

    // 實際刪除無關人物
    removeUnwantedSubjects(data, width, height, removalMask) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const maskIdx = y * width + x;
                
                // 如果是需要刪除的無關人物，設置為透明
                if (removalMask[maskIdx] === 1) {
                    data[idx + 3] = 0; // 設置alpha通道為0（透明）
                }
            }
        }
    }

    // 創建需要填充的區域掩碼
    createFillMask(width, height, mainSubjectMask, removalMask, regionMask) {
        const fillMask = new Array(width * height).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                // 只在選定區域內進行填充
                if (regionMask && regionMask[idx] === 0) {
                    continue;
                }
                
                // 需要填充的區域包括：
                // 1. 既不是主要人物，也不是需要刪除的區域（背景）
                // 2. 需要刪除的無關人物區域（將被填充）
                if (mainSubjectMask[idx] === 0) {
                    fillMask[idx] = 1;
                }
            }
        }
        
        return fillMask;
    }

    // 內容感知填充算法
    contentAwareFill(data, width, height, fillMask) {
        const patchSize = 8; // 填充塊大小
        const searchRadius = 30; // 增加搜索半徑以找到更好的匹配
        
        // 多次迭代填充以獲得更好的效果
        for (let iteration = 0; iteration < 3; iteration++) {
            for (let y = 0; y < height; y += patchSize) {
                for (let x = 0; x < width; x += patchSize) {
                    const idx = y * width + x;
                    
                    if (fillMask[idx] === 1) {
                        // 尋找最佳匹配的填充塊
                        const bestPatch = this.findBestPatch(data, width, height, x, y, patchSize, searchRadius, fillMask);
                        
                        if (bestPatch) {
                            // 應用填充塊
                            this.applyPatch(data, width, x, y, patchSize, bestPatch);
                        }
                    }
                }
            }
        }
    }

    // 尋找最佳填充塊
    findBestPatch(data, width, height, targetX, targetY, patchSize, searchRadius, fillMask) {
        let bestPatch = null;
        let bestScore = Infinity;
        
        const startX = Math.max(0, targetX - searchRadius);
        const endX = Math.min(width - patchSize, targetX + searchRadius);
        const startY = Math.max(0, targetY - searchRadius);
        const endY = Math.min(height - patchSize, targetY + searchRadius);
        
        for (let y = startY; y < endY; y += 2) {
            for (let x = startX; x < endX; x += 2) {
                // 檢查這個區域是否適合作為填充源
                let isValidSource = true;
                let validPixelCount = 0;
                
                for (let dy = 0; dy < patchSize; dy++) {
                    for (let dx = 0; dx < patchSize; dx++) {
                        const sourceIdx = (y + dy) * width + (x + dx);
                        if (fillMask[sourceIdx] === 1) {
                            isValidSource = false;
                            break;
                        }
                        validPixelCount++;
                    }
                    if (!isValidSource) break;
                }
                
                // 要求至少80%的像素是有效的
                if (isValidSource && validPixelCount >= patchSize * patchSize * 0.8) {
                    const score = this.calculatePatchSimilarity(data, width, targetX, targetY, x, y, patchSize);
                    if (score < bestScore) {
                        bestScore = score;
                        bestPatch = { x, y };
                    }
                }
            }
        }
        
        return bestPatch;
    }

    // 計算塊相似度
    calculatePatchSimilarity(data, width, targetX, targetY, sourceX, sourceY, patchSize) {
        let similarity = 0;
        
        for (let dy = 0; dy < patchSize; dy++) {
            for (let dx = 0; dx < patchSize; dx++) {
                const targetIdx = (targetY + dy) * width + (targetX + dx) * 4;
                const sourceIdx = (sourceY + dy) * width + (sourceX + dx) * 4;
                
                // 計算顏色差異
                const dr = data[targetIdx] - data[sourceIdx];
                const dg = data[targetIdx + 1] - data[sourceIdx + 1];
                const db = data[targetIdx + 2] - data[sourceIdx + 2];
                
                similarity += dr * dr + dg * dg + db * db;
            }
        }
        
        return similarity;
    }

    // 應用填充塊
    applyPatch(data, width, targetX, targetY, patchSize, sourcePatch) {
        for (let dy = 0; dy < patchSize; dy++) {
            for (let dx = 0; dx < patchSize; dx++) {
                const targetIdx = (targetY + dy) * width + (targetX + dx) * 4;
                const sourceIdx = (sourcePatch.y + dy) * width + (sourcePatch.x + dx) * 4;
                
                data[targetIdx] = data[sourceIdx];
                data[targetIdx + 1] = data[sourceIdx + 1];
                data[targetIdx + 2] = data[sourceIdx + 2];
                data[targetIdx + 3] = data[sourceIdx + 3];
            }
        }
    }

    // 邊緣平滑和自然化處理
    smoothEdgesAndNaturalize(data, width, height, mainSubjectMask, regionMask) {
        // 對主要人物邊緣進行平滑處理
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                if (mainSubjectMask[idx] === 1) {
                    // 檢查周圍像素
                    const neighbors = [
                        mainSubjectMask[(y-1) * width + x],
                        mainSubjectMask[(y+1) * width + x],
                        mainSubjectMask[y * width + (x-1)],
                        mainSubjectMask[y * width + (x+1)]
                    ];
                    
                    const neighborCount = neighbors.filter(n => n === 1).length;
                    
                    // 如果邊緣像素，進行平滑處理
                    if (neighborCount < 4) {
                        this.smoothPixel(data, width, x, y);
                    }
                }
            }
        }
    }

    // 平滑像素
    smoothPixel(data, width, x, y) {
        const idx = y * width + x * 4;
        
        // 計算周圍像素的平均值
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                const nIdx = ny * width + nx * 4;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < data.length / 4 / width) {
                    r += data[nIdx];
                    g += data[nIdx + 1];
                    b += data[nIdx + 2];
                    count++;
                }
            }
        }
        
        if (count > 0) {
            data[idx] = r / count;
            data[idx + 1] = g / count;
            data[idx + 2] = b / count;
        }
    }

    // 高級膚色檢測
    isAdvancedSkinTone(r, g, b) {
        // 更精確的膚色檢測算法
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        // 膚色範圍檢測
        const isSkinColor = (
            r > 95 && g > 40 && b > 20 && // 基本膚色範圍
            delta > 15 && // 有足夠的色彩差異
            Math.abs(r - g) > 15 && // 紅色和綠色有差異
            r > g && r > b && // 紅色是主導色
            g > 40 && g < 200 && // 綠色在合理範圍
            b > 20 && b < 180 // 藍色在合理範圍
        );
        
        return isSkinColor;
    }

    // 檢測主要人物
    detectMainSubject(data, width, height) {
        const mask = new Array(width * height).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                
                // 膚色檢測
                const isSkinTone = this.isSkinTone(r, g, b);
                
                // 亮度檢測（排除過亮或過暗的背景）
                const brightness = (r + g + b) / 3;
                const isReasonableBrightness = brightness > 20 && brightness < 240;
                
                // 色彩飽和度檢測
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max - min;
                const hasColor = saturation > 15;
                
                // 邊緣檢測（排除圖片邊緣）
                const isNotEdge = x > width * 0.05 && x < width * 0.95 && 
                                y > height * 0.05 && y < height * 0.95;
                
                if ((isSkinTone || hasColor) && isReasonableBrightness && isNotEdge) {
                    mask[y * width + x] = 1;
                }
            }
        }
        
        return mask;
    }

    // 精細邊緣處理
    refineEdges(data, width, height, mask) {
        const refinedMask = [...mask];
        
        // 使用形態學操作改善邊緣
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const center = mask[y * width + x];
                const neighbors = [
                    mask[(y-1) * width + x],     // 上
                    mask[(y+1) * width + x],     // 下
                    mask[y * width + (x-1)],     // 左
                    mask[y * width + (x+1)]      // 右
                ];
                
                const neighborCount = neighbors.filter(n => n === 1).length;
                
                // 如果周圍有足夠的鄰居，保留該點
                if (center === 1 && neighborCount >= 2) {
                    refinedMask[y * width + x] = 1;
                } else if (center === 0 && neighborCount >= 3) {
                    // 填充小的空隙
                    refinedMask[y * width + x] = 1;
                }
            }
        }
        
        // 更新mask
        for (let i = 0; i < mask.length; i++) {
            mask[i] = refinedMask[i];
        }
    }

    // 應用背景去除
    applyBackgroundRemoval(data, width, height, mask) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const maskIdx = y * width + x;
                
                if (mask[maskIdx] === 0) {
                    // 設置背景為透明
                    data[idx + 3] = 0;
                } else {
                    // 保留主體，稍微增強對比度
                    const factor = 1.1;
                    data[idx] = Math.min(255, Math.max(0, factor * (data[idx] - 128) + 128));
                    data[idx + 1] = Math.min(255, Math.max(0, factor * (data[idx + 1] - 128) + 128));
                    data[idx + 2] = Math.min(255, Math.max(0, factor * (data[idx + 2] - 128) + 128));
                }
            }
        }
    }

    // 增強主體細節
    enhanceMainSubject(data, width, height, mask) {
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const maskIdx = y * width + x;
                
                if (mask[maskIdx] === 1) {
                    // 輕微銳化主體
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // 簡單的銳化濾鏡
                    const sharpenFactor = 0.3;
                    data[idx] = Math.min(255, Math.max(0, r + (r - (r + g + b) / 3) * sharpenFactor));
                    data[idx + 1] = Math.min(255, Math.max(0, g + (g - (r + g + b) / 3) * sharpenFactor));
                    data[idx + 2] = Math.min(255, Math.max(0, b + (b - (r + g + b) / 3) * sharpenFactor));
                }
            }
        }
    }

    // 輔助方法
    async simulateAIProcessing(operation, duration) {
        return new Promise((resolve) => {
            console.log(`AI處理中: ${operation}`);
            setTimeout(() => {
                console.log(`AI處理完成: ${operation}`);
                resolve();
            }, duration);
        });
    }

    isSkinTone(r, g, b) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return (r > 95 && g > 40 && b > 20 && 
                max - min > 15 && 
                Math.abs(r - g) > 15 && 
                r > g && r > b);
    }

    applySharpenFilter(data, width, height) {
        const tempData = new Uint8ClampedArray(data);
        const kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += tempData[idx] * kernel[ky + 1][kx + 1];
                        }
                    }
                    const idx = (y * width + x) * 4 + c;
                    data[idx] = Math.min(255, Math.max(0, sum));
                }
            }
        }
    }

    applyOilPaintingEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            const max = Math.max(data[i], data[i + 1], data[i + 2]);
            const min = Math.min(data[i], data[i + 1], data[i + 2]);
            const delta = max - min;
            
            if (delta > 0) {
                const saturation = 1.5;
                data[i] = Math.min(255, data[i] + (data[i] - min) * saturation);
                data[i + 1] = Math.min(255, data[i + 1] + (data[i + 1] - min) * saturation);
                data[i + 2] = Math.min(255, data[i + 2] + (data[i + 2] - min) * saturation);
            }
        }
    }

    applyWatercolorEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 0.8 + 50);
            data[i + 1] = Math.min(255, data[i + 1] * 0.8 + 50);
            data[i + 2] = Math.min(255, data[i + 2] * 0.8 + 50);
        }
    }

    applySketchEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const sketch = 255 - gray;
            data[i] = sketch;
            data[i + 1] = sketch;
            data[i + 2] = sketch;
        }
    }

    applyCartoonEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] / 64) * 64;
            data[i + 1] = Math.floor(data[i + 1] / 64) * 64;
            data[i + 2] = Math.floor(data[i + 2] / 64) * 64;
            
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 128) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
        }
    }

    applyVintageEffect(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
    }

    toBase64(type = 'image/png', quality = 0.9) {
        try {
            if (!this.isLoaded || !this.canvas) {
                console.error('沒有載入的圖片');
                return null;
            }
            
            const dataUrl = this.canvas.toDataURL(type, quality);
            
            if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
                console.error('生成的 Data URL 無效');
                return null;
            }
            
            console.log('AI處理器Base64生成成功');
            return dataUrl;
        } catch (error) {
            console.error('生成Base64失敗:', error);
            return null;
        }
    }

    isProcessing() {
        return this.aiProcessing;
    }

    isImageLoaded() {
        return this.isLoaded && this.originalImage !== null;
    }

    getProcessingInfo() {
        return {
            isLoaded: this.isLoaded,
            isProcessing: this.aiProcessing,
            canvasSize: this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'N/A'
        };
    }
}

// 導出AI圖片處理器
window.AIImageProcessor = AIImageProcessor; 