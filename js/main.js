/**
 * 主要應用程序
 * 初始化所有模組並協調它們的工作
 */

class AIImageOptimizer {
    constructor() {
        this.uiController = null;
        this.isInitialized = false;
        
        this.init();
    }

    // 初始化應用程序
    async init() {
        try {
            console.log('正在初始化AI圖片優化器...');
            
            // 檢查瀏覽器支持
            this.checkBrowserSupport();
            
            // 初始化各個模組
            await this.initModules();
            
            // 設置事件監聽器
            this.setupEventListeners();
            
            // 加載設置
            this.loadSettings();
            
            // 顯示歡迎信息
            this.showWelcomeMessage();
            
            this.isInitialized = true;
            console.log('AI圖片優化器初始化完成');
            
        } catch (error) {
            console.error('初始化失敗:', error);
            this.showErrorMessage('應用程序初始化失敗，請刷新頁面重試');
        }
    }

    // 檢查瀏覽器支持
    checkBrowserSupport() {
        const requirements = {
            canvas: !!document.createElement('canvas').getContext,
            fileAPI: !!window.File && !!window.FileReader,
            dragAndDrop: 'draggable' in document.createElement('div'),
            webWorkers: !!window.Worker
        };

        const unsupported = Object.entries(requirements)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupported.length > 0) {
            console.warn('不支持的瀏覽器功能:', unsupported);
            this.showWarningMessage(`您的瀏覽器不支持以下功能: ${unsupported.join(', ')}。某些功能可能無法正常工作。`);
        }
    }

    // 初始化模組
    async initModules() {
        // 初始化UI控制器
        this.uiController = new UIController();
        window.uiController = this.uiController;
        
        console.log('所有模組初始化完成');
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 頁面加載完成
        window.addEventListener('load', () => {
            this.onPageLoad();
        });

        // 頁面卸載
        window.addEventListener('beforeunload', () => {
            this.onPageUnload();
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 窗口大小變化
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // 在線狀態變化
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });

        // 錯誤處理
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }



    // 頁面加載完成
    onPageLoad() {
        console.log('頁面加載完成');
        
        // 更新狀態
        Utils.updateProgress(100, '就緒');
        
        // 顯示使用提示
        this.showUsageTips();
    }

    // 頁面卸載
    onPageUnload() {
        console.log('頁面即將卸載');
        
        // 保存設置
        this.saveSettings();
        
        // 清理資源
        this.cleanup();
    }

    // 處理鍵盤快捷鍵
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + O: 打開文件
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            document.getElementById('fileInput').click();
        }
        
        // Ctrl/Cmd + S: 下載當前圖片
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.uiController.downloadCurrentImage();
        }
        
        // Ctrl/Cmd + Z: 撤銷
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        
        // Ctrl/Cmd + Y: 重做
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        
        // 方向鍵: 切換圖片
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.uiController.showPreviousImage();
        }
        
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.uiController.showNextImage();
        }
    }

    // 處理窗口大小變化
    handleWindowResize() {
        // 重新計算佈局
        this.updateLayout();
    }

    // 處理在線狀態變化
    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            Utils.showNotification('網絡連接已恢復', 'success');
        } else {
            Utils.showNotification('網絡連接已斷開', 'warning');
        }
    }

    // 處理全局錯誤
    handleGlobalError(event) {
        console.error('全局錯誤:', event.error);
        Utils.showNotification('發生錯誤，請刷新頁面重試', 'error');
    }

    // 處理未處理的Promise拒絕
    handleUnhandledRejection(event) {
        console.error('未處理的Promise拒絕:', event.reason);
        Utils.showNotification('操作失敗，請重試', 'error');
    }



    // 顯示使用提示
    showUsageTips() {
        const tips = [
            '💡 提示：您可以拖拽圖片到上傳區域',
            '💡 提示：按 Ctrl+O 快速打開文件',
            '💡 提示：按 Ctrl+S 快速下載圖片',
            '💡 提示：使用方向鍵切換圖片'
        ];
        
        let tipIndex = 0;
        const showNextTip = () => {
            if (tipIndex < tips.length) {
                Utils.showNotification(tips[tipIndex], 'info', 5000);
                tipIndex++;
                setTimeout(showNextTip, 10000);
            }
        };
        
        // 延遲顯示第一個提示
        setTimeout(showNextTip, 3000);
    }

    // 顯示歡迎信息
    showWelcomeMessage() {
        const welcomeMessage = `
            🎉 歡迎使用AI圖片優化助手！
            
            主要功能：
            • 支持多種圖片格式上傳
            • 智能圖片優化和處理
            • 豐富的濾鏡和特效
            • 批量處理和下載
            
            開始使用：
            1. 上傳您的圖片
            2. 選擇處理工具
            3. 下載處理結果
        `;
        
        console.log(welcomeMessage);
        Utils.showNotification('歡迎使用AI圖片優化助手！', 'success', 3000);
    }

    // 顯示錯誤信息
    showErrorMessage(message) {
        Utils.showNotification(message, 'error', 0);
    }

    // 顯示警告信息
    showWarningMessage(message) {
        Utils.showNotification(message, 'warning', 5000);
    }

    // 更新佈局
    updateLayout() {
        // 根據窗口大小調整佈局
        const width = window.innerWidth;
        
        if (width < 600) {
            // 移動端佈局
            this.enableMobileLayout();
        } else if (width < 900) {
            // 平板佈局
            this.enableTabletLayout();
        } else {
            // 桌面佈局
            this.enableDesktopLayout();
        }
    }

    // 啟用移動端佈局
    enableMobileLayout() {
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('tablet-layout', 'desktop-layout');
    }

    // 啟用平板佈局
    enableTabletLayout() {
        document.body.classList.add('tablet-layout');
        document.body.classList.remove('mobile-layout', 'desktop-layout');
    }

    // 啟用桌面佈局
    enableDesktopLayout() {
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout', 'tablet-layout');
    }

    // 撤銷操作
    undo() {
        if (this.uiController.images.length === 0) {
            Utils.showNotification('沒有可撤銷的操作', 'warning');
            return;
        }
        
        const currentImage = this.uiController.images[this.uiController.currentImageIndex];
        const processor = currentImage.processor;
        
        if (processor.undo()) {
            this.uiController.updatePreview();
            Utils.showNotification('撤銷成功', 'success');
        } else {
            Utils.showNotification('沒有可撤銷的操作', 'warning');
        }
    }

    // 重做操作
    redo() {
        if (this.uiController.images.length === 0) {
            Utils.showNotification('沒有可重做的操作', 'warning');
            return;
        }
        
        const currentImage = this.uiController.images[this.uiController.currentImageIndex];
        const processor = currentImage.processor;
        
        if (processor.redo()) {
            this.uiController.updatePreview();
            Utils.showNotification('重做成功', 'success');
        } else {
            Utils.showNotification('沒有可重做的操作', 'warning');
        }
    }

    // 加載設置
    loadSettings() {
        try {
            const settings = Utils.Storage.get('aiImageOptimizerSettings', {});
            
            // 應用設置
            if (settings.maxFileSize) {
                document.getElementById('maxFileSize').value = settings.maxFileSize;
            }
            
            if (settings.maxWorkers) {
                document.getElementById('maxWorkers').value = settings.maxWorkers;
            }
            
            if (settings.autoSave !== undefined) {
                document.getElementById('autoSave').checked = settings.autoSave;
            }
            
            if (settings.highQuality !== undefined) {
                document.getElementById('highQuality').checked = settings.highQuality;
            }
            
            if (settings.filenamePrefix) {
                document.getElementById('filenamePrefix').value = settings.filenamePrefix;
            }
            
            console.log('設置加載完成');
            
        } catch (error) {
            console.error('加載設置失敗:', error);
        }
    }

    // 保存設置
    saveSettings() {
        try {
            const settings = {
                maxFileSize: document.getElementById('maxFileSize').value,
                maxWorkers: document.getElementById('maxWorkers').value,
                autoSave: document.getElementById('autoSave').checked,
                highQuality: document.getElementById('highQuality').checked,
                filenamePrefix: document.getElementById('filenamePrefix').value
            };
            
            Utils.Storage.set('aiImageOptimizerSettings', settings);
            console.log('設置保存完成');
            
        } catch (error) {
            console.error('保存設置失敗:', error);
        }
    }

    // 清理資源
    cleanup() {
        try {
            // 停止語音識別
            if (this.voiceControl) {
                this.voiceControl.destroy();
            }
            
            // 清理圖片處理器
            if (this.imageProcessor) {
                this.imageProcessor = null;
            }
            
            // 清理UI控制器
            if (this.uiController) {
                this.uiController = null;
            }
            
            console.log('資源清理完成');
            
        } catch (error) {
            console.error('清理資源失敗:', error);
        }
    }

    // 獲取應用程序狀態
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            imageCount: this.uiController ? this.uiController.images.length : 0,
            currentImageIndex: this.uiController ? this.uiController.currentImageIndex : 0,
            isProcessing: this.uiController ? this.uiController.isProcessing : false,
            isListening: this.voiceControl ? this.voiceControl.isListening : false
        };
    }

    // 重置應用程序
    reset() {
        try {
            // 清空圖片
            if (this.uiController) {
                this.uiController.images = [];
                this.uiController.currentImageIndex = 0;
                this.uiController.updateImageList();
                this.uiController.updatePreview();
                this.uiController.updateDownloadButtons();
            }
            
            // 重置圖片處理器
            if (this.imageProcessor) {
                this.imageProcessor = new ImageProcessor();
            }
            
            // 清空歷史記錄
            const historyList = document.getElementById('historyList');
            if (historyList) {
                historyList.innerHTML = '<div class="history-item"><span class="history-time">尚未處理</span><span class="history-action">等待操作</span></div>';
            }
            
            // 清空對話歷史
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }
            
            // 重置進度條
            Utils.updateProgress(0, '就緒');
            
            Utils.showNotification('應用程序已重置', 'success');
            
        } catch (error) {
            console.error('重置失敗:', error);
            Utils.showNotification('重置失敗', 'error');
        }
    }

    // 導出處理後的圖片
    async exportImages(format = 'jpeg', quality = 0.9) {
        if (this.uiController.images.length === 0) {
            Utils.showNotification('沒有可導出的圖片', 'warning');
            return;
        }
        
        try {
            Utils.updateProgress(0, '準備導出...');
            
            const images = [];
            
            for (let i = 0; i < this.uiController.images.length; i++) {
                const progress = (i / this.uiController.images.length) * 100;
                Utils.updateProgress(progress, `處理圖片 ${i + 1}/${this.uiController.images.length}`);
                
                const image = this.uiController.images[i];
                const processor = image.processor;
                const blob = await processor.toBlob(`image/${format}`, quality);
                
                images.push({
                    name: image.file.name,
                    blob: blob
                });
            }
            
            Utils.updateProgress(100, '導出完成');
            
            // 下載所有圖片
            for (const image of images) {
                const filename = this.uiController.generateFilename(image.name, format);
                Utils.downloadFile(image.blob, filename);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            Utils.showNotification('所有圖片導出完成', 'success');
            
        } catch (error) {
            console.error('導出失敗:', error);
            Utils.showNotification('導出失敗', 'error');
        }
    }
}

// 當DOM加載完成後初始化應用程序
document.addEventListener('DOMContentLoaded', () => {
    // 創建全局應用程序實例
    window.app = new AIImageOptimizer();
    
    // 添加全局錯誤處理
    window.addEventListener('error', (event) => {
        console.error('全局錯誤:', event.error);
    });
    
    // 添加未處理的Promise拒絕處理
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未處理的Promise拒絕:', event.reason);
    });
    
    console.log('AI圖片優化器應用程序已啟動');
});

// 導出應用程序類
window.AIImageOptimizer = AIImageOptimizer; 