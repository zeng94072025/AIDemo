// 简体中文版本V5.0
/*
 * 文件名：utils.js
 * 作用：包含常用的辅助函数和工具方法，如文件处理、通知提示、格式化等。
 * 作者：AI进化论-花生
 * 最后修改时间：2024-06-09
 */
/**
 * 工具函数集合
 * 包含常用的辅助函数和工具方法
 * 
 * 主要功能：
 * - 文件大小和时间格式化
 * - 图片文件验证和处理
 * - 通知提示系统
 * - 文件下载功能
 * - 数据存储管理
 * - 用户交互对话框
 * - 进度条显示
 * - 语音命令解析
 */

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小字符串
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间显示
 * @param {Date} date - 要格式化的日期
 * @returns {string} 相对时间字符串
 */
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';
    
    return date.toLocaleDateString('zh-CN');
}

/**
 * 生成唯一ID
 * @returns {string} 基于时间戳和随机数的唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 防抖函数 - 延迟执行，避免频繁调用
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数 - 限制函数执行频率
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * 检查文件类型是否为有效图片
 * @param {File} file - 要检查的文件
 * @returns {boolean} 是否为有效图片文件
 */
function isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    return validTypes.includes(file.type);
}

/**
 * 检查文件大小是否在限制范围内
 * @param {File} file - 要检查的文件
 * @param {number} maxSizeMB - 最大文件大小（MB），默认10MB
 * @returns {boolean} 文件大小是否有效
 */
function isValidFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

    // 创建图片元素
