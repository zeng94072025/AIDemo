/**
 * UI控制器
 * 負責管理所有UI交互和事件處理
 */

class UIController {
    constructor() {
        this.currentImageIndex = 0;
        this.images = [];
        this.isProcessing = false;
        this.selectedImages = new Set(); // 新增：選中的圖片集合
        this.drawingProcessor = null; // 塗鴉標註處理器
        this.isDrawingMode = false; // 是否處於繪製模式
        
        this.initEventListeners();
        this.initTabSystem();
        this.initParameterControls();
        this.initDrawingControls();
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
        
        // 圖片導航控制
        this.initImageNavigation();
    }

    // 初始化文件上傳
    initFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const selectFileBtn = document.getElementById('selectFileBtn');
        
        console.log('初始化文件上傳:', {
            fileInput: !!fileInput,
            uploadArea: !!uploadArea,
            selectFileBtn: !!selectFileBtn
        });
        
        // 先移除舊的事件監聽器（如果存在）
        if (this.fileUploadHandlers) {
            this.removeFileUploadHandlers();
        }
        
        // 創建事件處理函數
        this.fileUploadHandlers = {
            fileInputChange: (e) => {
                console.log('文件輸入change事件觸發，文件數量:', e.target.files.length);
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files);
                }
                // 清空文件輸入，確保相同文件可以重複選擇
                e.target.value = '';
            },
            selectFileBtnClick: (e) => {
                console.log('選擇文件按鈕被點擊');
                e.stopPropagation(); // 防止事件冒泡
                e.preventDefault(); // 防止默認行為
                if (fileInput) {
                    fileInput.click();
                }
            },
            uploadAreaClick: (e) => {
                console.log('上傳區域被點擊');
                // 如果點擊的是按鈕，不觸發文件選擇
                if (e.target.closest('#selectFileBtn')) {
                    console.log('點擊的是按鈕，不觸發文件選擇');
                    return;
                }
                if (fileInput) {
                    fileInput.click();
                }
            }
        };
        
        // 添加事件監聽器
        if (fileInput) {
            fileInput.addEventListener('change', this.fileUploadHandlers.fileInputChange);
        }
        
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', this.fileUploadHandlers.selectFileBtnClick);
        }
        
        if (uploadArea) {
            uploadArea.addEventListener('click', this.fileUploadHandlers.uploadAreaClick);
        }
    }

    // 移除文件上傳事件監聽器
    removeFileUploadHandlers() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const selectFileBtn = document.getElementById('selectFileBtn');
        
        if (this.fileUploadHandlers) {
            if (fileInput) {
                fileInput.removeEventListener('change', this.fileUploadHandlers.fileInputChange);
            }
            if (selectFileBtn) {
                selectFileBtn.removeEventListener('click', this.fileUploadHandlers.selectFileBtnClick);
            }
            if (uploadArea) {
                uploadArea.removeEventListener('click', this.fileUploadHandlers.uploadAreaClick);
            }
            this.fileUploadHandlers = null;
        }
    }

    // 初始化工具按鈕
    initToolButtons() {
        // 智能優化按鈕
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = e.target.dataset.action;
                console.log('工具按鈕點擊:', action);
                this.handleToolAction(action);
            });
        });

        // 濾鏡按鈕
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const filter = e.target.dataset.filter;
                console.log('濾鏡按鈕點擊:', filter);
                this.handleFilterAction(filter);
            });
        });

        // 相框按鈕
        document.querySelectorAll('[data-frame]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const frame = e.target.dataset.frame;
                console.log('相框按鈕點擊:', frame);
                this.handleFrameAction(frame);
            });
        });

        // 繪製工具
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tool = e.target.dataset.tool;
                console.log('繪製工具點擊:', tool);
                this.handleDrawingTool(tool);
            });
        });

        // 標註工具
        document.querySelectorAll('[data-annotation]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const annotation = e.target.dataset.annotation;
                console.log('標註工具點擊:', annotation);
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
    }

    // 初始化設置控制
    initSettingsControls() {
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const settingsModal = document.getElementById('settingsModal');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.classList.add('active');
            });
        }
        
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => {
                settingsModal.classList.remove('active');
            });
        }
        
        // 點擊模態框外部關閉
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.classList.remove('active');
                }
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
    }

    // 初始化塗鴉標註控制
    initDrawingControls() {
        // 顏色控制
        const colorInput = document.getElementById('drawingColor');
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                if (this.drawingProcessor) {
                    this.drawingProcessor.setColor(e.target.value);
                }
            });
        }

        // 畫筆大小控制
        const brushSizeSlider = document.getElementById('brushSize');
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                if (this.drawingProcessor) {
                    this.drawingProcessor.setBrushSize(parseInt(e.target.value));
                }
                // 更新顯示的大小值
                const sizeValue = document.getElementById('brushSizeValue');
                if (sizeValue) {
                    sizeValue.textContent = `${e.target.value}px`;
                }
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

        // 檢查重複文件並自動跳過
        const newFiles = [];
        const duplicateFiles = [];
        
        for (const file of validFiles) {
            // 更精確的重複檢測：檢查文件名、大小、修改時間和內容哈希
            const isDuplicate = this.images.some(image => {
                const sameName = image.file.name === file.name;
                const sameSize = image.file.size === file.size;
                const sameTime = image.file.lastModified === file.lastModified;
                
                // 如果基本信息都相同，認為是重複文件
                return sameName && sameSize && sameTime;
            });
            
            if (isDuplicate) {
                duplicateFiles.push(file.name);
                console.log(`跳過重複文件: ${file.name}`);
            } else {
                newFiles.push(file);
            }
        }
        
        // 顯示重複文件統計信息
        if (duplicateFiles.length > 0) {
            const duplicateCount = duplicateFiles.length;
            const newCount = newFiles.length;
            let message = `跳過 ${duplicateCount} 個重複文件`;
            if (newCount > 0) {
                message += `，繼續處理 ${newCount} 個新文件`;
            }
            Utils.showTopCenterNotification(message, 'info', 3000);
        }
        
        // 如果沒有新文件，直接返回
        if (newFiles.length === 0) {
            Utils.showTopCenterNotification('所有文件都是重複的，已跳過', 'info', 2000);
            return;
        }

        try {
            Utils.updateProgress(0, '正在載入圖片...');
            
            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const progress = (i / newFiles.length) * 100;
                Utils.updateProgress(progress, `載入圖片 ${i + 1}/${newFiles.length}`);
                
                await this.loadImage(file);
            }
            
            Utils.updateProgress(100, '圖片載入完成');
            
            // 顯示最終結果
            const totalProcessed = newFiles.length;
            const totalSkipped = duplicateFiles.length;
            
            if (totalProcessed > 0) {
                let successMessage = `成功載入 ${totalProcessed} 張圖片`;
                if (totalSkipped > 0) {
                    successMessage += `，跳過 ${totalSkipped} 張重複圖片`;
                }
                Utils.showTopCenterNotification(successMessage, 'success');
            }
            
        } catch (error) {
            console.error('載入圖片失敗:', error);
            Utils.showNotification('載入圖片失敗', 'error');
        }
    }

    // 載入單張圖片
    async loadImage(file) {
        try {
            console.log('開始載入圖片:', file.name);
            
            // 使用修復後的圖片處理器
            const processor = new FixedImageProcessor();
            const imageData = await processor.loadImage(file);
            
            // 獲取圖片的 base64 數據
            const base64Data = processor.toBase64();
            
            console.log('圖片載入成功:', {
                fileName: file.name,
                imageData: imageData,
                hasBase64: !!(base64Data && base64Data !== '')
            });
            
            this.images.push({
                file: file,
                data: {
                    ...imageData,
                    base64: base64Data
                },
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

    // 處理工具動作 - 只對選中的圖片進行處理
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
            // 確定要處理的圖片：如果有選中的圖片則處理選中的，否則處理當前圖片
            const imagesToProcess = this.selectedImages.size > 0 
                ? Array.from(this.selectedImages).map(index => this.images[index])
                : [this.images[this.currentImageIndex]];
            
            console.log('開始處理工具動作:', {
                action: action,
                imagesToProcess: imagesToProcess.length,
                selectedCount: this.selectedImages.size
            });
            
            Utils.updateProgress(0, '正在處理圖片...');
            
            for (let i = 0; i < imagesToProcess.length; i++) {
                const image = imagesToProcess[i];
                const processor = image.processor;
                const progress = (i / imagesToProcess.length) * 100;
                Utils.updateProgress(progress, `處理圖片 ${i + 1}/${imagesToProcess.length}`);
                
                console.log(`處理圖片 ${i + 1}:`, image.file.name);
                
                switch (action) {
                    case 'brighten':
                        processor.adjustBrightness(20);
                        break;
                    case 'contrast':
                        processor.adjustContrast(20);
                        break;
                    case 'grayscale':
                        processor.applyFilter('grayscale');
                        break;
                    case 'sepia':
                        processor.applyFilter('sepia');
                        break;
                    case 'invert':
                        processor.applyFilter('invert');
                        break;
                    default:
                        console.warn('不支持的工具動作:', action);
                        break;
                }
                
                // 更新圖片的處理後數據
                try {
                    const processedBase64 = processor.toBase64();
                    if (processedBase64 && processedBase64 !== '') {
                        image.processedData = {
                            base64: processedBase64
                        };
                        console.log(`圖片 ${image.file.name} 處理完成`);
                    } else {
                        console.warn(`圖片 ${image.file.name} 處理後數據為空`);
                    }
                } catch (error) {
                    console.error('更新處理後數據失敗:', error);
                }
            }
            
            Utils.updateProgress(100, '處理完成');
            
            this.updatePreview();
            this.updateImageList();
            Utils.showTopCenterNotification(`${action} 完成，處理了 ${imagesToProcess.length} 張圖片`, 'success');
            
        } catch (error) {
            console.error('處理失敗:', error);
            Utils.showNotification('處理失敗', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    // 處理濾鏡動作 - 只對選中的圖片進行處理
    async handleFilterAction(filter) {
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
            // 確定要處理的圖片：如果有選中的圖片則處理選中的，否則處理當前圖片
            const imagesToProcess = this.selectedImages.size > 0 
                ? Array.from(this.selectedImages).map(index => this.images[index])
                : [this.images[this.currentImageIndex]];
            
            console.log('開始應用濾鏡:', {
                filter: filter,
                imagesToProcess: imagesToProcess.length,
                selectedCount: this.selectedImages.size
            });
            
            Utils.updateProgress(0, '正在應用濾鏡...');
            
            for (let i = 0; i < imagesToProcess.length; i++) {
                const image = imagesToProcess[i];
                const processor = image.processor;
                const progress = (i / imagesToProcess.length) * 100;
                Utils.updateProgress(progress, `應用濾鏡 ${i + 1}/${imagesToProcess.length}`);
                
                console.log(`應用濾鏡到圖片 ${i + 1}:`, image.file.name);
                
                processor.applyFilter(filter);
                
                // 更新圖片的處理後數據
                try {
                    const processedBase64 = processor.toBase64();
                    if (processedBase64 && processedBase64 !== '') {
                        image.processedData = {
                            base64: processedBase64
                        };
                        console.log(`圖片 ${image.file.name} 濾鏡處理完成`);
                    } else {
                        console.warn(`圖片 ${image.file.name} 濾鏡處理後數據為空`);
                    }
                } catch (error) {
                    console.error('更新濾鏡處理後數據失敗:', error);
                }
            }
            
            Utils.updateProgress(100, '濾鏡應用完成');
            
            this.updatePreview();
            this.updateImageList();
            Utils.showTopCenterNotification(`${filter}濾鏡應用完成，處理了 ${imagesToProcess.length} 張圖片`, 'success');
            
        } catch (error) {
            console.error('濾鏡應用失敗:', error);
            Utils.showNotification('濾鏡應用失敗', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    // 處理相框動作
    async handleFrameAction(frame) {
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
            // 確定要處理的圖片：如果有選中的圖片則處理選中的，否則處理當前圖片
            const imagesToProcess = this.selectedImages.size > 0 
                ? Array.from(this.selectedImages).map(index => this.images[index])
                : [this.images[this.currentImageIndex]];
            
            console.log('開始應用相框:', {
                frame: frame,
                imagesToProcess: imagesToProcess.length,
                selectedCount: this.selectedImages.size
            });
            
            Utils.updateProgress(0, '正在應用相框...');
            
            for (let i = 0; i < imagesToProcess.length; i++) {
                const image = imagesToProcess[i];
                const processor = image.processor;
                const progress = (i / imagesToProcess.length) * 100;
                Utils.updateProgress(progress, `應用相框 ${i + 1}/${imagesToProcess.length}`);
                
                console.log(`應用相框到圖片 ${i + 1}:`, image.file.name);
                
                const success = processor.applyFrame(frame);
                
                if (success) {
                    // 更新圖片的處理後數據
                    try {
                        const processedBase64 = processor.toBase64();
                        if (processedBase64 && processedBase64 !== '') {
                            image.processedData = {
                                base64: processedBase64
                            };
                            console.log(`圖片 ${image.file.name} 相框處理完成`);
                        }
                    } catch (error) {
                        console.error('更新相框處理後數據失敗:', error);
                    }
                } else {
                    console.error(`圖片 ${image.file.name} 相框處理失敗`);
                }
            }
            
            Utils.updateProgress(100, '相框應用完成');
            
            this.updatePreview();
            this.updateImageList();
            Utils.showTopCenterNotification(`${frame}相框應用完成，處理了 ${imagesToProcess.length} 張圖片`, 'success');
            
        } catch (error) {
            console.error('相框應用失敗:', error);
            Utils.showNotification('相框應用失敗', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    // 處理繪製工具
    handleDrawingTool(tool) {
        // 檢查是否有圖片載入
        if (this.images.length === 0) {
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }

        // 移除所有活動狀態
        document.querySelectorAll('.drawing-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加活動狀態
        event.target.classList.add('active');
        
        // 初始化繪製模式
        this.initDrawingMode(tool);
        
        Utils.showNotification(`${tool}工具已選擇`, 'info');
    }

    // 初始化繪製模式
    initDrawingMode(tool) {
        if (!this.isDrawingMode) {
            this.enterDrawingMode();
        }
        
        if (this.drawingProcessor) {
            this.drawingProcessor.setTool(tool);
        }
    }

    // 進入繪製模式
    enterDrawingMode() {
        const drawingCanvas = document.getElementById('drawingCanvas');
        const previewContainer = document.getElementById('previewContainer');
        
        if (!drawingCanvas || !previewContainer) {
            console.error('找不到繪製畫布或預覽容器');
            return;
        }

        // 設置畫布尺寸和位置
        const containerRect = previewContainer.getBoundingClientRect();
        drawingCanvas.width = containerRect.width;
        drawingCanvas.height = containerRect.height;
        drawingCanvas.style.left = containerRect.left + 'px';
        drawingCanvas.style.top = containerRect.top + 'px';
        drawingCanvas.style.display = 'block';

        // 初始化繪製處理器
        if (!this.drawingProcessor) {
            this.drawingProcessor = new DrawingProcessor(drawingCanvas);
        }

        this.isDrawingMode = true;
        console.log('已進入繪製模式');
    }

    // 退出繪製模式
    exitDrawingMode() {
        const drawingCanvas = document.getElementById('drawingCanvas');
        if (drawingCanvas) {
            drawingCanvas.style.display = 'none';
        }

        if (this.drawingProcessor) {
            this.drawingProcessor.destroy();
            this.drawingProcessor = null;
        }

        this.isDrawingMode = false;
        console.log('已退出繪製模式');
    }

    // 處理標註工具
    handleAnnotationTool(annotation) {
        // 檢查是否有圖片載入
        if (this.images.length === 0) {
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }

        // 移除所有活動狀態
        document.querySelectorAll('.annotation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加活動狀態
        event.target.classList.add('active');
        
        // 初始化繪製模式
        this.initDrawingMode('annotation');
        
        // 設置標註工具
        this.setAnnotationTool(annotation);
        
        Utils.showNotification(`${annotation}工具已選擇`, 'info');
    }

    // 設置標註工具
    setAnnotationTool(annotation) {
        if (!this.drawingProcessor) return;

        // 為標註工具添加點擊事件
        const drawingCanvas = document.getElementById('drawingCanvas');
        if (!drawingCanvas) return;

        // 移除舊的點擊事件
        drawingCanvas.removeEventListener('click', this.handleAnnotationClick);
        
        // 添加新的點擊事件
        this.currentAnnotation = annotation;
        drawingCanvas.addEventListener('click', this.handleAnnotationClick.bind(this));
    }

    // 處理標註點擊事件
    handleAnnotationClick(e) {
        if (!this.drawingProcessor || !this.currentAnnotation) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        switch (this.currentAnnotation) {
            case 'arrow':
                // 簡單的箭頭標註
                this.drawingProcessor.drawArrow(x - 20, y, x + 20, y);
                break;
            case 'highlight':
                // 高亮區域
                this.drawingProcessor.drawHighlight(x - 30, y - 20, 60, 40);
                break;
            case 'stamp':
                // 印章
                this.drawingProcessor.drawStamp(x, y, '✓');
                break;
            case 'measure':
                // 測量標註
                this.drawingProcessor.addText('測量點', x, y - 10);
                break;
        }
    }

    // 更新繪製畫布位置
    updateDrawingCanvasPosition() {
        const drawingCanvas = document.getElementById('drawingCanvas');
        const previewContainer = document.getElementById('previewContainer');
        
        if (!drawingCanvas || !previewContainer) return;

        const containerRect = previewContainer.getBoundingClientRect();
        drawingCanvas.style.left = containerRect.left + 'px';
        drawingCanvas.style.top = containerRect.top + 'px';
        drawingCanvas.width = containerRect.width;
        drawingCanvas.height = containerRect.height;
    }

    // 處理參數變化 - 只對選中的圖片進行處理
    handleParameterChange(parameter, value) {
        if (this.images.length === 0) return;
        
        // 確定要處理的圖片：如果有選中的圖片則處理選中的，否則處理當前圖片
        const imagesToProcess = this.selectedImages.size > 0 
            ? Array.from(this.selectedImages).map(index => this.images[index])
            : [this.images[this.currentImageIndex]];
        
        imagesToProcess.forEach(image => {
            const processor = image.processor;
            
            switch (parameter) {
                case 'brightness':
                    processor.adjustBrightness(parseInt(value));
                    break;
                case 'contrast':
                    processor.adjustContrast(parseInt(value));
                    break;
                default:
                    console.warn('不支持的參數:', parameter);
                    break;
            }
            
            // 更新圖片的處理後數據
            try {
                const processedBase64 = processor.toBase64();
                if (processedBase64 && processedBase64 !== '') {
                    image.processedData = {
                        base64: processedBase64
                    };
                    console.log(`圖片 ${image.file.name} 參數調整完成，數據已更新`);
                } else {
                    console.warn(`圖片 ${image.file.name} 參數調整後數據為空`);
                }
            } catch (error) {
                console.error('更新處理後數據失敗:', error);
            }
        });
        
        this.updatePreview();
        this.updateImageList();
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
            
            // 驗證處理器是否有效
            if (!processor) {
                throw new Error('圖片處理器無效');
            }
            
            const format = document.getElementById('outputFormat').value;
            const quality = document.getElementById('quality').value / 100;
            
            console.log('開始生成 Blob:', {
                format: format,
                quality: quality,
                imageName: currentImage.file.name
            });
            
            const blob = await processor.toBlob(`image/${format}`, quality);
            
            // 驗證生成的 blob
            if (!blob || blob.size === 0) {
                throw new Error('生成的 Blob 無效或為空');
            }
            
            console.log('Blob 生成成功:', {
                blobSize: blob.size,
                blobType: blob.type
            });
            
            const filename = this.generateFilename(currentImage.file.name, format);
            
            // 檢查是否為處理後的圖片（與原圖不同）
            const isProcessed = this.isImageProcessed(currentImage);
            
            if (isProcessed) {
                // 如果是處理後的圖片，詢問是否覆蓋原圖
                const originalName = currentImage.file.name;
                const processedName = filename;
                
                const confirmMessage = `檢測到圖片已進行處理，是否覆蓋原圖片？\n\n原圖片：${originalName}\n處理後：${processedName}`;
                const confirmed = await Utils.showConfirm(confirmMessage, '確認覆蓋原圖片');
                
                if (!confirmed) {
                    Utils.showTopCenterNotification('下載已取消', 'info');
                    return;
                }
            }
            
            Utils.downloadFile(blob, filename);
            Utils.showTopCenterNotification('圖片下載成功，請選擇保存位置', 'success');
            
        } catch (error) {
            console.error('下載失敗:', error);
            Utils.showNotification(`下載失敗: ${error.message}`, 'error');
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
            
            // 無論單張還是多張圖片，都打包成ZIP格式
            await this.createAndDownloadZip(format, quality);
            
        } catch (error) {
            console.error('批量下載失敗:', error);
            Utils.showNotification('批量下載失敗', 'error');
        }
    }

    // 創建並下載ZIP文件
    async createAndDownloadZip(format, quality) {
        try {
            Utils.updateProgress(0, '正在準備壓縮文件...');
            
            // 檢查JSZip是否可用
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip庫未載入');
            }
            
            const zip = new JSZip();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const folderName = `processed_images_${timestamp}`;
            
            let successCount = 0;
            let errorCount = 0;
            
            // 添加所有圖片到壓縮包
            for (let i = 0; i < this.images.length; i++) {
                const image = this.images[i];
                const processor = image.processor;
                const progress = (i / this.images.length) * 100;
                Utils.updateProgress(progress, `處理圖片 ${i + 1}/${this.images.length}`);
                
                try {
                    // 驗證處理器
                    if (!processor) {
                        console.error(`圖片 ${image.file.name} 的處理器無效`);
                        errorCount++;
                        continue;
                    }
                    
                    const blob = await processor.toBlob(`image/${format}`, quality);
                    
                    // 驗證生成的 blob
                    if (!blob || blob.size === 0) {
                        console.error(`圖片 ${image.file.name} 生成的 Blob 無效`);
                        errorCount++;
                        continue;
                    }
                    
                    const filename = this.generateFilename(image.file.name, format);
                    
                    // 將圖片添加到壓縮包
                    zip.file(`${folderName}/${filename}`, blob);
                    successCount++;
                    
                    console.log(`圖片 ${image.file.name} 處理成功:`, {
                        blobSize: blob.size,
                        filename: filename
                    });
                    
                } catch (error) {
                    console.error(`處理圖片 ${image.file.name} 失敗:`, error);
                    errorCount++;
                    // 繼續處理其他圖片
                }
            }
            
            if (successCount === 0) {
                throw new Error('沒有成功處理的圖片');
            }
            
            Utils.updateProgress(90, '正在生成壓縮文件...');
            
            // 生成壓縮文件
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            
            // 驗證 ZIP blob
            if (!zipBlob || zipBlob.size === 0) {
                throw new Error('生成的 ZIP 文件無效');
            }
            
            Utils.updateProgress(100, '壓縮完成');
            
            // 下載ZIP文件
            const zipFilename = `processed_images_${timestamp}.zip`;
            Utils.downloadFile(zipBlob, zipFilename);
            
            // 根據處理結果顯示不同的提示信息
            let message = `已打包 ${successCount} 張圖片`;
            if (errorCount > 0) {
                message += `，${errorCount} 張處理失敗`;
            }
            
            Utils.showTopCenterNotification(message, successCount > 0 ? 'success' : 'warning');
            
        } catch (error) {
            console.error('創建 ZIP 文件失敗:', error);
            Utils.showNotification(`批量下載失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    // 檢查圖片是否已處理
    isImageProcessed(image) {
        // 檢查是否有處理後的數據
        if (image.processedData && image.processedData.base64) {
            return true;
        }
        
        // 檢查處理器是否有處理歷史
        if (image.processor && image.processor.history && image.processor.history.length > 1) {
            return true;
        }
        
        // 檢查是否有任何處理操作（通過比較原始數據和當前數據）
        try {
            const currentData = image.processor.getProcessedImage();
            const originalData = image.data.base64;
            
            // 如果當前數據與原始數據不同，說明已處理
            if (currentData && currentData.base64 && currentData.base64 !== originalData) {
                return true;
            }
        } catch (error) {
            console.error('檢查圖片處理狀態失敗:', error);
        }
        
        return false;
    }

    // 生成文件名
    generateFilename(originalName, format) {
        const prefix = document.getElementById('filenamePrefix')?.value || 'processed_';
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${prefix}${nameWithoutExt}.${format}`;
    }

    // 更新圖片列表
    updateImageList() {
        const imageList = document.getElementById('imageList');
        if (!imageList) {
            console.error('找不到 imageList 元素');
            return;
        }
        
        console.log('更新圖片列表，圖片數量:', this.images.length);
        
        // 更新圖片數量提示
        this.updateUploadedCountHint();
        
        imageList.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            if (index === this.currentImageIndex) {
                imageItem.classList.add('active');
            }
            
            // 添加選中狀態
            if (this.selectedImages.has(index)) {
                imageItem.classList.add('selected');
            }
            
            console.log('創建圖片項目:', {
                index: index,
                fileName: image.file.name,
                hasBase64: !!(image.data.base64 && image.data.base64 !== '')
            });
            
            imageItem.innerHTML = `
                <div style="position: relative; width: 100%; height: 100%;">
                    <img src="${image.data.base64}" alt="${image.file.name}" style="max-width: 100%; max-height: 100%; object-fit: cover;">
                    <button class="delete-btn" title="刪除圖片">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="image-info">
                    <div class="image-name">${image.file.name}</div>
                    <div class="image-size">${Utils.formatFileSize(image.file.size)}</div>
                </div>
                <div class="image-actions">
                    <button class="select-btn" title="選擇圖片">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
            
            // 點擊圖片項目
            imageItem.addEventListener('click', (e) => {
                // 如果點擊的是選擇按鈕，則切換選中狀態
                if (e.target.closest('.select-btn')) {
                    e.stopPropagation();
                    this.toggleImageSelection(index);
                    return;
                }
                
                // 如果點擊的是刪除按鈕，則刪除圖片
                if (e.target.closest('.delete-btn')) {
                    e.stopPropagation();
                    this.deleteImage(index);
                    return;
                }
                
                // 否則切換到該圖片
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
        
        // 更新導航按鈕狀態
        this.updateNavigationButtons();
    }

    // 更新已上傳圖片數量提示
    updateUploadedCountHint() {
        const countHint = document.getElementById('uploadedCountHint');
        if (!countHint) return;
        
        const count = this.images.length;
        if (count === 0) {
            countHint.textContent = '總計：0 張圖片';
        } else if (count === 1) {
            countHint.textContent = '總計：1 張圖片';
        } else {
            countHint.textContent = `總計：${count} 張圖片`;
        }
    }

    // 刪除圖片
    deleteImage(index) {
        if (index < 0 || index >= this.images.length) return;
        
        const imageToDelete = this.images[index];
        const fileName = imageToDelete.file.name;
        
        // 清理圖片處理器
        if (imageToDelete.processor) {
            imageToDelete.processor.destroy();
        }
        
        // 從選中集合中移除
        this.selectedImages.delete(index);
        
        // 從圖片數組中移除
        this.images.splice(index, 1);
        
        // 調整當前圖片索引
        if (this.images.length === 0) {
            this.currentImageIndex = 0;
        } else if (this.currentImageIndex >= this.images.length) {
            this.currentImageIndex = this.images.length - 1;
        }
        
        // 更新選中圖片的索引（因為數組變化了）
        const newSelectedImages = new Set();
        this.selectedImages.forEach(oldIndex => {
            if (oldIndex < index) {
                newSelectedImages.add(oldIndex);
            } else if (oldIndex > index) {
                newSelectedImages.add(oldIndex - 1);
            }
        });
        this.selectedImages = newSelectedImages;
        
        // 更新界面
        this.updateImageList();
        this.updatePreview();
        this.updateImageCounter();
        this.updateDownloadButtons();
        
        // 顯示刪除成功提示
        Utils.showTopCenterNotification(`已刪除圖片：${fileName}`, 'success', 2000);
    }

    // 切換圖片選中狀態
    toggleImageSelection(index) {
        if (this.selectedImages.has(index)) {
            this.selectedImages.delete(index);
        } else {
            this.selectedImages.add(index);
        }
        
        this.updateImageList();
        this.updatePreview(); // 更新預覽以顯示選中的圖片
        
        // 顯示選中狀態
        // const selectedCount = this.selectedImages.size;
        // if (selectedCount > 0) {
        //     Utils.showNotification(`已選中 ${selectedCount} 張圖片`, 'info', 2000);
        // }
    }

    // 更新預覽
    updatePreview() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) {
            console.error('找不到預覽容器');
            return;
        }
        
        if (this.images.length === 0) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <p>等待圖片</p>
                </div>
            `;
            return;
        }
        
        // 如果有選中的圖片，顯示所有選中圖片的預覽
        if (this.selectedImages.size > 0) {
            this.updateSelectedImagesPreview();
            return;
        }
        
        // 否則顯示當前圖片的預覽
        const currentImage = this.images[this.currentImageIndex];
        const processor = currentImage.processor;
        
        console.log('更新預覽:', {
            currentImageIndex: this.currentImageIndex,
            imagesLength: this.images.length,
            currentImage: currentImage.file.name
        });
        
        // 優先使用處理後的圖片數據
        let imageSrc = null;
        
        if (currentImage.processedData && currentImage.processedData.base64) {
            imageSrc = currentImage.processedData.base64;
            console.log('使用處理後的圖片數據');
        } else {
            try {
                // 從處理器獲取當前圖片數據
                imageSrc = processor.toBase64();
                if (imageSrc && imageSrc !== '') {
                    console.log('從處理器獲取圖片數據');
                } else {
                    console.warn('處理器返回的圖片數據為空');
                    imageSrc = currentImage.data.base64;
                    console.log('回退到原始圖片數據');
                }
            } catch (error) {
                console.error('從處理器獲取圖片數據失敗:', error);
                // 回退到原始數據
                imageSrc = currentImage.data.base64;
                console.log('回退到原始圖片數據');
            }
        }
        
        if (!imageSrc || imageSrc === '') {
            console.error('無法獲取圖片數據');
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>圖片載入失敗</p>
                </div>
            `;
            return;
        }
        
        console.log('設置預覽圖片:', {
            hasImageSrc: !!imageSrc,
            srcLength: imageSrc.length,
            srcPrefix: imageSrc.substring(0, 50)
        });
        
        previewContainer.innerHTML = `<img src="${imageSrc}" alt="預覽圖片" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        
        // 如果在繪製模式下，更新繪製畫布位置
        if (this.isDrawingMode && this.drawingProcessor) {
            setTimeout(() => {
                this.updateDrawingCanvasPosition();
            }, 100);
        }
    }

    // 更新選中圖片的預覽
    updateSelectedImagesPreview() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;
        
        const selectedImages = Array.from(this.selectedImages).map(index => this.images[index]);
        
        if (selectedImages.length === 0) return;
        
        console.log('更新選中圖片預覽:', {
            selectedCount: selectedImages.length,
            selectedIndices: Array.from(this.selectedImages)
        });
        
        // 清空預覽容器
        previewContainer.innerHTML = '';
        
        // 創建預覽容器
        const previewWrapper = document.createElement('div');
        previewWrapper.style.cssText = 'display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; align-items: flex-start; max-height: 100%; overflow-y: auto; padding: 16px; width: 100%;';
        
        let displayedCount = 0;
        
        // 為每個選中的圖片創建預覽元素
        selectedImages.forEach((image, index) => {
            const processor = image.processor;
            let imageSrc = null;
            
            // 優先使用處理後的圖片數據
            if (image.processedData && image.processedData.base64) {
                imageSrc = image.processedData.base64;
                console.log(`圖片 ${image.file.name} 使用緩存的處理後數據`);
            } else {
                try {
                    // 使用新的簡化方法獲取圖片數據
                    imageSrc = processor.toBase64();
                    if (imageSrc && imageSrc !== '') {
                        console.log(`圖片 ${image.file.name} 使用處理後數據`);
                    } else {
                        console.warn(`圖片 ${image.file.name} 處理後數據為空`);
                        // 回退到原始數據
                        if (image.data && image.data.base64) {
                            imageSrc = image.data.base64;
                            console.log(`圖片 ${image.file.name} 使用原始數據`);
                        }
                    }
                } catch (error) {
                    console.error('獲取處理後圖片失敗:', error);
                    // 回退到原始數據
                    if (image.data && image.data.base64) {
                        imageSrc = image.data.base64;
                        console.log(`圖片 ${image.file.name} 使用原始數據`);
                    }
                }
            }
            
            // 如果沒有處理後的數據，使用原始數據
            if (!imageSrc && image.data && image.data.base64) {
                imageSrc = image.data.base64;
                console.log(`圖片 ${image.file.name} 使用原始數據`);
            }
            
            if (imageSrc) {
                displayedCount++;
                
                // 創建圖片容器
                const imageContainer = document.createElement('div');
                imageContainer.style.cssText = 'text-align: center; max-width: 200px; min-width: 150px; flex-shrink: 0;';
                
                // 創建圖片元素
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = image.file.name;
                img.style.cssText = 'max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
                
                // 創建文件名標籤
                const fileName = document.createElement('div');
                fileName.style.cssText = 'font-size: 12px; color: var(--text-secondary); margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                fileName.textContent = image.file.name;
                
                // 組裝元素
                imageContainer.appendChild(img);
                imageContainer.appendChild(fileName);
                previewWrapper.appendChild(imageContainer);
                
                console.log(`成功添加圖片預覽: ${image.file.name}`);
            } else {
                console.error('無法獲取圖片數據:', image.file.name);
            }
        });
        
        if (displayedCount === 0) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>無法顯示選中的圖片</p>
                </div>
            `;
        } else {
            previewContainer.appendChild(previewWrapper);
        }
        
        console.log('選中圖片預覽更新完成:', {
            totalSelected: selectedImages.length,
            displayedCount: displayedCount
        });
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

    // 初始化圖片導航控制
    initImageNavigation() {
        const navLeft = document.getElementById('navLeft');
        const navRight = document.getElementById('navRight');
        
        if (navLeft) {
            navLeft.addEventListener('click', () => {
                this.navigateImages('left');
            });
        }
        
        if (navRight) {
            navRight.addEventListener('click', () => {
                this.navigateImages('right');
            });
        }
    }

    // 圖片導航邏輯
    navigateImages(direction) {
        const imageList = document.getElementById('imageList');
        if (!imageList) return;
        
        const containerWidth = imageList.offsetWidth;
        const scrollAmount = containerWidth * 0.8; // 每次滾動80%的容器寬度
        
        if (direction === 'left') {
            imageList.scrollLeft -= scrollAmount;
        } else {
            imageList.scrollLeft += scrollAmount;
        }
        
        // 更新導航按鈕狀態
        this.updateNavigationButtons();
    }

    // 更新導航按鈕狀態
    updateNavigationButtons() {
        const imageList = document.getElementById('imageList');
        const navLeft = document.getElementById('navLeft');
        const navRight = document.getElementById('navRight');
        
        if (!imageList || !navLeft || !navRight) return;
        
        const isAtStart = imageList.scrollLeft <= 0;
        const isAtEnd = imageList.scrollLeft >= (imageList.scrollWidth - imageList.offsetWidth);
        
        navLeft.disabled = isAtStart;
        navRight.disabled = isAtEnd;
    }
}

// 導出UI控制器
window.UIController = UIController; 