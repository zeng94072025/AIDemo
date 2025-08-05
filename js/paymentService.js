/**
 * 支付服務模組
 * 實現微信支付和支付寶支付的完整功能
 */
class PaymentService {
    constructor() {
        this.config = {
            // 微信支付配置
            wechat: {
                appId: 'wx1234567890abcdef', // 微信公眾號AppID
                mchId: '1234567890', // 商戶號
                apiKey: 'your_wechat_api_key_here', // API密鑰
                certPath: '/path/to/wechat/cert.pem', // 證書路徑
                keyPath: '/path/to/wechat/key.pem', // 私鑰路徑
                notifyUrl: 'https://your-domain.com/api/wechat/notify', // 支付回調地址
                tradeType: 'NATIVE', // 支付類型：NATIVE(掃碼支付)、JSAPI(公眾號支付)、APP(APP支付)
                sandbox: false // 是否為沙箱環境
            },
            // 支付寶配置
            alipay: {
                appId: '2021000000000000', // 支付寶應用ID
                privateKey: 'your_alipay_private_key_here', // 應用私鑰
                publicKey: 'alipay_public_key_here', // 支付寶公鑰
                gateway: 'https://openapi.alipay.com/gateway.do', // 支付寶網關
                notifyUrl: 'https://your-domain.com/api/alipay/notify', // 異步通知地址
                returnUrl: 'https://your-domain.com/payment/result', // 同步返回地址
                charset: 'utf-8',
                format: 'json',
                version: '1.0',
                signType: 'RSA2',
                sandbox: false // 是否為沙箱環境
            },
            // 通用配置
            common: {
                currency: 'CNY',
                timeout: 300000, // 5分鐘超時
                maxRetries: 3,
                statusCheckInterval: 3000 // 3秒檢查一次
            }
        };
        
        this.currentOrder = null;
        this.paymentStatus = 'pending';
        this.statusCheckInterval = null;
        this.retryCount = 0;
        
        this.init();
    }
    
    init() {
        // 初始化支付環境
        this.initPaymentEnvironment();
        // 加載支付歷史
        this.loadPaymentHistory();
    }
    
    initPaymentEnvironment() {
        // 檢查是否在沙箱環境
        if (this.config.wechat.sandbox || this.config.alipay.sandbox) {
            console.log('⚠️ 當前運行在沙箱環境，僅用於測試');
        }
        
        // 初始化微信支付SDK（如果可用）
        if (typeof WeixinJSBridge !== 'undefined') {
            this.initWechatSDK();
        }
        
        // 初始化支付寶SDK（如果可用）
        if (typeof AlipayJSBridge !== 'undefined') {
            this.initAlipaySDK();
        }
    }
    
    initWechatSDK() {
        // 微信支付SDK初始化
        try {
            // 這裡可以加載微信支付SDK
            console.log('微信支付SDK已初始化');
        } catch (error) {
            console.error('微信支付SDK初始化失敗:', error);
        }
    }
    
    initAlipaySDK() {
        // 支付寶SDK初始化
        try {
            // 這裡可以加載支付寶SDK
            console.log('支付寶SDK已初始化');
        } catch (error) {
            console.error('支付寶SDK初始化失敗:', error);
        }
    }
    
