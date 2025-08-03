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
        this.aiProcessor = null; // AI圖片處理器
        this.isAIProcessing = false; // 是否正在AI處理
        this.eventListenersInitialized = false; // 防止重複初始化
        this.selectedRegion = null; // 新增：選中的區域
        this.isSelectingRegion = false; // 新增：是否正在選擇區域
        this.selectionStart = null; // 新增：選擇開始點
        this.selectionEnd = null; // 新增：選擇結束點
        
        console.log('UIController 開始初始化...');
        
        // 立即初始化，確保事件監聽器正確綁定
        this.initEventListeners();
        this.initTabSystem();
        this.initParameterControls();
        this.initDrawingControls();
        this.initDrawingTools(); // 新增：初始化繪製工具
        this.initRegionSelection(); // 新增：初始化區域選擇
        
        console.log('UIController 初始化完成');
    }

    // 初始化事件監聽器
    initEventListeners() {
        if (this.eventListenersInitialized) {
            console.log('事件監聽器已經初始化，跳過重複初始化');
            return;
        }
        
        console.log('開始初始化事件監聽器...');
        
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
        
        this.eventListenersInitialized = true;
        console.log('事件監聽器初始化完成');
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
        console.log('初始化工具按鈕...');
        
        // 使用事件委託來處理動態添加的按鈕
        const toolsContent = document.querySelector('.tools-content');
        if (toolsContent) {
            console.log('找到 tools-content 元素，設置事件委託');
            
            toolsContent.addEventListener('click', (e) => {
                const target = e.target;
                console.log('工具區域點擊事件:', target.tagName, target.className);
                
                // 查找最近的具有data屬性的元素
                const actionButton = target.closest('[data-action]');
                const filterButton = target.closest('[data-filter]');
                const frameButton = target.closest('[data-frame]');
                const toolButton = target.closest('[data-tool]');
                const annotationButton = target.closest('[data-annotation]');
                const aiButton = target.closest('[data-ai]');
                
                // 處理 data-action 按鈕
                if (actionButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const action = actionButton.dataset.action;
                    console.log('工具按鈕點擊:', action);
                    this.handleToolAction(action);
                    return;
                }
                
                // 處理 data-filter 按鈕
                if (filterButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const filter = filterButton.dataset.filter;
                    console.log('濾鏡按鈕點擊:', filter);
                    this.handleFilterAction(filter);
                    return;
                }
                
                // 處理 data-frame 按鈕
                if (frameButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const frame = frameButton.dataset.frame;
                    console.log('相框按鈕點擊:', frame);
                    this.handleFrameAction(frame);
                    return;
                }
                
                // 處理 data-tool 按鈕
                if (toolButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const tool = toolButton.dataset.tool;
                    console.log('繪製工具點擊:', tool);
                    this.handleDrawingTool(tool, e);
                    return;
                }
                
                // 處理 data-annotation 按鈕
                if (annotationButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const annotation = annotationButton.dataset.annotation;
                    console.log('標註工具點擊:', annotation);
                    this.handleAnnotationTool(annotation);
                    return;
                }
                
                // 處理 data-ai 按鈕
                if (aiButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const aiAction = aiButton.dataset.ai;
                    console.log('AI工具點擊:', aiAction);
                    this.handleAIAction(aiAction);
                    return;
                }
            });
        } else {
            console.error('未找到 .tools-content 元素');
        }
        
        // 統計按鈕數量
        const actionButtons = document.querySelectorAll('[data-action]');
        const filterButtons = document.querySelectorAll('[data-filter]');
        const frameButtons = document.querySelectorAll('[data-frame]');
        const toolButtons = document.querySelectorAll('[data-tool]');
        const annotationButtons = document.querySelectorAll('[data-annotation]');
        const aiButtons = document.querySelectorAll('[data-ai]');
        
        console.log('按鈕統計:', {
            action: actionButtons.length,
            filter: filterButtons.length,
            frame: frameButtons.length,
            tool: toolButtons.length,
            annotation: annotationButtons.length,
            ai: aiButtons.length
        });
        
        // 檢查具體的按鈕
        actionButtons.forEach((btn, index) => {
            console.log(`工具按鈕 ${index + 1}:`, btn.textContent.trim(), btn.dataset.action);
        });
        
        filterButtons.forEach((btn, index) => {
            console.log(`濾鏡按鈕 ${index + 1}:`, btn.textContent.trim(), btn.dataset.filter);
        });
        
        aiButtons.forEach((btn, index) => {
            console.log(`AI按鈕 ${index + 1}:`, btn.textContent.trim(), btn.dataset.ai);
        });
        
        console.log('工具按鈕初始化完成');
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
                // 更新预设颜色按钮状态
                this.updateColorButtonState(e.target.value);
            });
        }

        // 预设颜色按钮控制
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = btn.dataset.color;
                if (this.drawingProcessor) {
                    this.drawingProcessor.setColor(color);
                }
                // 更新颜色选择器
                if (colorInput) {
                    colorInput.value = color;
                }
                // 更新按钮状态
                this.updateColorButtonState(color);
            });
        });

        // 渐变色按钮控制
        const gradientButtons = document.querySelectorAll('.gradient-btn');
        gradientButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gradient = btn.dataset.gradient;
                if (this.drawingProcessor) {
                    this.drawingProcessor.setGradient(gradient);
                }
                // 更新渐变色按钮状态
                this.updateGradientButtonState(gradient);
            });
        });

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

    // 更新颜色按钮状态
    updateColorButtonState(selectedColor) {
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === selectedColor) {
                btn.classList.add('active');
            }
        });
    }

    // 更新渐变色按钮状态
    updateGradientButtonState(selectedGradient) {
        const gradientButtons = document.querySelectorAll('.gradient-btn');
        gradientButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.gradient === selectedGradient) {
                btn.classList.add('active');
            }
        });
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
            
            // 使用可靠的圖片處理器
            const processor = new ReliableImageProcessor();
            const imageData = await processor.loadImage(file);
            
            // 獲取圖片的 base64 數據
            const base64Data = processor.toBase64('image/jpeg', 0.9);
            
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
        console.log('handleToolAction 被調用:', action);
        
        if (this.images.length === 0) {
            console.log('沒有圖片，顯示警告');
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }
        
        if (this.isProcessing) {
            console.log('正在處理中，顯示警告');
            Utils.showNotification('圖片正在處理中，請稍候', 'warning');
            return;
        }
        
        this.isProcessing = true;
        console.log('開始處理工具動作:', action);
        
        try {
            // 確定要處理的圖片：如果有選中的圖片則處理選中的，否則處理當前圖片
            const imagesToProcess = this.selectedImages.size > 0 
                ? Array.from(this.selectedImages).map(index => this.images[index])
                : [this.images[this.currentImageIndex]];
            
            console.log('開始處理工具動作:', {
                action: action,
                imagesToProcess: imagesToProcess.length,
                selectedCount: this.selectedImages.size,
                currentIndex: this.currentImageIndex
            });
            
            Utils.updateProgress(0, '正在處理圖片...');
            
            for (let i = 0; i < imagesToProcess.length; i++) {
                const image = imagesToProcess[i];
                const processor = image.processor;
                const progress = (i / imagesToProcess.length) * 100;
                Utils.updateProgress(progress, `處理圖片 ${i + 1}/${imagesToProcess.length}`);
                
                console.log(`處理圖片 ${i + 1}:`, image.file.name);
                console.log('處理器狀態:', {
                    hasProcessor: !!processor,
                    isLoaded: processor ? processor.isImageLoaded() : false
                });
                
                let success = false;
                
                switch (action) {
                    case 'brighten':
                        console.log('執行提亮操作');
                        success = processor.adjustBrightness(20);
                        break;
                    case 'contrast':
                        console.log('執行對比度操作');
                        success = processor.adjustContrast(20);
                        break;
                    case 'grayscale':
                        console.log('執行黑白濾鏡操作');
                        success = processor.applyFilter('grayscale');
                        break;
                    case 'sepia':
                        console.log('執行復古濾鏡操作');
                        success = processor.applyFilter('sepia');
                        break;
                    case 'invert':
                        console.log('執行反轉濾鏡操作');
                        success = processor.applyFilter('invert');
                        break;
                    default:
                        console.warn('不支持的工具動作:', action);
                        break;
                }
                
                console.log(`操作結果: ${success ? '成功' : '失敗'}`);
                
                if (success) {
                    // 自動保存處理後的圖片
                    const operationName = this.getOperationName(action);
                    await this.autoSaveProcessedImage(image, processor, operationName);
                } else {
                    console.error(`圖片 ${image.file.name} 處理失敗`);
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
            console.log('處理完成，重置處理狀態');
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
                
                const success = processor.applyFilter(filter);
                
                if (success) {
                    // 自動保存處理後的圖片
                    await this.autoSaveProcessedImage(image, processor, filter);
                } else {
                    console.error(`圖片 ${image.file.name} 濾鏡處理失敗`);
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
                    // 自動保存處理後的圖片
                    await this.autoSaveProcessedImage(image, processor, frame);
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
    handleDrawingTool(tool, event) {
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
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
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
            // 設置繪製完成回調
            this.drawingProcessor.onDrawingComplete = (canvasData) => {
                this.saveDrawingResult();
            };
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

    // 初始化塗鴉標註工具
    initDrawingTools() {
        // 繪製工具按鈕
        const drawingBtns = document.querySelectorAll('.drawing-btn');
        drawingBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除其他按鈕的active狀態
                drawingBtns.forEach(b => b.classList.remove('active'));
                // 添加當前按鈕的active狀態
                btn.classList.add('active');
                
                const tool = btn.dataset.tool;
                if (this.drawingProcessor) {
                    this.drawingProcessor.setTool(tool);
                }
            });
        });

        // 特效工具按鈕
        const effectBtns = document.querySelectorAll('.effect-btn');
        effectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const effect = btn.dataset.effect;
                this.handleEffectTool(effect);
            });
        });

        // 標註工具按鈕
        const annotationBtns = document.querySelectorAll('.annotation-btn');
        annotationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除其他按鈕的active狀態
                annotationBtns.forEach(b => b.classList.remove('active'));
                // 添加當前按鈕的active狀態
                btn.classList.add('active');
                
                const annotation = btn.dataset.annotation;
                this.handleAnnotationTool(annotation);
            });
        });

        // 畫筆樣式按鈕
        const styleBtns = document.querySelectorAll('.style-btn');
        styleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除其他按鈕的active狀態
                styleBtns.forEach(b => b.classList.remove('active'));
                // 添加當前按鈕的active狀態
                btn.classList.add('active');
                
                const style = btn.dataset.style;
                if (this.drawingProcessor) {
                    this.drawingProcessor.setBrushStyle(style);
                }
            });
        });

        // 顏色設置
        const colorInput = document.getElementById('drawingColor');
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                const color = e.target.value;
                if (this.drawingProcessor) {
                    this.drawingProcessor.setColor(color);
                }
            });
        }

        // 畫筆大小設置
        const brushSizeInput = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        if (brushSizeInput && brushSizeValue) {
            brushSizeInput.addEventListener('input', (e) => {
                const size = e.target.value;
                brushSizeValue.textContent = size + 'px';
                if (this.drawingProcessor) {
                    this.drawingProcessor.setBrushSize(parseInt(size));
                }
            });
        }

        // 操作控制按鈕
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        const clearBtn = document.getElementById('clearBtn');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                if (this.drawingProcessor) {
                    const success = this.drawingProcessor.undo();
                    if (success) {
                        Utils.showNotification('已撤銷上一步操作', 'success');
                        // 保存塗鴉標註結果
                        this.saveDrawingResult();
                    } else {
                        Utils.showNotification('沒有可撤銷的操作', 'warning');
                    }
                }
            });
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                if (this.drawingProcessor) {
                    const success = this.drawingProcessor.redo();
                    if (success) {
                        Utils.showNotification('已重做上一步操作', 'success');
                        // 保存塗鴉標註結果
                        this.saveDrawingResult();
                    } else {
                        Utils.showNotification('沒有可重做的操作', 'warning');
                    }
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (this.drawingProcessor) {
                    this.drawingProcessor.clear();
                    Utils.showNotification('已清空畫布', 'success');
                    // 保存塗鴉標註結果
                    this.saveDrawingResult();
                }
            });
        }

        console.log('塗鴉標註工具初始化完成');

        console.log('塗鴉標註工具初始化完成');
    }

    // 處理特效工具
    handleEffectTool(effect) {
        if (!this.drawingProcessor) return;

        // 獲取當前滑鼠位置（模擬點擊）
        const rect = this.drawingProcessor.canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        switch (effect) {
            case 'heart':
                this.drawingProcessor.drawHeart(centerX, centerY, 30);
                Utils.showNotification('已添加愛心特效', 'success');
                break;
            case 'star':
                this.drawingProcessor.drawStar(centerX, centerY, 25);
                Utils.showNotification('已添加星星特效', 'success');
                break;
            case 'explosion':
                this.drawingProcessor.drawExplosion(centerX, centerY, 40);
                Utils.showNotification('已添加爆炸特效', 'success');
                break;
            case 'emoji':
                this.drawingProcessor.drawEmoji(centerX, centerY);
                Utils.showNotification('已添加表情符號', 'success');
                break;
            case 'bubble':
                this.drawingProcessor.drawSpeechBubble(centerX, centerY, 'Wow!', 120, 80);
                Utils.showNotification('已添加對話框', 'success');
                break;
            case 'progress':
                this.drawingProcessor.drawProgressBar(centerX, centerY, 0.8, 150, 25);
                Utils.showNotification('已添加進度條', 'success');
                break;
        }
        
        // 保存塗鴉標註結果
        this.saveDrawingResult();
    }

    // 處理標註工具
    handleAnnotationTool(annotation) {
        if (!this.drawingProcessor) return;

        // 設置為繪製模式，等待用戶點擊
        this.currentAnnotation = annotation;
        this.drawingProcessor.canvas.style.cursor = 'crosshair';
        
        // 添加一次性點擊事件
        const handleAnnotationClick = (e) => {
            const rect = this.drawingProcessor.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            switch (annotation) {
                case 'arrow':
                    // 繪製箭頭（從中心到點擊位置）
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    this.drawingProcessor.drawArrow(centerX, centerY, x, y);
                    Utils.showNotification('已添加箭頭標註', 'success');
                    break;
                case 'neon-arrow':
                    // 繪製霓虹箭頭
                    const neonCenterX = rect.width / 2;
                    const neonCenterY = rect.height / 2;
                    this.drawingProcessor.drawNeonArrow(neonCenterX, neonCenterY, x, y);
                    Utils.showNotification('已添加霓虹箭頭標註', 'success');
                    break;
                case 'highlight':
                    // 繪製高亮區域
                    this.drawingProcessor.drawHighlight(x - 50, y - 30, 100, 60);
                    Utils.showNotification('已添加高亮標註', 'success');
                    break;
                case 'stamp':
                    // 繪製印章
                    this.drawingProcessor.drawStamp(x, y, '✓');
                    Utils.showNotification('已添加印章標註', 'success');
                    break;
                case 'measure':
                    // 繪製測量線
                    const measureCenterX = rect.width / 2;
                    const measureCenterY = rect.height / 2;
                    this.drawingProcessor.drawLine(measureCenterX, measureCenterY, x, y);
                    // 添加測量文字
                    const distance = Math.sqrt((x - measureCenterX) ** 2 + (y - measureCenterY) ** 2);
                    this.drawingProcessor.addText(`${Math.round(distance)}px`, (x + measureCenterX) / 2, (y + measureCenterY) / 2 - 10);
                    Utils.showNotification('已添加測量標註', 'success');
                    break;
            }

            // 自動保存塗鴉標註結果
            this.saveDrawingResult();

            // 移除事件監聽器
            this.drawingProcessor.canvas.removeEventListener('click', handleAnnotationClick);
            this.currentAnnotation = null;
            this.drawingProcessor.canvas.style.cursor = 'crosshair';
        };

        this.drawingProcessor.canvas.addEventListener('click', handleAnnotationClick);
        Utils.showNotification(`請點擊畫布來放置${this.getAnnotationName(annotation)}`, 'info');
    }

    // 獲取標註工具的中文名稱
    getAnnotationName(annotation) {
        const names = {
            'arrow': '箭頭',
            'neon-arrow': '霓虹箭頭',
            'highlight': '高亮區域',
            'stamp': '印章',
            'measure': '測量線'
        };
        return names[annotation] || annotation;
    }

    // 處理AI動作
    async handleAIAction(aiAction) {
        console.log('handleAIAction 被調用:', aiAction);
        
        if (this.images.length === 0) {
            console.log('沒有圖片，顯示警告');
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }
        
        if (this.isAIProcessing) {
            console.log('正在AI處理中，顯示警告');
            Utils.showNotification('AI正在處理中，請稍候', 'warning');
            return;
        }
        
        this.isAIProcessing = true;
        console.log('開始AI處理:', aiAction);
        
        try {
            // 獲取當前圖片
            const currentImage = this.images[this.currentImageIndex];
            
            // 創建AI處理器
            if (!this.aiProcessor) {
                this.aiProcessor = new AIImageProcessor();
            }
            
            // 載入圖片到AI處理器
            await this.aiProcessor.loadImage(currentImage.file);
            
            // 更新AI狀態
            this.updateAIStatus('處理中...', true);
            
            let success = false;
            
            switch (aiAction) {
                case 'repair-old-photo':
                    console.log('執行老照片修復');
                    success = await this.aiProcessor.repairOldPhoto();
                    break;
                case 'upscale-8k':
                    console.log('執行8K超分辨率');
                    success = await this.aiProcessor.upscaleTo8K();
                    break;
                case 'extract-portrait':
                    console.log('執行人像摳圖');
                    success = await this.aiProcessor.extractPortrait();
                    break;
                case 'extract-object':
                    console.log('執行物體摳圖');
                    success = await this.aiProcessor.extractObject();
                    break;
                case 'artistic-oil':
                    console.log('執行油畫風格');
                    success = await this.aiProcessor.applyArtisticStyle('oil-painting');
                    break;
                case 'artistic-watercolor':
                    console.log('執行水彩風格');
                    success = await this.aiProcessor.applyArtisticStyle('watercolor');
                    break;
                case 'artistic-sketch':
                    console.log('執行素描風格');
                    success = await this.aiProcessor.applyArtisticStyle('sketch');
                    break;
                case 'artistic-cartoon':
                    console.log('執行卡通風格');
                    success = await this.aiProcessor.applyArtisticStyle('cartoon');
                    break;
                case 'artistic-vintage':
                    console.log('執行復古風格');
                    success = await this.aiProcessor.applyArtisticStyle('vintage');
                    break;
                case 'cartoonize':
                    console.log('執行卡通化');
                    success = await this.aiProcessor.cartoonize();
                    break;
                case 'one-click-repair':
                    console.log('執行一鍵修復');
                    success = await this.aiProcessor.oneClickRepair(this.selectedRegion);
                    
                    // 處理完成後保存結果
                    if (success) {
                        const processedBase64 = this.aiProcessor.toBase64('image/png', 0.9);
                        if (processedBase64 && processedBase64.startsWith('data:')) {
                            // 更新預覽圖片
                            const previewImg = document.querySelector('.preview-container img');
                            if (previewImg) {
                                previewImg.src = processedBase64;
                            }
                            
                            // 保存處理結果
                            await this.autoSaveProcessedImage(currentImage, this.aiProcessor, '一鍵修復');
                        } else {
                            console.error('AI處理器返回的Base64無效:', processedBase64);
                        }
                    }
                    break;
                case 'select-region':
                    console.log('開始區域選擇');
                    this.startRegionSelection();
                    success = true;
                    break;
                case 'select-and-repair':
                    console.log('開始區域選擇並自動修復');
                    this.startRegionSelectionAndRepair();
                    success = true;
                    break;
                default:
                    console.warn('不支持的AI動作:', aiAction);
                    break;
            }
            
            console.log(`AI處理結果: ${success ? '成功' : '失敗'}`);
            
            if (success) {
                // 自動保存AI處理結果
                try {
                    const processedBase64 = this.aiProcessor.toBase64('image/png', 0.9);
                    if (processedBase64 && processedBase64.startsWith('data:')) {
                        // 獲取AI操作名稱
                        const aiOperationName = this.getAIOperationName(aiAction);
                        
                        // 保存處理結果
                        await this.autoSaveProcessedImage(currentImage, this.aiProcessor, aiOperationName);
                        
                        // 更新預覽
                        this.updatePreview();
                        
                        Utils.showNotification('AI處理完成，可點擊下載按鈕保存', 'success');
                    } else {
                        console.warn('AI處理後數據無效:', processedBase64);
                        Utils.showNotification('AI處理失敗：無效的結果數據', 'error');
                    }
                } catch (error) {
                    console.error('更新AI處理後數據失敗:', error);
                    Utils.showNotification('AI處理失敗', 'error');
                }
            } else {
                console.error('AI處理失敗');
                Utils.showNotification('AI處理失敗', 'error');
            }
            
        } catch (error) {
            console.error('AI處理過程出錯:', error);
            Utils.showNotification('AI處理失敗', 'error');
        } finally {
            this.isAIProcessing = false;
            this.updateAIStatus('就緒', false);
            console.log('AI處理完成，重置處理狀態');
        }
    }

    // 更新AI狀態
    updateAIStatus(text, isProcessing = false) {
        const statusIndicator = document.getElementById('aiStatusIndicator');
        const aiProgress = document.getElementById('aiProgress');
        const aiProgressText = document.getElementById('aiProgressText');
        
        if (statusIndicator) {
            const statusText = statusIndicator.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = text;
            }
            
            if (isProcessing) {
                statusIndicator.classList.add('processing');
            } else {
                statusIndicator.classList.remove('processing');
            }
        }
        
        if (aiProgress) {
            if (isProcessing) {
                aiProgress.style.display = 'block';
                if (aiProgressText) {
                    aiProgressText.textContent = text;
                }
            } else {
                aiProgress.style.display = 'none';
            }
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
            let success = false;
            
            switch (parameter) {
                case 'brightness':
                    success = processor.adjustBrightness(parseInt(value));
                    break;
                case 'contrast':
                    success = processor.adjustContrast(parseInt(value));
                    break;
                default:
                    console.warn('不支持的參數:', parameter);
                    break;
            }
            
            if (success) {
                // 更新圖片的處理後數據
                try {
                    const processedBase64 = processor.toBase64('image/jpeg', 0.9);
                    if (processedBase64 && processedBase64 !== '') {
                        // 確保 processedData 對象存在
                        if (!image.processedData) {
                            image.processedData = {};
                        }
                        image.processedData.base64 = processedBase64;
                        console.log(`圖片 ${image.file.name} 參數調整完成，數據已保存`);
                    } else {
                        console.warn(`圖片 ${image.file.name} 參數調整後數據為空`);
                    }
                } catch (error) {
                    console.error('更新處理後數據失敗:', error);
                }
            } else {
                console.error(`圖片 ${image.file.name} 參數調整失敗`);
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
            const format = document.getElementById('outputFormat').value;
            const quality = document.getElementById('quality').value / 100;
            
            console.log('開始下載圖片:', {
                format: format,
                quality: quality,
                imageName: currentImage.file.name,
                hasProcessedData: !!currentImage.processedData,
                hasProcessor: !!currentImage.processor,
                hasOriginalData: !!currentImage.data.base64
            });
            
            let blob;
            let filename;
            
            // 優先使用處理後的數據（AI處理或塗鴉標註結果）
            if (currentImage.processedData) {
                try {
                    // 驗證處理後數據的格式
                    console.log('處理後數據類型:', typeof currentImage.processedData);
                    console.log('處理後數據長度:', currentImage.processedData.length);
                    console.log('處理後數據前50字符:', currentImage.processedData.substring(0, 50));
                    
                    // 檢查是否為有效的DataURL
                    if (!currentImage.processedData.startsWith('data:')) {
                        console.warn('處理後數據不是DataURL格式，嘗試使用原始數據');
                        if (currentImage.data.base64) {
                            blob = await this.dataURLToBlob(currentImage.data.base64);
                            filename = this.generateFilename(currentImage.file.name, format);
                            console.log('使用原始數據下載（處理後數據格式無效）');
                        } else {
                            throw new Error('處理後數據格式無效且無原始數據');
                        }
                    } else {
                        blob = await this.dataURLToBlob(currentImage.processedData);
                        filename = this.generateFilename(currentImage.file.name, format);
                        console.log('使用處理後的數據下載');
                    }
                } catch (error) {
                    console.error('處理後數據轉換失敗:', error);
                    // 如果處理後數據失敗，嘗試使用原始數據
                    if (currentImage.data.base64) {
                        try {
                            console.log('處理後數據失敗，嘗試使用原始數據');
                            blob = await this.dataURLToBlob(currentImage.data.base64);
                            filename = this.generateFilename(currentImage.file.name, format);
                            console.log('使用原始數據下載（備用方案）');
                        } catch (originalError) {
                            console.error('原始數據也失敗:', originalError);
                            throw new Error('所有數據轉換都失敗: ' + error.message);
                        }
                    } else {
                        throw new Error('處理後數據轉換失敗且無原始數據: ' + error.message);
                    }
                }
            } else if (currentImage.processor && typeof currentImage.processor.toBlob === 'function') {
                // 使用傳統處理器的數據
                const processor = currentImage.processor;
                
                try {
                    blob = await processor.toBlob(`image/${format}`, quality);
                    filename = this.generateFilename(currentImage.file.name, format);
                    console.log('使用傳統處理器數據下載');
                } catch (error) {
                    console.error('處理器toBlob失敗:', error);
                    // 如果處理器失敗，嘗試使用原始數據
                    console.log('處理器失敗，嘗試使用原始數據');
                    blob = await this.dataURLToBlob(currentImage.data.base64);
                    filename = this.generateFilename(currentImage.file.name, format);
                }
            } else if (currentImage.data.base64) {
                // 使用原始圖片數據
                try {
                    blob = await this.dataURLToBlob(currentImage.data.base64);
                    filename = this.generateFilename(currentImage.file.name, format);
                    console.log('使用原始圖片數據下載');
                } catch (error) {
                    console.error('原始數據轉換失敗:', error);
                    throw new Error('原始數據轉換失敗: ' + error.message);
                }
            } else {
                throw new Error('沒有可用的圖片數據');
            }
            
            // 驗證生成的 blob
            if (!blob || blob.size === 0) {
                throw new Error('生成的 Blob 無效或為空');
            }
            
            console.log('Blob 生成成功:', {
                blobSize: blob.size,
                blobType: blob.type
            });
            
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
            Utils.showTopCenterNotification('圖片下載成功', 'success');
            
        } catch (error) {
            console.error('下載失敗:', error);
            Utils.showNotification(`下載失敗: ${error.message}`, 'error');
        }
    }
    
    // 將DataURL轉換為Blob
    async dataURLToBlob(dataURL) {
        return new Promise((resolve, reject) => {
            try {
                // 驗證dataURL格式
                if (!dataURL || typeof dataURL !== 'string') {
                    throw new Error('DataURL 無效');
                }
                
                if (!dataURL.startsWith('data:')) {
                    throw new Error('DataURL 格式錯誤');
                }
                
                const arr = dataURL.split(',');
                if (arr.length !== 2) {
                    throw new Error('DataURL 格式錯誤');
                }
                
                const mimeMatch = arr[0].match(/:(.*?);/);
                if (!mimeMatch) {
                    throw new Error('無法解析 MIME 類型');
                }
                
                const mime = mimeMatch[1];
                
                // 處理base64解碼
                let bstr;
                try {
                    bstr = atob(arr[1]);
                } catch (decodeError) {
                    throw new Error('Base64 解碼失敗');
                }
                
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                
                const blob = new Blob([u8arr], { type: mime });
                
                // 驗證生成的blob
                if (!blob || blob.size === 0) {
                    throw new Error('生成的 Blob 無效或為空');
                }
                
                console.log('DataURL轉Blob成功:', {
                    originalSize: dataURL.length,
                    blobSize: blob.size,
                    mimeType: mime
                });
                
                resolve(blob);
            } catch (error) {
                console.error('DataURL轉Blob失敗:', error);
                reject(error);
            }
        });
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
                    let blob;
                    let filename = this.generateFilename(image.file.name, format);
                    
                    // 優先使用處理後的數據（AI處理或塗鴉標註結果）
                    if (image.processedData) {
                        try {
                            // 檢查是否為有效的DataURL
                            if (!image.processedData.startsWith('data:')) {
                                console.warn(`處理後數據不是DataURL格式 ${image.file.name}，嘗試使用原始數據`);
                                if (image.data.base64) {
                                    blob = await this.dataURLToBlob(image.data.base64);
                                    console.log(`使用原始數據處理圖片 ${image.file.name}（處理後數據格式無效）`);
                                } else {
                                    console.error(`處理後數據格式無效且無原始數據 ${image.file.name}`);
                                    errorCount++;
                                    continue;
                                }
                            } else {
                                blob = await this.dataURLToBlob(image.processedData);
                                console.log(`使用處理後的數據處理圖片 ${image.file.name}`);
                            }
                        } catch (error) {
                            console.error(`處理後數據轉換失敗 ${image.file.name}:`, error);
                            // 如果處理後數據失敗，嘗試使用原始數據
                            if (image.data.base64) {
                                try {
                                    blob = await this.dataURLToBlob(image.data.base64);
                                    console.log(`使用原始數據處理圖片 ${image.file.name}（備用方案）`);
                                } catch (originalError) {
                                    console.error(`原始數據轉換失敗 ${image.file.name}:`, originalError);
                                    errorCount++;
                                    continue;
                                }
                            } else {
                                errorCount++;
                                continue;
                            }
                        }
                    } else if (processor && typeof processor.toBlob === 'function') {
                        // 使用傳統處理器的數據
                        try {
                            blob = await processor.toBlob(`image/${format}`, quality);
                            console.log(`使用傳統處理器處理圖片 ${image.file.name}`);
                        } catch (error) {
                            console.error(`處理器toBlob失敗 ${image.file.name}:`, error);
                            // 如果處理器失敗，嘗試使用原始數據
                            if (image.data.base64) {
                                try {
                                    blob = await this.dataURLToBlob(image.data.base64);
                                    console.log(`使用原始數據處理圖片 ${image.file.name}`);
                                } catch (originalError) {
                                    console.error(`原始數據轉換失敗 ${image.file.name}:`, originalError);
                                    errorCount++;
                                    continue;
                                }
                            } else {
                                errorCount++;
                                continue;
                            }
                        }
                    } else if (image.data.base64) {
                        // 使用原始圖片數據
                        try {
                            blob = await this.dataURLToBlob(image.data.base64);
                            console.log(`使用原始數據處理圖片 ${image.file.name}`);
                        } catch (error) {
                            console.error(`原始數據轉換失敗 ${image.file.name}:`, error);
                            errorCount++;
                            continue;
                        }
                    } else {
                        console.error(`圖片 ${image.file.name} 沒有可用的處理數據`);
                        errorCount++;
                        continue;
                    }
                    
                    // 驗證生成的 blob
                    if (!blob || blob.size === 0) {
                        console.error(`圖片 ${image.file.name} 生成的 Blob 無效`);
                        errorCount++;
                        continue;
                    }
                    
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
        // 檢查是否有處理後的數據（AI處理或塗鴉標註結果）
        if (image.processedData) {
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
        try {
            // 驗證輸入參數
            if (!originalName || typeof originalName !== 'string') {
                throw new Error('原始文件名無效');
            }
            
            if (!format || typeof format !== 'string') {
                throw new Error('格式參數無效');
            }
            
            // 獲取文件名前綴
            const prefix = document.getElementById('filenamePrefix')?.value || 'processed_';
            
            // 清理原始文件名（移除路徑和非法字符）
            let cleanName = originalName.replace(/^.*[\\\/]/, ''); // 移除路徑
            cleanName = cleanName.replace(/[<>:"/\\|?*]/g, '_'); // 移除非法字符
            
            // 移除原始擴展名
            const nameWithoutExt = cleanName.replace(/\.[^/.]+$/, '');
            
            // 確保文件名不為空
            if (!nameWithoutExt || nameWithoutExt.trim() === '') {
                return `${prefix}image.${format}`;
            }
            
            // 生成最終文件名
            const filename = `${prefix}${nameWithoutExt}.${format}`;
            
            console.log('生成文件名:', {
                originalName: originalName,
                cleanName: cleanName,
                nameWithoutExt: nameWithoutExt,
                format: format,
                finalFilename: filename
            });
            
            return filename;
            
        } catch (error) {
            console.error('生成文件名失敗:', error);
            // 返回默認文件名
            return `processed_image_${Date.now()}.${format}`;
        }
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
            
            // 檢查圖片是否已處理
            const isProcessed = this.isImageProcessed(image);
            const processedBadge = isProcessed ? '<div class="processed-badge" title="已處理"><i class="fas fa-magic"></i></div>' : '';
            
            imageItem.innerHTML = `
                <div style="position: relative; width: 100%; height: 100%;">
                    <img src="${image.data.base64}" alt="${image.file.name}" style="max-width: 100%; max-height: 100%; object-fit: cover;">
                    <button class="delete-btn" title="刪除圖片">
                        <i class="fas fa-times"></i>
                    </button>
                    ${processedBadge}
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
        
        // 顯示當前圖片的預覽（優先顯示處理後的效果）
        const currentImage = this.images[this.currentImageIndex];
        const processor = currentImage.processor;
        
        console.log('更新預覽:', {
            currentImageIndex: this.currentImageIndex,
            imagesLength: this.images.length,
            currentImage: currentImage.file.name,
            hasProcessedData: !!(currentImage.processedData && currentImage.processedData.base64)
        });
        
        // 優先獲取處理後的圖片數據
        let processedImageSrc = null;
        let originalImageSrc = currentImage.data.base64;
        
        try {
            // 首先嘗試從處理器獲取最新的處理後圖片數據
            if (processor && processor.isImageLoaded()) {
                processedImageSrc = processor.toBase64('image/jpeg', 0.9);
                console.log('從處理器獲取最新處理後圖片數據');
                
                // 保存到處理後數據中
                if (!currentImage.processedData) {
                    currentImage.processedData = {};
                }
                currentImage.processedData.base64 = processedImageSrc;
            }
        } catch (error) {
            console.error('從處理器獲取圖片數據失敗:', error);
        }
        
        // 如果處理器沒有數據，嘗試使用緩存的處理後數據
        if (!processedImageSrc || processedImageSrc === '') {
            if (currentImage.processedData && currentImage.processedData.base64) {
                processedImageSrc = currentImage.processedData.base64;
                console.log('使用緩存的處理後圖片數據');
            } else {
                // 如果沒有處理後數據，使用原始數據
                processedImageSrc = originalImageSrc;
                console.log('使用原始圖片數據');
            }
        }
        
        if (!processedImageSrc || processedImageSrc === '') {
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
            hasProcessedImageSrc: !!processedImageSrc,
            srcLength: processedImageSrc.length,
            srcPrefix: processedImageSrc.substring(0, 50),
            isProcessed: processedImageSrc !== originalImageSrc
        });
        
        // 檢查是否有處理效果（處理後圖片與原圖不同）
        const hasProcessingEffect = processedImageSrc !== originalImageSrc;
        
        if (hasProcessingEffect) {
            // 顯示對比視圖：原圖 vs 處理後效果
            previewContainer.innerHTML = `
                <div class="comparison-container" style="display: flex; gap: 20px; height: 100%; align-items: center; justify-content: center;">
                    <div class="original-image" style="flex: 1; text-align: center; position: relative;">
                        <h4 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">原圖</h4>
                        <img src="${originalImageSrc}" alt="原圖" style="max-width: 100%; max-height: 80%; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                    <div class="comparison-arrow" style="display: flex; align-items: center; color: #667eea; font-size: 24px; font-weight: bold;">
                        →
                    </div>
                    <div class="processed-image" style="flex: 1; text-align: center; position: relative;">
                        <h4 style="margin: 0 0 10px 0; color: #28a745; font-size: 14px;">處理後效果</h4>
                        <img src="${processedImageSrc}" alt="處理後圖片" style="max-width: 100%; max-height: 80%; object-fit: contain; border: 2px solid #28a745; border-radius: 8px; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);">
                        <div style="position: absolute; top: 5px; right: 5px; background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                            ✨ 已處理
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 顯示單一圖片（處理後效果）
            previewContainer.innerHTML = `
                <div style="text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <img src="${processedImageSrc}" alt="預覽圖片" style="max-width: 100%; max-height: 90%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="margin-top: 10px; color: #666; font-size: 14px;">
                        <i class="fas fa-eye"></i> 圖片預覽（處理後效果）
                    </div>
                </div>
            `;
        }
        
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
            let processedImageSrc = null;
            let originalImageSrc = image.data.base64;
            
            // 優先獲取處理後的圖片數據
            try {
                // 首先嘗試從處理器獲取最新的處理後圖片數據
                if (processor && processor.isImageLoaded()) {
                    processedImageSrc = processor.toBase64('image/jpeg', 0.9);
                    console.log(`圖片 ${image.file.name} 從處理器獲取最新處理後數據`);
                    
                    // 保存到處理後數據中
                    if (!image.processedData) {
                        image.processedData = {};
                    }
                    image.processedData.base64 = processedImageSrc;
                }
            } catch (error) {
                console.error(`獲取圖片 ${image.file.name} 處理後數據失敗:`, error);
            }
            
            // 如果處理器沒有數據，嘗試使用緩存的處理後數據
            if (!processedImageSrc || processedImageSrc === '') {
                if (image.processedData && image.processedData.base64) {
                    processedImageSrc = image.processedData.base64;
                    console.log(`圖片 ${image.file.name} 使用緩存的處理後數據`);
                } else {
                    // 如果沒有處理後數據，使用原始數據
                    processedImageSrc = originalImageSrc;
                    console.log(`圖片 ${image.file.name} 使用原始數據`);
                }
            }
            
            if (processedImageSrc) {
                displayedCount++;
                
                // 檢查是否有處理效果（處理後圖片與原圖不同）
                const hasProcessingEffect = processedImageSrc !== originalImageSrc;
                
                // 創建圖片容器
                const imageContainer = document.createElement('div');
                imageContainer.style.cssText = 'text-align: center; max-width: 200px; min-width: 150px; flex-shrink: 0; position: relative;';
                
                // 創建圖片元素
                const img = document.createElement('img');
                img.src = processedImageSrc;
                img.alt = image.file.name;
                
                // 根據是否有處理效果設置不同的樣式
                if (hasProcessingEffect) {
                    img.style.cssText = 'max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); border: 2px solid #28a745;';
                    
                    // 添加已處理標籤
                    const processedLabel = document.createElement('div');
                    processedLabel.style.cssText = 'position: absolute; top: 5px; right: 5px; background: #28a745; color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: bold; z-index: 10;';
                    processedLabel.textContent = '✨ 已處理';
                    imageContainer.appendChild(processedLabel);
                } else {
                    img.style.cssText = 'max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid #ddd;';
                }
                
                // 創建文件名標籤
                const fileName = document.createElement('div');
                fileName.style.cssText = 'font-size: 12px; color: var(--text-secondary); margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                fileName.textContent = image.file.name;
                
                // 如果有處理效果，添加處理狀態標籤
                if (hasProcessingEffect) {
                    const statusLabel = document.createElement('div');
                    statusLabel.style.cssText = 'font-size: 10px; color: #28a745; margin-top: 4px; font-weight: bold;';
                    statusLabel.textContent = '處理後效果';
                    imageContainer.appendChild(statusLabel);
                }
                
                // 組裝元素
                imageContainer.appendChild(img);
                imageContainer.appendChild(fileName);
                previewWrapper.appendChild(imageContainer);
                
                console.log(`成功添加圖片預覽: ${image.file.name}, 已處理: ${hasProcessingEffect}`);
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

    // 初始化區域選擇
    initRegionSelection() {
        console.log('初始化區域選擇功能...');
        
        // 添加區域選擇畫布到預覽容器
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            const selectionCanvas = document.createElement('canvas');
            selectionCanvas.id = 'selectionCanvas';
            selectionCanvas.style.position = 'absolute';
            selectionCanvas.style.top = '0';
            selectionCanvas.style.left = '0';
            selectionCanvas.style.pointerEvents = 'none';
            selectionCanvas.style.zIndex = '1000';
            selectionCanvas.style.display = 'none';
            
            // 設置預覽容器為相對定位
            previewContainer.style.position = 'relative';
            previewContainer.appendChild(selectionCanvas);
        }
        
        console.log('區域選擇功能初始化完成');
    }

    // 開始區域選擇
    startRegionSelection() {
        console.log('開始區域選擇模式');
        this.isSelectingRegion = true;
        this.selectedRegion = null;
        
        const previewImg = document.querySelector('.preview-container img');
        const selectionCanvas = document.getElementById('selectionCanvas');
        
        if (!previewImg || !selectionCanvas) {
            console.error('找不到預覽圖片或選擇畫布');
            return;
        }
        
        // 確保預覽圖片已經載入
        if (previewImg.src.includes('data:image/svg+xml')) {
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }
        
        // 設置畫布大小
        selectionCanvas.width = previewImg.offsetWidth;
        selectionCanvas.height = previewImg.offsetHeight;
        selectionCanvas.style.display = 'block';
        selectionCanvas.style.pointerEvents = 'auto';
        
        const ctx = selectionCanvas.getContext('2d');
        
        // 添加事件監聽器
        const handleMouseDown = (e) => {
            const rect = selectionCanvas.getBoundingClientRect();
            this.selectionStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        
        const handleMouseMove = (e) => {
            if (!this.selectionStart) return;
            
            const rect = selectionCanvas.getBoundingClientRect();
            this.selectionEnd = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // 清除畫布並重繪選擇框
            ctx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
            this.drawSelectionBox(ctx);
        };
        
        const handleMouseUp = (e) => {
            if (!this.selectionStart || !this.selectionEnd) return;
            
            // 計算選擇區域
            const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
            const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
            
            // 轉換為圖片坐標
            const imgRect = previewImg.getBoundingClientRect();
            const scaleX = previewImg.naturalWidth / imgRect.width;
            const scaleY = previewImg.naturalHeight / imgRect.height;
            
            this.selectedRegion = {
                x: Math.round(x * scaleX),
                y: Math.round(y * scaleY),
                width: Math.round(width * scaleX),
                height: Math.round(height * scaleY)
            };
            
            console.log('選擇區域:', this.selectedRegion);
            
            // 退出選擇模式
            this.exitRegionSelection();
        };
        
        selectionCanvas.addEventListener('mousedown', handleMouseDown);
        selectionCanvas.addEventListener('mousemove', handleMouseMove);
        selectionCanvas.addEventListener('mouseup', handleMouseUp);
        
        // 保存事件監聽器以便移除
        this.regionSelectionHandlers = {
            mouseDown: handleMouseDown,
            mouseMove: handleMouseMove,
            mouseUp: handleMouseUp
        };
        
        Utils.showNotification('請拖拽選擇要處理的區域', 'info');
    }
    
    // 退出區域選擇
    exitRegionSelection() {
        this.isSelectingRegion = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        
        const selectionCanvas = document.getElementById('selectionCanvas');
        if (selectionCanvas) {
            selectionCanvas.style.display = 'none';
            selectionCanvas.style.pointerEvents = 'none';
            
            // 移除事件監聽器
            if (this.regionSelectionHandlers) {
                selectionCanvas.removeEventListener('mousedown', this.regionSelectionHandlers.mouseDown);
                selectionCanvas.removeEventListener('mousemove', this.regionSelectionHandlers.mouseMove);
                selectionCanvas.removeEventListener('mouseup', this.regionSelectionHandlers.mouseUp);
                this.regionSelectionHandlers = null;
            }
        }
        
        if (this.selectedRegion) {
            Utils.showNotification('區域選擇完成，可以執行一鍵修復', 'success');
        }
    }
    
    // 繪製選擇框
    drawSelectionBox(ctx) {
        if (!this.selectionStart || !this.selectionEnd) return;
        
        const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
        const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
        const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
        const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
        
        // 繪製半透明背景
        ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';
        ctx.fillRect(x, y, width, height);
        
        // 繪製邊框
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        
        // 重置線條樣式
        ctx.setLineDash([]);
    }

    // 開始區域選擇並自動修復
    async startRegionSelectionAndRepair() {
        console.log('開始區域選擇並自動修復模式');
        this.isSelectingRegion = true;
        this.selectedRegion = null;
        
        const previewImg = document.querySelector('.preview-container img');
        const selectionCanvas = document.getElementById('selectionCanvas');
        
        if (!previewImg || !selectionCanvas) {
            console.error('找不到預覽圖片或選擇畫布');
            return;
        }
        
        // 確保預覽圖片已經載入
        if (previewImg.src.includes('data:image/svg+xml')) {
            Utils.showNotification('請先上傳圖片', 'warning');
            return;
        }
        
        // 設置畫布大小
        selectionCanvas.width = previewImg.offsetWidth;
        selectionCanvas.height = previewImg.offsetHeight;
        selectionCanvas.style.display = 'block';
        selectionCanvas.style.pointerEvents = 'auto';
        
        const ctx = selectionCanvas.getContext('2d');
        
        // 添加事件監聽器
        const handleMouseDown = (e) => {
            const rect = selectionCanvas.getBoundingClientRect();
            this.selectionStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        
        const handleMouseMove = (e) => {
            if (!this.selectionStart) return;
            
            const rect = selectionCanvas.getBoundingClientRect();
            this.selectionEnd = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // 清除畫布並重繪選擇框
            ctx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
            this.drawSelectionBox(ctx);
        };
        
        const handleMouseUp = async (e) => {
            if (!this.selectionStart || !this.selectionEnd) return;
            
            // 計算選擇區域
            const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
            const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
            
            // 轉換為圖片坐標
            const imgRect = previewImg.getBoundingClientRect();
            const scaleX = previewImg.naturalWidth / imgRect.width;
            const scaleY = previewImg.naturalHeight / imgRect.height;
            
            this.selectedRegion = {
                x: Math.round(x * scaleX),
                y: Math.round(y * scaleY),
                width: Math.round(width * scaleX),
                height: Math.round(height * scaleY)
            };
            
            console.log('選擇區域:', this.selectedRegion);
            
            // 退出選擇模式
            this.exitRegionSelection();
            
            // 自動執行一鍵修復
            await this.executeAutoRepair();
        };
        
        selectionCanvas.addEventListener('mousedown', handleMouseDown);
        selectionCanvas.addEventListener('mousemove', handleMouseMove);
        selectionCanvas.addEventListener('mouseup', handleMouseUp);
        
        // 保存事件監聽器以便移除
        this.regionSelectionHandlers = {
            mouseDown: handleMouseDown,
            mouseMove: handleMouseMove,
            mouseUp: handleMouseUp
        };
        
        Utils.showNotification('請拖拽選擇要處理的區域，選擇完成後將自動進行一鍵修復', 'info');
    }
    
    // 執行自動修復
    async executeAutoRepair() {
        if (!this.selectedRegion) {
            Utils.showNotification('未選擇區域', 'warning');
            return;
        }
        
        try {
            Utils.showNotification('開始執行一鍵修復...', 'info');
            
            // 創建AI處理器
            if (!this.aiProcessor) {
                this.aiProcessor = new AIImageProcessor();
            }
            
            // 載入當前圖片
            const previewImg = document.querySelector('.preview-container img');
            if (previewImg && !previewImg.src.includes('data:image/svg+xml')) {
                await this.aiProcessor.loadImageFromDataURL(previewImg.src);
                
                // 執行一鍵修復（帶區域選擇）
                const success = await this.aiProcessor.oneClickRepair(this.selectedRegion);
                
                if (success) {
                    // 更新預覽圖片
                    const processedBase64 = this.aiProcessor.toBase64('image/png', 0.9);
                    if (processedBase64 && processedBase64.startsWith('data:')) {
                        previewImg.src = processedBase64;
                        
                        // 保存處理結果到圖片列表
                        this.saveProcessedImage(processedBase64);
                        
                        Utils.showNotification('區域一鍵修復完成！', 'success');
                    } else {
                        console.error('AI處理器返回的Base64無效:', processedBase64);
                        throw new Error('結果生成失敗：無效的Base64數據');
                    }
                } else {
                    throw new Error('一鍵修復執行失敗');
                }
            } else {
                throw new Error('沒有有效的圖片');
            }
        } catch (error) {
            console.error('自動修復失敗:', error);
            Utils.showNotification(`修復失敗: ${error.message}`, 'error');
        }
    }

    // 保存處理後的圖片到圖片列表
    saveProcessedImage(processedBase64) {
        if (this.images.length > 0 && this.currentImageIndex < this.images.length) {
            // 保存處理後的數據
            this.images[this.currentImageIndex].processedData = processedBase64;
            this.images[this.currentImageIndex].isProcessed = true;
            
            // 更新圖片列表顯示
            this.updateImageList();
            
            // 啟用下載功能
            this.updateDownloadButtons();
            
            console.log('處理結果已保存到圖片列表');
        }
    }

    // 獲取操作名稱
    getOperationName(action) {
        const operationNames = {
            'brighten': '提亮',
            'contrast': '對比度',
            'grayscale': '黑白',
            'sepia': '復古',
            'invert': '反轉',
            'blur': '模糊',
            'sharpen': '銳化',
            'emboss': '浮雕',
            'edge': '邊緣檢測',
            'noise': '噪點',
            'vintage': '復古',
            'cartoon': '卡通',
            'sketch': '素描',
            'watercolor': '水彩'
        };
        return operationNames[action] || '處理';
    }

    // 獲取AI操作名稱
    getAIOperationName(aiAction) {
        const aiOperationNames = {
            'repair-old-photo': '老照片修復',
            'upscale-8k': '8K超分辨率',
            'extract-portrait': '人像摳圖',
            'extract-object': '物體摳圖',
            'artistic-oil': '油畫風格',
            'artistic-watercolor': '水彩風格',
            'artistic-sketch': '素描風格',
            'artistic-cartoon': '卡通風格',
            'artistic-vintage': '復古風格',
            'cartoonize': '卡通化',
            'one-click-repair': '一鍵修復'
        };
        return aiOperationNames[aiAction] || 'AI處理';
    }

    // 保存處理後的圖片數據（不自動下載）
    async autoSaveProcessedImage(image, processor, operationName = '處理') {
        try {
            // 獲取處理後的數據
            let processedData = null;
            
            if (processor && typeof processor.toBase64 === 'function') {
                processedData = processor.toBase64('image/jpeg', 0.9);
            }
            
            if (processedData && processedData.startsWith('data:')) {
                // 保存到圖片對象
                image.processedData = processedData;
                image.isProcessed = true;
                
                console.log(`圖片 ${image.file.name} 處理完成，數據已保存（等待手動下載）`);
                Utils.showTopCenterNotification(`圖片處理完成，可點擊下載按鈕保存`, 'success');
                
                // 更新預覽以顯示處理後效果
                this.updatePreview();
                
                return true;
            } else {
                console.warn('處理後數據無效，跳過保存');
                return false;
            }
        } catch (error) {
            console.error('保存處理後數據失敗:', error);
            return false;
        }
    }

    // 新增：保存塗鴉標註結果
    saveDrawingResult() {
        if (this.drawingProcessor && this.images.length > 0 && this.currentImageIndex < this.images.length) {
            try {
                // 獲取繪製畫布的數據
                const canvasData = this.drawingProcessor.getCanvasData();
                if (canvasData) {
                    // 將繪製結果與原圖合併
                    this.mergeDrawingWithImage(canvasData);
                }
            } catch (error) {
                console.error('保存塗鴉標註結果失敗:', error);
                Utils.showNotification('保存塗鴉標註結果失敗', 'error');
            }
        }
    }

    // 新增：將塗鴉標註結果與原圖合併
    async mergeDrawingWithImage(drawingCanvasData) {
        try {
            const currentImage = this.images[this.currentImageIndex];
            const previewImg = document.querySelector('.preview-container img');
            
            if (!previewImg || !currentImage) {
                throw new Error('找不到預覽圖片或當前圖片數據');
            }

            // 創建合併用的Canvas
            const mergeCanvas = document.createElement('canvas');
            const mergeCtx = mergeCanvas.getContext('2d');
            
            // 設置Canvas尺寸為原圖尺寸
            mergeCanvas.width = previewImg.naturalWidth;
            mergeCanvas.height = previewImg.naturalHeight;
            
            // 先繪製原圖
            mergeCtx.drawImage(previewImg, 0, 0);
            
            // 再繪製塗鴉標註結果
            const drawingCanvas = document.getElementById('drawingCanvas');
            if (drawingCanvas && drawingCanvas.width > 0 && drawingCanvas.height > 0) {
                // 計算縮放比例
                const scaleX = previewImg.naturalWidth / drawingCanvas.width;
                const scaleY = previewImg.naturalHeight / drawingCanvas.height;
                
                // 繪製塗鴉標註結果到合併Canvas
                mergeCtx.drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height, 
                                  0, 0, previewImg.naturalWidth, previewImg.naturalHeight);
            }
            
            // 轉換為Base64並保存
            const mergedBase64 = mergeCanvas.toDataURL('image/png', 0.9);
            this.saveProcessedImage(mergedBase64);
            
            // 更新預覽圖片
            previewImg.src = mergedBase64;
            
            console.log('塗鴉標註結果已合併並保存');
            Utils.showNotification('塗鴉標註已保存', 'success');
            
        } catch (error) {
            console.error('合併塗鴉標註結果失敗:', error);
            Utils.showNotification('合併塗鴉標註結果失敗', 'error');
        }
    }
}

// 導出UI控制器
window.UIController = UIController; 