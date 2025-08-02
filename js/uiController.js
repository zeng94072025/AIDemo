/**
 * UI控制器
 * 負責管理所有UI交互和事件處理
 */

class UIController {
    constructor() {
        this.currentImageIndex = 0;
        this.images = [];
        this.isProcessing = false;
        
        this.initEventListeners();
        this.initTabSystem();
        this.initParameterControls();
    }

    // 初始化事件監聽器
    initEventListeners() {
        // 文件上傳
        this.initFileUpload();
        
        // 工具按鈕
        this.initToolButtons();
        
        // 預覽控制
        this.initPreviewControls();
        
        // 下載控制
        this.initDownloadControls();
        
        // 設置控制
        this.initSettingsControls();
        
        // 模態框
        this.initModals();
        
        // 拖拽上傳
        this.initDragAndDrop();
    }

    // 初始化文件上傳
    initFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
        }
    }



    // 初始化工具按鈕
    initToolButtons() {
        // 智能優化按鈕
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleToolAction(action);
            });
        });

        // 濾鏡按鈕
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.handleFilterAction(filter);
            });
        });

        // 相框按鈕
        document.querySelectorAll('[data-frame]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const frame = e.target.dataset.frame;
                this.handleFrameAction(frame);
            });
        });

        // 繪製工具
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.handleDrawingTool(tool);
            });
        });

        // 標註工具
        document.querySelectorAll('[data-annotation]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const annotation = e.target.dataset.annotation;
                this.handleAnnotationTool(annotation);
            });
        });
    }

    // 初始化預覽控制
    initPreviewControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.showPreviousImage();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.showNextImage();
            });
        }
    }

    // 初始化下載控制
    initDownloadControls() {
        const downloadCurrent = document.getElementById('downloadCurrent');
        const downloadAll = document.getElementById('downloadAll');
        const clearHistory = document.getElementById('clearHistory');
        
        if (downloadCurrent) {
            downloadCurrent.addEventListener('click', () => {
                this.downloadCurrentImage();
            });
        }
        
        if (downloadAll) {
            downloadAll.addEventListener('click', () => {
                this.downloadAllImages();
            });
        }
        
        if (clearHistory) {
            clearHistory.addEventListener('click', () => {
                this.clearHistory();
            });
        }
    }

    // 初始化設置控制
    initSettingsControls() {
        const settingsBtn = document.getElementById('settingsBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
    }

    // 初始化模態框
    initModals() {
        const helpBtn = document.getElementById('helpBtn');
        const closeHelpModal = document.getElementById('closeHelpModal');
        const helpModal = document.getElementById('helpModal');
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                helpModal.classList.add('active');
            });
        }
        
        if (closeHelpModal) {
            closeHelpModal.addEventListener('click', () => {
                helpModal.classList.remove('active');
            });
        }
        
        // 點擊模態框外部關閉
        if (helpModal) {
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.classList.remove('active');
                }
            });
        }
    }

    // 初始化拖拽上傳
    initDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                this.handleFileSelect(files);
            });
        }
    }

    // 初始化標籤系統
    initTabSystem() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // 移除所有活動狀態
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // 添加活動狀態
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    // 初始化參數控制
    initParameterControls() {
        // 亮度控制
        const brightnessSlider = document.getElementById('brightness');
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', Utils.debounce((e) => {
                this.handleParameterChange('brightness', e.target.value);
            }, 100));
        }

        // 對比度控制
        const contrastSlider = document.getElementById('contrast');
        if (contrastSlider) {
            contrastSlider.addEventListener('input', Utils.debounce((e) => {
                this.handleParameterChange('contrast', e.target.value);
            }, 100));
        }

        // 飽和度控制
        const saturationSlider = document.getElementById('saturation');
        if (saturationSlider) {
            saturationSlider.addEventListener('input', Utils.debounce((e) => {
                this.handleParameterChange('saturation', e.target.value);
            }, 100));
        }

        // 銳度控制
        const sharpnessSlider = document.getElementById('sharpness');
        if (sharpnessSlider) {
            sharpnessSlider.addEventListener('input', Utils.debounce((e) => {
                this.handleParameterChange('sharpness', e.target.value);
            }, 100));
        }

        // 暗部控制
        const shadowsSlider = document.getElementById('shadows');
        if (shadowsSlider) {
            shadowsSlider.addEventListener('input', Utils.debounce((e) => {
                this.handleParameterChange('shadows', e.target.value);
            }, 100));
        }

        // 色溫控制
        const temperatureSlider = document.getElementById('temperature');
        if (temperatureSlider) {
            temperatureSlider.addEventListener('input', Utils.debounce((e) => {
                this.handleParameterChange('temperature', e.target.value);
            }, 100));
        }

        // 畫筆大小控制
        const brushSizeSlider = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        if (brushSizeSlider && brushSizeValue) {
            brushSizeSlider.addEventListener('input', (e) => {
                brushSizeValue.textContent = e.target.value + 'px';
            });
        }
    }

    // 處理文件選擇
    async handleFileSelect(files) {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(file => {
            if (!Utils.isValidImageFile(file)) {
                Utils.showNotification(`${file.name} 不是有效的圖片文件`, 'error');
                return false;
            }
            
            if (!Utils.isValidFileSize(file, 10)) {
                Utils.showNotification(`${file.name} 文件太大，最大支持10MB`, 'error');
                return false;
            }
            
            return true;
        });

        if (validFiles.length === 0) return;

        try {
            Utils.updateProgress(0, '正在載入圖片...');
            
            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];
                const progress = (i / validFiles.length) * 100;
                Utils.updateProgress(progress, `載入圖片 ${i + 1}/${validFiles.length}`);
                
                await this.loadImage(file);
            }
            
            Utils.updateProgress(100, '圖片載入完成');
            Utils.showNotification(`成功載入 ${validFiles.length} 張圖片`, 'success');
            
        } catch (error) {
            console.error('載入圖片失敗:', error);
            Utils.showNotification('載入圖片失敗', 'error');
        }
    }

    // 載入單張圖片
    async loadImage(file) {
        try {
            console.log('開始載入圖片:', file.name);
            
            const processor = new ImageProcessor();
            const imageData = await processor.loadImage(file);
            
            console.log('圖片載入成功:', {
                fileName: file.name,
                imageData: imageData
            });
            
            this.images.push({
                file: file,
                data: imageData,
                processor: processor
            });
            
            console.log('圖片已添加到列表，總數:', this.images.length);
            
            this.updateImageList();
            this.updatePreview();
            this.updateImageCounter();
            this.updateDownloadButtons();
            
        } catch (error) {
            console.error('載入圖片失敗:', error);
            throw error;
        }
    }



    // 處理工具動作
    async handleToolAction(action) {
        if (this.images.length === 0) {
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }
        
        if (this.isProcessing) {
            Utils.showNotification('圖片正在處理中，請稍候', 'warning');
            return;
        }
        
        this.isProcessing = true;
        
        try {
            const currentImage = this.images[this.currentImageIndex];
            const processor = currentImage.processor;
            
            switch (action) {
                case 'auto-optimize':
                    await processor.autoOptimize();
                    break;
                case 'remove-reflection':
                    processor.removeReflection();
                    break;
                case 'brighten':
                    processor.adjustBrightness(20);
                    break;
                case 'mosaic':
                    processor.applyMosaic(10);
                    break;
                case 'remove-shadow':
                    processor.removeShadow();
                    break;
                case 'smooth-skin':
                    processor.applyBeautyEffect('smooth-skin');
                    break;
                case 'whiten-teeth':
                    processor.applyBeautyEffect('whiten-teeth');
                    break;
                case 'enlarge-eyes':
                    processor.applyBeautyEffect('enlarge-eyes');
                    break;
                case 'slim-face':
                    processor.applyBeautyEffect('slim-face');
                    break;
            }
            
            this.updatePreview();
            this.addToHistory(action);
            Utils.showNotification(`${action} 完成`, 'success');
            
        } catch (error) {
            console.error('處理失敗:', error);
            Utils.showNotification('處理失敗', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    // 處理濾鏡動作
    async handleFilterAction(filter) {
        if (this.images.length === 0) {
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }
        
        try {
            const currentImage = this.images[this.currentImageIndex];
            const processor = currentImage.processor;
            
            processor.applyFilter(filter);
            this.updatePreview();
            this.addToHistory(`應用${filter}濾鏡`);
            Utils.showNotification(`${filter}濾鏡應用完成`, 'success');
            
        } catch (error) {
            console.error('濾鏡應用失敗:', error);
            Utils.showNotification('濾鏡應用失敗', 'error');
        }
    }

    // 處理相框動作
    async handleFrameAction(frame) {
        // 相框功能待實現
        Utils.showNotification('相框功能開發中', 'info');
    }

    // 處理繪製工具
    handleDrawingTool(tool) {
        // 移除所有活動狀態
        document.querySelectorAll('.drawing-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加活動狀態
        event.target.classList.add('active');
        
        // 繪製功能待實現
        Utils.showNotification(`${tool}工具已選擇`, 'info');
    }

    // 處理標註工具
    handleAnnotationTool(annotation) {
        // 移除所有活動狀態
        document.querySelectorAll('.annotation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加活動狀態
        event.target.classList.add('active');
        
        // 標註功能待實現
        Utils.showNotification(`${annotation}工具已選擇`, 'info');
    }

    // 處理參數變化
    handleParameterChange(parameter, value) {
        if (this.images.length === 0) return;
        
        const currentImage = this.images[this.currentImageIndex];
        const processor = currentImage.processor;
        
        switch (parameter) {
            case 'brightness':
                processor.adjustBrightness(parseInt(value));
                break;
            case 'contrast':
                processor.adjustContrast(parseInt(value));
                break;
            case 'saturation':
                processor.adjustSaturation(parseInt(value));
                break;
            case 'sharpness':
                processor.sharpen(parseInt(value));
                break;
            case 'shadows':
                processor.adjustShadows(parseInt(value));
                break;
            case 'temperature':
                processor.adjustTemperature(parseInt(value));
                break;
        }
        
        this.updatePreview();
    }



    // 顯示上一張圖片
    showPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updatePreview();
            this.updateImageCounter();
        }
    }

    // 顯示下一張圖片
    showNextImage() {
        if (this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
            this.updatePreview();
            this.updateImageCounter();
        }
    }

    // 下載當前圖片
    async downloadCurrentImage() {
        if (this.images.length === 0) {
            Utils.showNotification('沒有可下載的圖片', 'warning');
            return;
        }
        
        try {
            const currentImage = this.images[this.currentImageIndex];
            const processor = currentImage.processor;
            const processedImage = processor.getProcessedImage();
            
            const format = document.getElementById('outputFormat').value;
            const quality = document.getElementById('quality').value / 100;
            
            const blob = await processor.toBlob(`image/${format}`, quality);
            const filename = this.generateFilename(currentImage.file.name, format);
            
            Utils.downloadFile(blob, filename);
            Utils.showNotification('圖片下載成功', 'success');
            
        } catch (error) {
            console.error('下載失敗:', error);
            Utils.showNotification('下載失敗', 'error');
        }
    }

    // 下載所有圖片
    async downloadAllImages() {
        if (this.images.length === 0) {
            Utils.showNotification('沒有可下載的圖片', 'warning');
            return;
        }
        
        try {
            Utils.updateProgress(0, '準備下載...');
            
            const format = document.getElementById('outputFormat').value;
            const quality = document.getElementById('quality').value / 100;
            const createZip = document.getElementById('createZip').checked;
            
            if (createZip) {
                // 創建ZIP文件
                await this.createAndDownloadZip(format, quality);
            } else {
                // 逐一下載
                for (let i = 0; i < this.images.length; i++) {
                    const progress = (i / this.images.length) * 100;
                    Utils.updateProgress(progress, `下載圖片 ${i + 1}/${this.images.length}`);
                    
                    const image = this.images[i];
                    const processor = image.processor;
                    const blob = await processor.toBlob(`image/${format}`, quality);
                    const filename = this.generateFilename(image.file.name, format);
                    
                    Utils.downloadFile(blob, filename);
                    
                    // 延遲避免瀏覽器阻止多個下載
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            Utils.updateProgress(100, '下載完成');
            Utils.showNotification('所有圖片下載完成', 'success');
            
        } catch (error) {
            console.error('批量下載失敗:', error);
            Utils.showNotification('批量下載失敗', 'error');
        }
    }

    // 創建並下載ZIP文件
    async createAndDownloadZip(format, quality) {
        // 這裡需要引入JSZip庫
        // 簡化版本：逐一下載
        for (let i = 0; i < this.images.length; i++) {
            const image = this.images[i];
            const processor = image.processor;
            const blob = await processor.toBlob(`image/${format}`, quality);
            const filename = this.generateFilename(image.file.name, format);
            
            Utils.downloadFile(blob, filename);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // 生成文件名
    generateFilename(originalName, format) {
        const prefix = document.getElementById('filenamePrefix').value;
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${prefix}${nameWithoutExt}.${format}`;
    }

    // 清空歷史
    clearHistory() {
        const confirmed = confirm('確定要清空處理歷史嗎？');
        if (confirmed) {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '<div class="history-item"><span class="history-time">尚未處理</span><span class="history-action">等待操作</span></div>';
            Utils.showNotification('歷史已清空', 'success');
        }
    }

    // 顯示設置
    showSettings() {
        Utils.showNotification('設置功能開發中', 'info');
    }

    // 更新圖片列表
    updateImageList() {
        const imageList = document.getElementById('imageList');
        if (!imageList) {
            console.error('找不到 imageList 元素');
            return;
        }
        
        console.log('更新圖片列表，圖片數量:', this.images.length);
        
        imageList.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            if (index === this.currentImageIndex) {
                imageItem.classList.add('active');
            }
            
            console.log('創建圖片項目:', {
                index: index,
                fileName: image.file.name,
                hasBase64: !!image.data.base64
            });
            
            imageItem.innerHTML = `
                <img src="${image.data.base64}" alt="${image.file.name}" style="max-width: 100%; max-height: 100%; object-fit: cover;">
                <div class="image-info">
                    <div class="image-name">${image.file.name}</div>
                    <div class="image-size">${Utils.formatFileSize(image.file.size)}</div>
                </div>
            `;
            
            imageItem.addEventListener('click', () => {
                this.currentImageIndex = index;
                this.updatePreview();
                this.updateImageCounter();
                
                // 更新活動狀態
                document.querySelectorAll('.image-item').forEach(item => {
                    item.classList.remove('active');
                });
                imageItem.classList.add('active');
            });
            
            imageList.appendChild(imageItem);
        });
    }

    // 更新預覽
    updatePreview() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer || this.images.length === 0) return;
        
        const currentImage = this.images[this.currentImageIndex];
        const processor = currentImage.processor;
        const processedImage = processor.getProcessedImage();
        
        console.log('更新預覽:', {
            currentImageIndex: this.currentImageIndex,
            imagesLength: this.images.length,
            processedImage: processedImage
        });
        
        previewContainer.innerHTML = `<img src="${processedImage.base64}" alt="預覽圖片" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
    }

    // 更新圖片計數器
    updateImageCounter() {
        const imageCounter = document.getElementById('imageCounter');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (imageCounter) {
            imageCounter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentImageIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentImageIndex === this.images.length - 1;
        }
    }

    // 更新下載按鈕
    updateDownloadButtons() {
        const downloadCurrent = document.getElementById('downloadCurrent');
        const downloadAll = document.getElementById('downloadAll');
        
        if (downloadCurrent) {
            downloadCurrent.disabled = this.images.length === 0;
        }
        
        if (downloadAll) {
            downloadAll.disabled = this.images.length === 0;
        }
    }

    // 添加到歷史記錄
    addToHistory(action) {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-time">${Utils.formatTime(new Date())}</span>
            <span class="history-action">${action}</span>
        `;
        
        historyList.appendChild(historyItem);
        historyList.scrollTop = historyList.scrollHeight;
    }


}

// 導出UI控制器
window.UIController = UIController; 