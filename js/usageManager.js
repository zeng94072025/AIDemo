/**
 * 使用次數管理服務
 * 管理用戶的免費使用次數和付費狀態
 * 
 * 功能：
 * - 追蹤每日使用次數
 * - 檢查使用限制
 * - 更新使用統計
 * - 提供升級建議
 * 
 * 作者：AI進化論-花生
 * 最後修改時間：2024-06-09
 */

class UsageManager {
    constructor() {
        this.config = {
            freeDailyLimit: 3,      // 免費版每日限制
            paidDailyLimit: 999999, // 付費版每日限制（實際無限制）
            resetTime: '00:00',     // 每日重置時間
            warningThreshold: 0.8   // 使用量警告閾值（80%）
        };
        
        this.userInfo = this.getUserInfo();
        this.init();
    }
    
    /**
     * 初始化服務
     */
    init() {
        this.cleanupExpiredRecords();
        this.updateUsageDisplay();
    }
    
    /**
     * 獲取用戶信息
     */
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : {};
    }
    
    /**
     * 檢查是否可以處理圖片
     * @param {string} operation 操作類型（basic, ai, filter等）
     * @returns {Object} 檢查結果
     */
    canProcess(operation = 'basic') {
        const today = new Date().toDateString();
        const usageKey = `usage_${today}`;
        const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');
        
        // 付費用戶和測試用戶無限制
        if (this.userInfo.isPaid || this.userInfo.isTestUser) {
            return {
                allowed: true,
                remaining: this.config.paidDailyLimit - todayUsage,
                message: '無限制使用'
            };
        }
        
        // 免費用戶檢查限制
        const maxUsage = this.config.freeDailyLimit;
        const remaining = Math.max(0, maxUsage - todayUsage);
        
        if (remaining > 0) {
            return {
                allowed: true,
                remaining: remaining,
                message: `今日還剩 ${remaining} 次免費額度`
            };
        } else {
            return {
                allowed: false,
                remaining: 0,
                message: '今日免費額度已用完，請升級到專業版'
            };
        }
    }
    
    /**
     * 記錄使用次數
     * @param {string} operation 操作類型
     * @param {Object} details 詳細信息
     */
    recordUsage(operation, details = {}) {
        const today = new Date().toDateString();
        const usageKey = `usage_${today}`;
        const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');
        
        // 增加使用次數
        const newUsage = todayUsage + 1;
        localStorage.setItem(usageKey, newUsage.toString());
        
        // 記錄詳細使用信息
        const usageRecord = {
            timestamp: Date.now(),
            operation: operation,
            details: details,
            userPhone: this.userInfo.phone,
            planType: this.userInfo.planType || 'free'
        };
        
        const recordsKey = `usage_records_${today}`;
        const records = JSON.parse(localStorage.getItem(recordsKey) || '[]');
        records.push(usageRecord);
        localStorage.setItem(recordsKey, JSON.stringify(records));
        
        // 更新顯示
        this.updateUsageDisplay();
        
        console.log(`記錄使用次數: ${operation}, 今日總計: ${newUsage}`);
        
        return {
            success: true,
            newUsage: newUsage,
            remaining: this.getRemainingUsage()
        };
    }
    
    /**
     * 獲取剩餘使用次數
     * @returns {number} 剩餘次數
     */
    getRemainingUsage() {
        const today = new Date().toDateString();
        const usageKey = `usage_${today}`;
        const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');
        
        if (this.userInfo.isPaid || this.userInfo.isTestUser) {
            return this.config.paidDailyLimit - todayUsage;
        } else {
            return Math.max(0, this.config.freeDailyLimit - todayUsage);
        }
    }
    
    /**
     * 獲取今日使用次數
     * @returns {number} 今日使用次數
     */
    getTodayUsage() {
        const today = new Date().toDateString();
        const usageKey = `usage_${today}`;
        return parseInt(localStorage.getItem(usageKey) || '0');
    }
    
    /**
     * 獲取使用統計
     * @param {number} days 統計天數
     * @returns {Object} 統計信息
     */
    getUsageStats(days = 7) {
        const stats = {
            total: 0,
            daily: [],
            average: 0,
            peak: 0
        };
        
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const usageKey = `usage_${dateStr}`;
            const usage = parseInt(localStorage.getItem(usageKey) || '0');
            
            stats.daily.unshift({
                date: dateStr,
                usage: usage
            });
            
            stats.total += usage;
            stats.peak = Math.max(stats.peak, usage);
        }
        
        stats.average = Math.round(stats.total / days);
        
        return stats;
    }
    
    /**
     * 更新使用量顯示
     */
    updateUsageDisplay() {
        const today = new Date().toDateString();
        const usageKey = `usage_${today}`;
        const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');
        const remaining = this.getRemainingUsage();
        
        // 更新頁面中的使用量顯示
        const usageElements = document.querySelectorAll('.usage-display');
        usageElements.forEach(element => {
            if (this.userInfo.isPaid || this.userInfo.isTestUser) {
                element.textContent = `今日已使用: ${todayUsage} 次 (無限制)`;
            } else {
                element.textContent = `今日已使用: ${todayUsage}/${this.config.freeDailyLimit} 次`;
            }
        });
        
        // 更新剩餘次數顯示
        const remainingElements = document.querySelectorAll('.remaining-usage');
        remainingElements.forEach(element => {
            if (this.userInfo.isPaid || this.userInfo.isTestUser) {
                element.textContent = '無限制';
            } else {
                element.textContent = `${remaining} 次`;
            }
        });
        
        // 檢查是否需要顯示警告
        this.checkUsageWarning();
    }
    
    /**
     * 檢查使用量警告
     */
    checkUsageWarning() {
        if (this.userInfo.isPaid || this.userInfo.isTestUser) {
            return; // 付費用戶不需要警告
        }
        
        const todayUsage = this.getTodayUsage();
        const maxUsage = this.config.freeDailyLimit;
        const usageRatio = todayUsage / maxUsage;
        
        if (usageRatio >= this.config.warningThreshold) {
            this.showUsageWarning(todayUsage, maxUsage);
        }
    }
    
    /**
     * 顯示使用量警告
     * @param {number} current 當前使用量
     * @param {number} max 最大使用量
     */
    showUsageWarning(current, max) {
        const warningMessage = `您今日已使用 ${current}/${max} 次免費額度，建議升級到專業版享受無限制使用。`;
        
        // 創建警告提示
        const warningDiv = document.createElement('div');
        warningDiv.className = 'usage-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${warningMessage}</span>
                <button class="btn btn-primary btn-sm" onclick="window.location.href='plans.html'">
                    立即升級
                </button>
                <button class="btn btn-secondary btn-sm" onclick="this.parentElement.parentElement.remove()">
                    稍後再說
                </button>
            </div>
        `;
        
        // 添加到頁面
        const container = document.querySelector('.main-content') || document.body;
        container.appendChild(warningDiv);
        
        // 5秒後自動移除
        setTimeout(() => {
            if (warningDiv.parentElement) {
                warningDiv.remove();
            }
        }, 5000);
    }
    
    /**
     * 清理過期的使用記錄
     */
    cleanupExpiredRecords() {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30天
        
        keys.forEach(key => {
            if (key.startsWith('usage_') && key !== 'usage_records') {
                // 檢查是否超過30天
                const parts = key.split('_');
                if (parts.length >= 2) {
                    const dateStr = parts.slice(1).join('_');
                    const recordDate = new Date(dateStr);
                    
                    if (now - recordDate.getTime() > thirtyDays) {
                        localStorage.removeItem(key);
                    }
                }
            }
        });
    }
    
    /**
     * 重置使用次數
     * @param {string} date 日期字符串（可選）
     */
    resetUsage(date = null) {
        const targetDate = date || new Date().toDateString();
        const usageKey = `usage_${targetDate}`;
        const recordsKey = `usage_records_${targetDate}`;
        
        localStorage.removeItem(usageKey);
        localStorage.removeItem(recordsKey);
        
        console.log(`已重置 ${targetDate} 的使用記錄`);
        
        // 更新顯示
        this.updateUsageDisplay();
    }
    
    /**
     * 獲取升級建議
     * @returns {Object} 升級建議
     */
    getUpgradeSuggestion() {
        const todayUsage = this.getTodayUsage();
        const maxUsage = this.config.freeDailyLimit;
        const usageRatio = todayUsage / maxUsage;
        
        if (this.userInfo.isPaid || this.userInfo.isTestUser) {
            return {
                needed: false,
                message: '您已經是專業版用戶'
            };
        }
        
        if (usageRatio >= 1) {
            return {
                needed: true,
                urgency: 'high',
                message: '今日額度已用完，建議立即升級',
                reason: '使用量超限'
            };
        } else if (usageRatio >= 0.8) {
            return {
                needed: true,
                urgency: 'medium',
                message: '使用量接近上限，建議升級',
                reason: '使用量較高'
            };
        } else if (usageRatio >= 0.5) {
            return {
                needed: true,
                urgency: 'low',
                message: '考慮升級以獲得更好體驗',
                reason: '使用量中等'
            };
        } else {
            return {
                needed: false,
                message: '當前使用量正常'
            };
        }
    }
    
    /**
     * 導出使用數據
     * @param {number} days 導出天數
     * @returns {string} CSV格式的數據
     */
    exportUsageData(days = 30) {
        const stats = this.getUsageStats(days);
        let csv = '日期,使用次數\n';
        
        stats.daily.forEach(day => {
            csv += `${day.date},${day.usage}\n`;
        });
        
        return csv;
    }
    
    /**
     * 下載使用數據
     * @param {number} days 導出天數
     */
    downloadUsageData(days = 30) {
        const csv = this.exportUsageData(days);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `usage_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 導出服務實例
window.UsageManager = UsageManager; 