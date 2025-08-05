# 支付配置指南

本文檔詳細說明如何配置微信支付和支付寶支付功能，實現真正的支付閉環。

## 概述

本項目已實現完整的微信支付和支付寶支付功能，包括：
- 微信掃碼支付
- 支付寶網頁支付
- 支付狀態實時查詢
- 支付回調處理
- 訂單管理
- 支付歷史記錄

## 微信支付配置

### 1. 申請微信支付商戶號

1. 訪問 [微信支付商戶平台](https://pay.weixin.qq.com/)
2. 註冊商戶號並完成實名認證
3. 獲取以下信息：
   - 商戶號 (mchId)
   - API密鑰 (apiKey)
   - 公眾號AppID (appId)

### 2. 配置微信支付參數

在 `js/paymentService.js` 文件中更新微信支付配置：

```javascript
wechat: {
    appId: 'wx1234567890abcdef', // 替換為您的微信公眾號AppID
    mchId: '1234567890', // 替換為您的商戶號
    apiKey: 'your_wechat_api_key_here', // 替換為您的API密鑰
    certPath: '/path/to/wechat/cert.pem', // 證書路徑（可選）
    keyPath: '/path/to/wechat/key.pem', // 私鑰路徑（可選）
    notifyUrl: 'https://your-domain.com/api/wechat/notify', // 支付回調地址
    tradeType: 'NATIVE', // 支付類型：NATIVE(掃碼支付)
    sandbox: false // 生產環境設為false
}
```

### 3. 配置支付回調

創建支付回調處理接口 `/api/wechat/notify`：

```javascript
// 示例回調處理代碼
app.post('/api/wechat/notify', (req, res) => {
    const { return_code, result_code, out_trade_no, transaction_id } = req.body;
    
    if (return_code === 'SUCCESS' && result_code === 'SUCCESS') {
        // 支付成功，更新訂單狀態
        updateOrderStatus(out_trade_no, 'success');
        res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>');
    } else {
        res.send('<xml><return_code><![CDATA[FAIL]]></return_code></xml>');
    }
});
```

## 支付寶配置

### 1. 申請支付寶應用

1. 訪問 [支付寶開放平台](https://open.alipay.com/)
2. 創建應用並完成實名認證
3. 獲取以下信息：
   - 應用ID (appId)
   - 應用私鑰 (privateKey)
   - 支付寶公鑰 (publicKey)

### 2. 配置支付寶參數

在 `js/paymentService.js` 文件中更新支付寶配置：

```javascript
alipay: {
    appId: '2021000000000000', // 替換為您的支付寶應用ID
    privateKey: 'your_alipay_private_key_here', // 替換為您的應用私鑰
    publicKey: 'alipay_public_key_here', // 替換為支付寶公鑰
    gateway: 'https://openapi.alipay.com/gateway.do', // 支付寶網關
    notifyUrl: 'https://your-domain.com/api/alipay/notify', // 異步通知地址
    returnUrl: 'https://your-domain.com/payment/result', // 同步返回地址
    charset: 'utf-8',
    format: 'json',
    version: '1.0',
    signType: 'RSA2',
    sandbox: false // 生產環境設為false
}
```

### 3. 配置支付回調

創建支付回調處理接口 `/api/alipay/notify`：

```javascript
// 示例回調處理代碼
app.post('/api/alipay/notify', (req, res) => {
    const { trade_status, out_trade_no, trade_no } = req.body;
    
    if (trade_status === 'TRADE_SUCCESS') {
        // 支付成功，更新訂單狀態
        updateOrderStatus(out_trade_no, 'success');
        res.send('success');
    } else {
        res.send('fail');
    }
});
```

## 安全配置

### 1. 簽名驗證

確保所有支付請求都經過正確的簽名驗證：

```javascript
// 微信支付簽名驗證
function verifyWechatSignature(params, signature) {
    const sortedParams = Object.keys(params)
        .filter(key => key !== 'sign' && params[key] !== '')
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&') + `&key=${apiKey}`;
    
    const expectedSignature = md5(sortedParams).toUpperCase();
    return expectedSignature === signature;
}

// 支付寶簽名驗證
function verifyAlipaySignature(params, signature) {
    const sortedParams = Object.keys(params)
        .filter(key => key !== 'sign' && key !== 'sign_type' && params[key] !== '')
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    
    return rsa2Verify(sortedParams, signature, publicKey);
}
```

### 2. 防重複支付

實現防重複支付機制：

```javascript
function checkDuplicatePayment(orderId) {
    const order = getOrder(orderId);
    return order && order.status === 'success';
}
```

### 3. 金額驗證

確保支付金額與訂單金額一致：

```javascript
function verifyPaymentAmount(orderId, paidAmount) {
    const order = getOrder(orderId);
    return order && Math.abs(order.amount - paidAmount) < 0.01;
}
```

## 測試環境配置

### 1. 微信支付沙箱

```javascript
wechat: {
    // ... 其他配置
    sandbox: true, // 啟用沙箱環境
    appId: 'wx1234567890abcdef', // 沙箱AppID
    mchId: '1234567890', // 沙箱商戶號
    apiKey: 'sandbox_api_key' // 沙箱API密鑰
}
```

### 2. 支付寶沙箱

```javascript
alipay: {
    // ... 其他配置
    sandbox: true, // 啟用沙箱環境
    gateway: 'https://openapi.alipaydev.com/gateway.do', // 沙箱網關
    appId: '2021000000000000' // 沙箱應用ID
}
```

## 部署注意事項

### 1. HTTPS 要求

微信支付和支付寶都要求使用 HTTPS 協議，確保：
- 域名已配置 SSL 證書
- 回調地址使用 HTTPS
- 支付頁面使用 HTTPS

### 2. 域名備案

在中國大陸部署需要：
- 域名完成 ICP 備案
- 服務器在中國大陸境內
- 符合相關法規要求

### 3. 防火牆配置

確保服務器防火牆允許：
- 微信支付 API 訪問
- 支付寶 API 訪問
- 回調接口訪問

## 監控和日誌

### 1. 支付日誌

記錄所有支付相關操作：

```javascript
function logPaymentEvent(event, data) {
    console.log(`[${new Date().toISOString()}] ${event}:`, data);
    // 可以保存到數據庫或日誌文件
}
```

### 2. 異常監控

監控支付異常情況：

```javascript
function monitorPaymentErrors(error) {
    console.error('支付異常:', error);
    // 可以發送告警通知
}
```

## 常見問題

### 1. 簽名驗證失敗

- 檢查 API 密鑰是否正確
- 確認參數排序是否正確
- 驗證字符編碼是否為 UTF-8

### 2. 回調接收失敗

- 檢查回調地址是否可訪問
- 確認服務器防火牆設置
- 驗證回調處理邏輯

### 3. 支付狀態不同步

- 檢查狀態查詢邏輯
- 確認訂單狀態更新
- 驗證數據庫事務處理

## 聯繫支持

如果在配置過程中遇到問題，可以：

1. 查看微信支付官方文檔：https://pay.weixin.qq.com/wiki/doc/api/
2. 查看支付寶官方文檔：https://opendocs.alipay.com/
3. 聯繫技術支持團隊

## 更新日誌

- 2024-01-01: 初始版本，支持微信支付和支付寶支付
- 2024-01-02: 添加沙箱環境支持
- 2024-01-03: 完善安全配置和監控功能 