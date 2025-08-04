/**
 * 主应用程序
 * 初始化所有模块并协调它们的工作
 */

class AIImageOptimizer {
    constructor() {
        this.uiController = null;
        this.isInitialized = false;
        
        this.init();
    }

    // 初始化应用程序
    async init() {
        try {
            console.log('正在初始化AI图片优化器...');
            
            // 检查浏览器支持
            this.checkBrowserSupport();
            
            // 初始化各个模块
            await this.initModules();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 加载设置
            this.loadSettings();
            
            // 显示欢迎信息
            this.showWelcomeMessage();
            
            this.isInitialized = true;
            console.log('AI图片优化器初始化完成');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showErrorMessage('应用程序初始化失败，请刷新页面重试');
        }
    }

    // 检查浏览器支持
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
            console.warn('不支持的浏览器功能:', unsupported);
            this.showWarningMessage(`您的浏览器不支持以下功能: ${unsupported.join(', ')}。某些功能可能无法正常工作。`);
        }
    }

    // 初始化模块
    async initModules() {
        // 等待DOM完全加载
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // 初始化UI控制器
        this.uiController = new UIController();
        window.uiController = this.uiController;
        
        // 初始化涂鸦标注工具
        if (this.uiController) {
            this.uiController.initDrawingTools();
        }
        
        console.log('所有模块初始化完成');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 页面加载完成
        window.addEventListener('load', () => {
            this.onPageLoad();
        });

        // 页面卸载
        window.addEventListener('beforeunload', () => {
            this.onPageUnload();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 窗口大小变化
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // 在线状态变化
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });

        // 错误处理
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }



    // 页面加载完成
    onPageLoad() {
        console.log('页面加载完成');
        
        // 更新状态
        Utils.updateProgress(100, '就绪');
        
        // 显示使用提示
        this.showUsageTips();
    }

    // 页面卸载
    onPageUnload() {
        console.log('页面即将卸载');
        
        // 保存设置
        this.saveSettings();
        
        // 清理资源
        this.cleanup();
    }

    // 处理键盘快捷键
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + O: 打开文件
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            document.getElementById('fileInput').click();
        }
        
        // Ctrl/Cmd + S: 下载当前图片
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.uiController.downloadCurrentImage();
        }
        
        // Ctrl/Cmd + Z: 撤销
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        
        // Ctrl/Cmd + Y: 重做
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        
        // 方向键: 切换图片
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.uiController.showPreviousImage();
        }
        
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.uiController.showNextImage();
        }
    }

    // 处理窗口大小变化
    handleWindowResize() {
        // 重新计算布局
        this.updateLayout();
    }

    // 处理在线状态变化
    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            Utils.showNotification('网络连接已恢复', 'success');
        } else {
            Utils.showNotification('网络连接已断开', 'warning');
        }
    }

    // 处理全局错误
    handleGlobalError(event) {
        console.error('全局错误:', event.error);
        Utils.showNotification('发生错误，请刷新页面重试', 'error');
    }

    // 处理未处理的Promise拒绝
    handleUnhandledRejection(event) {
        console.error('未处理的Promise拒绝:', event.reason);
        Utils.showNotification('操作失败，请重试', 'error');
    }



    // 显示使用提示
    showUsageTips() {
        const tips = [
            '💡 提示：您可以拖拽图片到上传区域',
            '💡 提示：按 Ctrl+O 快速打开文件',
            '💡 提示：按 Ctrl+S 快速下载图片',
            '💡 提示：使用方向键切换图片'
        ];
        
        // 移除自动弹出的使用提示
        // let tipIndex = 0;
        // const showNextTip = () => {
        //     if (tipIndex < tips.length) {
        //         Utils.showNotification(tips[tipIndex], 'info', 5000);
        //         tipIndex++;
        //         setTimeout(showNextTip, 10000);
        //     }
        // };
        
        // 延迟显示第一个提示
        // setTimeout(showNextTip, 3000);
    }

    // 显示欢迎信息
    showWelcomeMessage() {
        const welcomeMessage = `
            🎉 欢迎使用AI图片优化助手！
            
            主要功能：
            • 支持多种图片格式上传
            • 智能图片优化和处理
            • 丰富的滤镜和特效
            • 批量处理和下载
            
            开始使用：
            1. 上传您的图片
            2. 选择处理工具
            3. 下载处理结果
        `;
        
        console.log(welcomeMessage);
        // 移除自动弹出的欢迎通知
        // Utils.showNotification('欢迎使用AI图片优化助手！', 'success', 3000);
    }

    // 显示错误信息
    showErrorMessage(message) {
        Utils.showNotification(message, 'error', 0);
    }

    // 显示警告信息
    showWarningMessage(message) {
        Utils.showNotification(message, 'warning', 5000);
    }

    // 更新布局
    updateLayout() {
        // 根据窗口大小调整布局
        const width = window.innerWidth;
        
        if (width < 600) {
            // 移动端布局
            this.enableMobileLayout();
        } else if (width < 900) {
            // 平板布局
            this.enableTabletLayout();
        } else {
            // 桌面布局
            this.enableDesktopLayout();
        }
    }

    // 启用移动端布局
    enableMobileLayout() {
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('tablet-layout', 'desktop-layout');
    }

    // 启用平板布局
    enableTabletLayout() {
        document.body.classList.add('tablet-layout');
        document.body.classList.remove('mobile-layout', 'desktop-layout');
    }

    // 启用桌面布局
    enableDesktopLayout() {
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout', 'tablet-layout');
    }

    // 撤销操作
    undo() {
        if (this.uiController.images.length === 0) {
            Utils.showNotification('没有可撤销的操作', 'warning');
            return;
        }
        
        const currentImage = this.uiController.images[this.uiController.currentImageIndex];
        const processor = currentImage.processor;
        
        if (processor.undo()) {
            this.uiController.updatePreview();
            Utils.showNotification('撤销成功', 'success');
        } else {
            Utils.showNotification('没有可撤销的操作', 'warning');
        }
    }

    // 重做操作
    redo() {
        if (this.uiController.images.length === 0) {
            Utils.showNotification('没有可重做的操作', 'warning');
            return;
        }
        
        const currentImage = this.uiController.images[this.uiController.currentImageIndex];
        const processor = currentImage.processor;
        
        if (processor.redo()) {
            this.uiController.updatePreview();
            Utils.showNotification('重做成功', 'success');
        } else {
            Utils.showNotification('没有可重做的操作', 'warning');
        }
    }

    // 加载设置
    loadSettings() {
        try {
            const settings = Utils.Storage.get('aiImageOptimizerSettings', {});
            
            // 应用设置
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
            
            console.log('设置加载完成');
            
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    // 保存设置
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
            console.log('设置保存完成');
            
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    // 清理资源
    cleanup() {
        try {
            // 停止语音识别
            if (this.voiceControl) {
                this.voiceControl.destroy();
            }
            
            // 清理图片处理器
            if (this.imageProcessor) {
                this.imageProcessor = null;
            }
            
            // 清理UI控制器
            if (this.uiController) {
                this.uiController = null;
            }
            
            console.log('资源清理完成');
            
        } catch (error) {
            console.error('清理资源失败:', error);
        }
    }

    // 获取应用程序状态
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            imageCount: this.uiController ? this.uiController.images.length : 0,
            currentImageIndex: this.uiController ? this.uiController.currentImageIndex : 0,
            isProcessing: this.uiController ? this.uiController.isProcessing : false,
            isListening: this.voiceControl ? this.voiceControl.isListening : false
        };
    }

    // 重置应用程序
    reset() {
        try {
            // 清空图片
            if (this.uiController) {
                this.uiController.images = [];
                this.uiController.currentImageIndex = 0;
                this.uiController.updateImageList();
                this.uiController.updatePreview();
                this.uiController.updateDownloadButtons();
            }
            
            // 重置图片处理器
            if (this.imageProcessor) {
                this.imageProcessor = new ImageProcessor();
            }
            
            // 清空选中的图片
            this.uiController.selectedImages.clear();
            
            // 清空对话历史
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }
            
            // 重置进度条
            Utils.updateProgress(0, '就绪');
            
            Utils.showNotification('应用程序已重置', 'success');
            
        } catch (error) {
            console.error('重置失败:', error);
            Utils.showNotification('重置失败', 'error');
        }
    }

    // 导出处理后的图片
    async exportImages(format = 'jpeg', quality = 0.9) {
        if (this.uiController.images.length === 0) {
            Utils.showNotification('没有可导出的图片', 'warning');
            return;
        }
        
        try {
            Utils.updateProgress(0, '准备导出...');
            
            const images = [];
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < this.uiController.images.length; i++) {
                const progress = (i / this.uiController.images.length) * 100;
                Utils.updateProgress(progress, `处理图片 ${i + 1}/${this.uiController.images.length}`);
                
                const image = this.uiController.images[i];
                const processor = image.processor;
                
                try {
                    // 验证处理器
                    if (!processor) {
                        console.error(`图片 ${image.file.name} 的处理器无效`);
                        errorCount++;
                        continue;
                    }
                    
                    const blob = await processor.toBlob(`image/${format}`, quality);
                    
                    // 验证生成的 blob
                    if (!blob || blob.size === 0) {
                        console.error(`图片 ${image.file.name} 生成的 Blob 无效`);
                        errorCount++;
                        continue;
                    }
                    
                    images.push({
                        name: image.file.name,
                        blob: blob
                    });
                    successCount++;
                    
                    console.log(`图片 ${image.file.name} 处理成功:`, {
                        blobSize: blob.size
                    });
                    
                } catch (error) {
                    console.error(`处理图片 ${image.file.name} 失败:`, error);
                    errorCount++;
                }
            }
            
            if (successCount === 0) {
                throw new Error('没有成功处理的图片');
            }
            
            Utils.updateProgress(100, '导出完成');
            
            // 下载所有图片
            for (const image of images) {
                const filename = this.uiController.generateFilename(image.name, format);
                Utils.downloadFile(image.blob, filename);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            let message = `已导出 ${successCount} 张图片`;
            if (errorCount > 0) {
                message += `，${errorCount} 张处理失败`;
            }
            
            Utils.showNotification(message, successCount > 0 ? 'success' : 'warning');
            
        } catch (error) {
            console.error('导出失败:', error);
            Utils.showNotification(`导出失败: ${error.message}`, 'error');
        }
    }
}

// 當DOM加載完成後初始化應用程序（僅在沒有認證系統時執行）
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否已經有認證管理器
    const userRole = localStorage.getItem('userRole');
    const userPhone = localStorage.getItem('userPhone');
    
    // 如果沒有認證信息，直接初始化（用於開發測試）
    if (!userRole || !userPhone) {
        console.log('未檢測到認證信息，直接初始化應用程序...');
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
        
        console.log('AI圖片優化器應用程序已啟動（無認證模式）');
    } else {
        console.log('檢測到認證信息，等待認證管理器初始化完成...');
    }
});

// 導出應用程序類
window.AIImageOptimizer = AIImageOptimizer; 