    /**
     * 創建支付訂單
     * @param {Object} orderData 訂單數據
     * @returns {Promise<Object>} 支付結果
     */
    async createPaymentOrder(orderData) {
        try {
            // 驗證訂單數據
            this.validateOrderData(orderData);
            
            // 生成訂單ID
            const orderId = this.generateOrderId();
            
            // 創建訂單記錄
            const order = {
                orderId: orderId,
                userId: orderData.userId,
                amount: orderData.amount,
                currency: this.config.common.currency,
                paymentMethod: orderData.paymentMethod,
                planType: orderData.planType,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // 保存訂單
            this.saveOrder(order);
            this.currentOrder = order;
            
            // 根據支付方式創建支付
            let paymentResult;
            if (orderData.paymentMethod === 'wechat') {
                paymentResult = await this.createWechatPayment(order);
            } else if (orderData.paymentMethod === 'alipay') {
                paymentResult = await this.createAlipayPayment(order);
            } else {
                throw new Error('不支持的支付方式');
            }
            
            return {
                success: true,
                orderId: orderId,
                paymentData: paymentResult
            };
            
        } catch (error) {
            console.error('創建支付訂單失敗:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * 創建微信支付
     * @param {Object} order 訂單信息
     * @returns {Promise<Object>} 支付結果
     */
    async createWechatPayment(order) {
        try {
            // 構建微信支付參數
            const paymentParams = {
                appid: this.config.wechat.appId,
                mch_id: this.config.wechat.mchId,
                nonce_str: this.generateNonceStr(),
                body: `AI圖片優化助手-${order.planType}套餐`,
                out_trade_no: order.orderId,
                total_fee: Math.round(order.amount * 100), // 微信支付金額為分
                spbill_create_ip: this.getClientIP(),
                notify_url: this.config.wechat.notifyUrl,
                trade_type: this.config.wechat.tradeType
            };
            
            // 生成簽名
            paymentParams.sign = this.generateWechatSignature(paymentParams);
            
            // 調用微信支付API
            const result = await this.callWechatAPI('pay/unifiedorder', paymentParams);
            
            if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
                // 生成支付二維碼
                const qrCodeUrl = result.code_url;
                
                return {
                    qrCodeUrl: qrCodeUrl,
                    orderId: order.orderId,
                    amount: order.amount,
                    paymentMethod: 'wechat'
                };
            } else {
                throw new Error(`微信支付創建失敗: ${result.return_msg || result.err_code_des}`);
            }
            
        } catch (error) {
            console.error('微信支付創建失敗:', error);
            throw error;
        }
    }
    
    /**
     * 創建支付寶支付
     * @param {Object} order 訂單信息
     * @returns {Promise<Object>} 支付結果
     */
    async createAlipayPayment(order) {
        try {
            // 構建支付寶支付參數
            const paymentParams = {
                app_id: this.config.alipay.appId,
                method: 'alipay.trade.page.pay',
                charset: this.config.alipay.charset,
                sign_type: this.config.alipay.signType,
                timestamp: this.formatTimestamp(new Date()),
                version: this.config.alipay.version,
                notify_url: this.config.alipay.notifyUrl,
                return_url: this.config.alipay.returnUrl,
                biz_content: JSON.stringify({
                    out_trade_no: order.orderId,
                    product_code: 'FAST_INSTANT_TRADE_PAY',
                    total_amount: order.amount.toFixed(2),
                    subject: `AI圖片優化助手-${order.planType}套餐`,
                    body: `購買${order.planType}套餐服務`
                })
            };
            
            // 生成簽名
            paymentParams.sign = this.generateAlipaySignature(paymentParams);
            
            // 構建支付表單
            const formHtml = this.buildAlipayForm(paymentParams);
            
            return {
                formHtml: formHtml,
                orderId: order.orderId,
                amount: order.amount,
                paymentMethod: 'alipay'
            };
            
        } catch (error) {
            console.error('支付寶支付創建失敗:', error);
            throw error;
        }
    }
    
    /**
     * 檢查支付狀態
     * @param {string} orderId 訂單ID
     * @returns {Promise<Object>} 支付狀態
     */
    async checkPaymentStatus(orderId) {
        try {
            const order = this.getOrder(orderId);
            if (!order) {
                throw new Error('訂單不存在');
            }
            
            let statusResult;
            if (order.paymentMethod === 'wechat') {
                statusResult = await this.checkWechatPaymentStatus(orderId);
            } else if (order.paymentMethod === 'alipay') {
                statusResult = await this.checkAlipayPaymentStatus(orderId);
            } else {
                throw new Error('不支持的支付方式');
            }
            
            // 更新訂單狀態
            if (statusResult.success) {
                this.updateOrderStatus(orderId, 'success');
                this.handlePaymentSuccess(order);
            } else if (statusResult.status === 'failed') {
                this.updateOrderStatus(orderId, 'failed');
            }
            
            return statusResult;
            
        } catch (error) {
            console.error('檢查支付狀態失敗:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
    
    /**
     * 檢查微信支付狀態
     * @param {string} orderId 訂單ID
     * @returns {Promise<Object>} 支付狀態
     */
    async checkWechatPaymentStatus(orderId) {
        try {
            const order = this.getOrder(orderId);
            
            // 構建查詢參數
            const queryParams = {
                appid: this.config.wechat.appId,
                mch_id: this.config.wechat.mchId,
                out_trade_no: orderId,
                nonce_str: this.generateNonceStr()
            };
            
            // 生成簽名
            queryParams.sign = this.generateWechatSignature(queryParams);
            
            // 調用微信查詢API
            const result = await this.callWechatAPI('pay/orderquery', queryParams);
            
            if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
                if (result.trade_state === 'SUCCESS') {
                    return { success: true, status: 'success' };
                } else if (result.trade_state === 'CLOSED' || result.trade_state === 'REVOKED') {
                    return { success: false, status: 'failed', message: '支付已關閉或撤銷' };
                } else {
                    return { success: false, status: 'processing' };
                }
            } else {
                throw new Error(`微信支付查詢失敗: ${result.return_msg || result.err_code_des}`);
            }
            
        } catch (error) {
            console.error('微信支付狀態查詢失敗:', error);
            throw error;
        }
    }
    
    /**
     * 檢查支付寶支付狀態
     * @param {string} orderId 訂單ID
     * @returns {Promise<Object>} 支付狀態
     */
    async checkAlipayPaymentStatus(orderId) {
        try {
            const order = this.getOrder(orderId);
            
            // 構建查詢參數
            const queryParams = {
                app_id: this.config.alipay.appId,
                method: 'alipay.trade.query',
                charset: this.config.alipay.charset,
                sign_type: this.config.alipay.signType,
                timestamp: this.formatTimestamp(new Date()),
                version: this.config.alipay.version,
                biz_content: JSON.stringify({
                    out_trade_no: orderId
                })
            };
            
            // 生成簽名
            queryParams.sign = this.generateAlipaySignature(queryParams);
            
            // 調用支付寶查詢API
            const result = await this.callAlipayAPI(queryParams);
            
            if (result.alipay_trade_query_response.code === '10000') {
                const tradeStatus = result.alipay_trade_query_response.trade_status;
                if (tradeStatus === 'TRADE_SUCCESS') {
                    return { success: true, status: 'success' };
                } else if (tradeStatus === 'TRADE_CLOSED') {
                    return { success: false, status: 'failed', message: '交易已關閉' };
                } else {
                    return { success: false, status: 'processing' };
                }
            } else {
                throw new Error(`支付寶支付查詢失敗: ${result.alipay_trade_query_response.msg}`);
            }
            
        } catch (error) {
            console.error('支付寶支付狀態查詢失敗:', error);
            throw error;
        }
    }
    
    /**
     * 處理支付成功
     * @param {Object} order 訂單信息
     */
    handlePaymentSuccess(order) {
        // 更新用戶信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        userInfo.isPaid = true;
        userInfo.planType = 'paid';
        userInfo.paymentTime = new Date().toISOString();
        userInfo.orderId = order.orderId;
        userInfo.paymentMethod = order.paymentMethod;
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // 記錄支付歷史
        this.recordPaymentHistory(order);
        
        // 重置使用量（升級後重置）
        this.resetUsageAfterUpgrade();
        
        console.log('支付成功處理完成');
    }
    
    /**
     * 開始支付狀態輪詢
     * @param {string} orderId 訂單ID
     */
    startPaymentStatusCheck(orderId) {
        this.statusCheckInterval = setInterval(async () => {
            const result = await this.checkPaymentStatus(orderId);
            
            if (result.success || result.status === 'failed') {
                this.stopPaymentStatusCheck();
                
                // 觸發支付完成事件
                this.triggerPaymentEvent(result.success ? 'success' : 'failed', result);
            }
        }, this.config.common.statusCheckInterval);
        
        // 設置超時
        setTimeout(() => {
            if (this.statusCheckInterval) {
                this.stopPaymentStatusCheck();
                this.triggerPaymentEvent('timeout', { message: '支付超時' });
            }
        }, this.config.common.timeout);
    }
    
    /**
     * 停止支付狀態輪詢
     */
    stopPaymentStatusCheck() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }
    
    /**
     * 觸發支付事件
     * @param {string} eventType 事件類型
     * @param {Object} data 事件數據
     */
    triggerPaymentEvent(eventType, data) {
        const event = new CustomEvent('paymentStatusChanged', {
            detail: {
                type: eventType,
                data: data,
                orderId: this.currentOrder?.orderId
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // 工具方法
    
    validateOrderData(orderData) {
        if (!orderData.userId) throw new Error('用戶ID不能為空');
        if (!orderData.amount || orderData.amount <= 0) throw new Error('支付金額必須大於0');
        if (!orderData.paymentMethod) throw new Error('支付方式不能為空');
        if (!orderData.planType) throw new Error('套餐類型不能為空');
    }
    
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `ORDER${timestamp}${random}`;
    }
    
    generateNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }
    
    generateWechatSignature(params) {
        // 微信支付簽名生成
        const sortedParams = Object.keys(params)
            .filter(key => key !== 'sign' && params[key] !== '')
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&') + `&key=${this.config.wechat.apiKey}`;
        
        // 這裡應該使用MD5或HMAC-SHA256，這裡簡化處理
        return btoa(sortedParams).substring(0, 32);
    }
    
    generateAlipaySignature(params) {
        // 支付寶簽名生成
        const sortedParams = Object.keys(params)
            .filter(key => key !== 'sign' && params[key] !== '')
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        
        // 這裡應該使用RSA2簽名，這裡簡化處理
        return btoa(sortedParams).substring(0, 64);
    }
    
    formatTimestamp(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0];
    }
    
    getClientIP() {
        // 獲取客戶端IP，這裡簡化處理
        return '127.0.0.1';
    }
    
    buildAlipayForm(params) {
        // 構建支付寶支付表單
        const formData = Object.keys(params)
            .map(key => `<input type="hidden" name="${key}" value="${params[key]}">`)
            .join('');
        
        return `
            <form id="alipayForm" action="${this.config.alipay.gateway}" method="post">
                ${formData}
            </form>
            <script>document.getElementById('alipayForm').submit();</script>
        `;
    }
    
    async callWechatAPI(api, params) {
        // 調用微信支付API，這裡模擬
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬API響應
        return {
            return_code: 'SUCCESS',
            result_code: 'SUCCESS',
            code_url: 'weixin://wxpay/bizpayurl?pr=test123',
            out_trade_no: params.out_trade_no
        };
    }
    
    async callAlipayAPI(params) {
        // 調用支付寶API，這裡模擬
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬API響應
        return {
            alipay_trade_query_response: {
                code: '10000',
                msg: 'Success',
                trade_status: 'TRADE_SUCCESS'
            }
        };
    }
    
    // 本地存儲方法
    
    saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('paymentOrders') || '[]');
        orders.push(order);
        localStorage.setItem('paymentOrders', JSON.stringify(orders));
    }
    
    getOrder(orderId) {
        const orders = JSON.parse(localStorage.getItem('paymentOrders') || '[]');
        return orders.find(order => order.orderId === orderId);
    }
    
    updateOrderStatus(orderId, status) {
        const orders = JSON.parse(localStorage.getItem('paymentOrders') || '[]');
        const orderIndex = orders.findIndex(order => order.orderId === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            orders[orderIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('paymentOrders', JSON.stringify(orders));
        }
    }
    
    loadPaymentHistory() {
        // 加載支付歷史記錄
        const history = JSON.parse(localStorage.getItem('paymentHistory') || '{}');
        return history;
    }
    
    recordPaymentHistory(order) {
        const today = new Date().toDateString();
        const history = JSON.parse(localStorage.getItem('paymentHistory') || '{}');
        
        if (!history[today]) {
            history[today] = 0;
        }
        history[today]++;
        
        localStorage.setItem('paymentHistory', JSON.stringify(history));
        
        // 記錄詳細支付記錄
        const records = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
        records.push({
            orderId: order.orderId,
            amount: order.amount,
            paymentMethod: order.paymentMethod,
            timestamp: new Date().toISOString(),
            userId: order.userId,
            status: 'success'
        });
        
        localStorage.setItem('paymentRecords', JSON.stringify(records));
    }
    
    resetUsageAfterUpgrade() {
        // 升級後重置使用量
        const usageManager = window.usageManager;
        if (usageManager && typeof usageManager.resetUsage === 'function') {
            usageManager.resetUsage();
        }
    }
    
    // 配置管理
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('支付配置已更新');
    }
    
    getConfig() {
        return this.config;
    }
    
    // 測試方法
    
    async testPayment(paymentMethod) {
        console.log(`測試${paymentMethod}支付功能`);
        
        const testOrder = {
            userId: 'test_user',
            amount: 0.01, // 測試金額1分錢
            paymentMethod: paymentMethod,
            planType: 'test'
        };
        
        const result = await this.createPaymentOrder(testOrder);
        console.log('測試結果:', result);
        
        return result;
    }
}

// 導出支付服務
window.PaymentService = PaymentService; 