function createImageElement(src, alt = '') {
    return new Promise((resolve, reject) => {
        console.log('createImageElement 开始:', { srcLength: src.length, alt });
        
        const img = new Image();
        img.onload = () => {
            console.log('图片加载成功:', { width: img.width, height: img.height });
            resolve(img);
        };
        img.onerror = (error) => {
            console.error('图片加载失败:', error);
            reject(error);
        };
        img.src = src;
        img.alt = alt;
    });
}

    // 将文件转换为Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        console.log('fileToBase64 开始:', { fileName: file.name, fileSize: file.size });
        
        const reader = new FileReader();
        reader.onload = () => {
            console.log('文件读取成功，Base64 长度:', reader.result.length);
            resolve(reader.result);
        };
        reader.onerror = (error) => {
            console.error('文件读取失败:', error);
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// 將Base64轉換為Blob
function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// 下載文件
    // 下载文件（支持选择保存位置）
function downloadFile(blob, filename) {
    // 验证输入参数
    if (!blob || blob.size === 0) {
        console.error('下载失败：Blob 无效或为空');
        showNotification('下载失败：文件数据无效', 'error');
        return;
    }
    
    if (!filename || filename.trim() === '') {
        console.error('下载失败：文件名无效');
        showNotification('下载失败：文件名无效', 'error');
        return;
    }
    
    // 清理文件名（移除非法字符）
    const cleanFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
    
    console.log('开始下载文件:', {
        filename: cleanFilename,
        blobSize: blob.size,
        blobType: blob.type
    });
    
            // 优先使用传统下载方式（更稳定）
    try {
        downloadFileLegacy(blob, cleanFilename);
    } catch (error) {
        console.error('传统下载方式失败，尝试现代API:', error);
        
        // 如果传统方式失败，尝试现代API
        if ('showSaveFilePicker' in window) {
            window.showSaveFilePicker({
                suggestedName: cleanFilename,
                types: [{
                    description: '图片文件',
                    accept: {
                        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
                    }
                }]
            }).then(handle => {
                const writable = handle.createWritable();
                writable.write(blob);
                writable.close();
                showNotification('文件保存成功', 'success');
            }).catch(err => {
                console.error('现代API下载失败:', err);
                showNotification('下载失败，请重试', 'error');
            });
        } else {
            showNotification('下载失败，请重试', 'error');
        }
    }
}

// 传统下载方式（兼容旧浏览器）
function downloadFileLegacy(blob, filename) {
    try {
        // 验证 blob 是否有效
        if (!blob || blob.size === 0) {
            console.error('Blob 无效或为空:', blob);
            throw new Error('Blob 无效或为空');
        }
        
        // 验证文件名
        if (!filename || filename.trim() === '') {
            console.error('文件名无效:', filename);
            throw new Error('文件名无效');
        }
        
        console.log('开始下载文件:', {
            filename: filename,
            blobSize: blob.size,
            blobType: blob.type
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        // 添加到DOM并触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理DOM
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('文件下载成功:', filename);
        showNotification('文件下载成功', 'success');
        
    } catch (error) {
        console.error('下载文件失败:', error);
        showNotification('下载失败：' + error.message, 'error');
        // 不抛出异常，让调用者处理
    }
}

// 显示通知（已移除右上角提示，统一使用顶部居中提示）
function showNotification(message, type = 'info', duration = 3000) {
    return showTopCenterNotification(message, type, duration);
}

// 显示顶部中间提示（用于图片处理结果）
function showTopCenterNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `top-center-notification top-center-notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-100%)',
        padding: '8px 16px',
        borderRadius: '6px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '400',
        zIndex: '3000',
        transition: 'transform 0.3s ease',
        maxWidth: '400px',
        wordWrap: 'break-word',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    });
    
    // 设置背景色
    const colors = {
        info: '#007AFF',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

    // 显示确认对话框
function showConfirm(message, title = '确认') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn-secondary" id="cancelBtn">取消</button>
                        <button class="btn btn-primary" id="confirmBtn">确认</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const cancelBtn = modal.querySelector('#cancelBtn');
        const confirmBtn = modal.querySelector('#confirmBtn');
        
        const cleanup = () => {
            document.body.removeChild(modal);
        };
        
        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
                resolve(false);
            }
        });
    });
}

// 显示输入对话框
function showPrompt(message, defaultValue = '', title = '输入') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <input type="text" id="promptInput" value="${defaultValue}" style="width: 100%; margin-top: 12px; padding: 8px 12px; border: 1px solid #C6C6C8; border-radius: 8px;">
                    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn-secondary" id="cancelBtn">取消</button>
                        <button class="btn btn-primary" id="confirmBtn">确认</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#promptInput');
        const cancelBtn = modal.querySelector('#cancelBtn');
        const confirmBtn = modal.querySelector('#confirmBtn');
        
        input.focus();
        input.select();
        
        const cleanup = () => {
            document.body.removeChild(modal);
        };
        
        const handleConfirm = () => {
            cleanup();
            resolve(input.value);
        };
        
        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(null);
        });
        
        confirmBtn.addEventListener('click', handleConfirm);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
                resolve(null);
            }
        });
    });
}

// 更新進度條
function updateProgress(percentage, text = '') {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressStatusText = document.getElementById('progressStatusText');
    const processingProgress = document.getElementById('processingProgress');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }
    
    if (progressStatusText && text) {
        progressStatusText.textContent = text;
    }
    
    // 显示/隐藏进度条
    if (processingProgress) {
        if (percentage > 0 && percentage < 100) {
            processingProgress.style.display = 'block';
        } else if (percentage >= 100) {
            // 完成后延迟隐藏
            setTimeout(() => {
                if (processingProgress) {
                    processingProgress.style.display = 'none';
                }
            }, 1000);
        }
    }
}

// 解析語音指令
function parseVoiceCommand(command) {
    const actions = [];
    const lowerCommand = command.toLowerCase();
    
    // 亮度調整
    const brightnessMatch = lowerCommand.match(/亮度(提高|降低|調整)?\s*(\d+)%/);
    if (brightnessMatch) {
        const value = parseInt(brightnessMatch[2]);
        const isIncrease = brightnessMatch[1] === '提高' || !brightnessMatch[1];
        actions.push({
            type: 'brightness',
            value: isIncrease ? value : -value
        });
    }
    
    // 對比度調整
    const contrastMatch = lowerCommand.match(/對比度(提高|降低|調整)?\s*(\d+)%/);
    if (contrastMatch) {
        const value = parseInt(contrastMatch[2]);
        const isIncrease = contrastMatch[1] === '提高' || !contrastMatch[1];
        actions.push({
            type: 'contrast',
            value: isIncrease ? value : -value
        });
    }
    
    // 飽和度調整
    const saturationMatch = lowerCommand.match(/飽和度(提高|降低|調整)?\s*(\d+)%/);
    if (saturationMatch) {
        const value = parseInt(saturationMatch[2]);
        const isIncrease = saturationMatch[1] === '提高' || !saturationMatch[1];
        actions.push({
            type: 'saturation',
            value: isIncrease ? value : -value
        });
    }
    
    // 濾鏡效果
    const filters = ['黑白', '復古', '懷舊', '冷色調', '暖色調', '戲劇化', '電影感', '人像'];
    filters.forEach(filter => {
        if (lowerCommand.includes(filter)) {
            actions.push({
                type: 'filter',
                value: filter
            });
        }
    });
    
    // 裁剪比例
    const cropMatch = lowerCommand.match(/裁剪為\s*(\d+):(\d+)/);
    if (cropMatch) {
        actions.push({
            type: 'crop',
            value: `${cropMatch[1]}:${cropMatch[2]}`
        });
    }
    
    // 格式轉換
    const formatMatch = lowerCommand.match(/轉換為\s*(jpeg|png|webp|gif)/);
    if (formatMatch) {
        actions.push({
            type: 'format',
            value: formatMatch[1]
        });
    }
    
    // 水印
    const watermarkMatch = lowerCommand.match(/添加水印\s*(.+)/);
    if (watermarkMatch) {
        actions.push({
            type: 'watermark',
            value: watermarkMatch[1]
        });
    }
    
    // 智能优化
    if (lowerCommand.includes('自动优化') || lowerCommand.includes('智能优化')) {
        actions.push({
            type: 'auto-optimize',
            value: true
        });
    }
    
    // 反光消除
    if (lowerCommand.includes('反光消除') || lowerCommand.includes('去除反光')) {
        actions.push({
            type: 'remove-reflection',
            value: true
        });
    }
    
    // 提亮
    if (lowerCommand.includes('提亮') || lowerCommand.includes('變亮')) {
        actions.push({
            type: 'brighten',
            value: true
        });
    }
    
    return actions;
}

// 本地存儲工具
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
    }
};

    // 导出工具函数
window.Utils = {
    formatFileSize,
    formatTime,
    generateId,
    debounce,
    throttle,
    deepClone,
    isValidImageFile,
    isValidFileSize,
    createImageElement,
    fileToBase64,
    base64ToBlob,
    downloadFile,
    showNotification,
    showTopCenterNotification,
    showConfirm,
    showPrompt,
    updateProgress,
    parseVoiceCommand,
    Storage
}; 