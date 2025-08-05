# 短信驗證碼服務配置說明

## 概述

本項目已集成真實的短信驗證碼服務，支持多個電信運營商。用戶可以實際接收到短信驗證碼進行登錄。

## 支持的運營商

### 1. 阿里雲短信服務
- **服務商**：阿里雲
- **適用場景**：國內短信發送
- **優勢**：穩定性高，到達率高

### 2. 騰訊雲短信服務
- **服務商**：騰訊雲
- **適用場景**：國內短信發送
- **優勢**：與微信生態集成好

### 3. 華為雲短信服務
- **服務商**：華為雲
- **適用場景**：國內外短信發送
- **優勢**：國際化支持好

## 配置步驟

### 1. 阿里雲短信服務配置

#### 1.1 註冊阿里雲賬戶
1. 訪問 [阿里雲官網](https://www.aliyun.com/)
2. 註冊並實名認證賬戶
3. 開通短信服務

#### 1.2 獲取配置信息
1. 登錄阿里雲控制台
2. 進入短信服務控制台
3. 獲取以下信息：
   - AccessKey ID
   - AccessKey Secret
   - 簽名名稱
   - 模板代碼

#### 1.3 修改配置文件
在 `js/smsService.js` 中修改配置：

```javascript
aliyun: {
    accessKeyId: 'your_access_key_id',        // 替換為您的AccessKey ID
    accessKeySecret: 'your_access_key_secret', // 替換為您的AccessKey Secret
    signName: 'AI圖片助手',                    // 替換為您的簽名名稱
    templateCode: 'SMS_123456789',            // 替換為您的模板代碼
    endpoint: 'https://dysmsapi.aliyuncs.com'
}
```

### 2. 騰訊雲短信服務配置

#### 2.1 註冊騰訊雲賬戶
1. 訪問 [騰訊雲官網](https://cloud.tencent.com/)
2. 註冊並實名認證賬戶
3. 開通短信服務

#### 2.2 獲取配置信息
1. 登錄騰訊雲控制台
2. 進入短信服務控制台
3. 獲取以下信息：
   - SecretId
   - SecretKey
   - SDK AppId
   - 簽名名稱
   - 模板ID

#### 2.3 修改配置文件
在 `js/smsService.js` 中修改配置：

```javascript
tencent: {
    secretId: 'your_secret_id',           // 替換為您的SecretId
    secretKey: 'your_secret_key',         // 替換為您的SecretKey
    sdkAppId: 'your_sdk_app_id',          // 替換為您的SDK AppId
    signName: 'AI圖片助手',                // 替換為您的簽名名稱
    templateId: '1234567',                // 替換為您的模板ID
    endpoint: 'https://sms.tencentcloudapi.com'
}
```

### 3. 華為雲短信服務配置

#### 3.1 註冊華為雲賬戶
1. 訪問 [華為雲官網](https://www.huaweicloud.com/)
2. 註冊並實名認證賬戶
3. 開通短信服務

#### 3.2 獲取配置信息
1. 登錄華為雲控制台
2. 進入短信服務控制台
3. 獲取以下信息：
   - AppKey
   - AppSecret
   - 發送方號碼
   - 模板ID

#### 3.3 修改配置文件
在 `js/smsService.js` 中修改配置：

```javascript
huawei: {
    appKey: 'your_app_key',               // 替換為您的AppKey
    appSecret: 'your_app_secret',         // 替換為您的AppSecret
    sender: 'your_sender',                // 替換為您的發送方號碼
    templateId: 'your_template_id',       // 替換為您的模板ID
    endpoint: 'https://rtcpns.cn-north-1.myhuaweicloud.com'
}
```

## 短信模板配置

### 模板內容示例
```
驗證碼：${code}，您正在登錄AI圖片助手，5分鐘內有效。請勿泄露給他人。
```

### 模板參數
- `${code}`：6位數字驗證碼
- 模板長度：建議不超過70個字符
- 簽名：必須包含在模板中

## 切換運營商

### 方法1：修改代碼
在 `js/smsService.js` 中修改：

```javascript
this.currentProvider = 'aliyun'; // 改為 'tencent' 或 'huawei'
```

### 方法2：動態切換
在瀏覽器控制台執行：

```javascript
// 切換到騰訊雲
window.smsService.switchProvider('tencent');

// 切換到華為雲
window.smsService.switchProvider('huawei');
```

## 安全配置

### 1. 防刷機制
- **每日限制**：每個手機號每日最多發送10次
- **每小時限制**：每個手機號每小時最多發送3次
- **冷卻時間**：發送後60秒內不能再次發送
- **黑名單機制**：違規賬戶會被限制1小時

### 2. 驗證碼安全
- **有效期**：5分鐘
- **重試次數**：最多3次錯誤
- **自動清理**：過期驗證碼自動清除

### 3. 配置安全
- **AccessKey**：請妥善保管，不要提交到代碼倉庫
- **環境變量**：建議使用環境變量存儲敏感信息
- **HTTPS**：生產環境必須使用HTTPS

## 測試配置

### 1. 開發環境測試
```javascript
// 在瀏覽器控制台測試
const smsService = new SMSService();
await smsService.init();

// 發送測試短信
const result = await smsService.sendVerificationCode('13800138000', 'test');
console.log(result);
```

### 2. 驗證碼測試
```javascript
// 驗證測試驗證碼
const verifyResult = await smsService.verifyCode('13800138000', '123456', 'test');
console.log(verifyResult);
```

## 常見問題

### 1. 配置錯誤
**問題**：提示"運營商配置不完整"
**解決**：檢查配置文件中的參數是否正確填寫

### 2. 發送失敗
**問題**：短信發送失敗
**解決**：
- 檢查賬戶餘額
- 檢查簽名和模板是否審核通過
- 檢查手機號格式是否正確

### 3. 驗證碼無效
**問題**：驗證碼驗證失敗
**解決**：
- 檢查驗證碼是否過期
- 檢查重試次數是否超限
- 確認手機號是否一致

### 4. 防刷限制
**問題**：提示發送過於頻繁
**解決**：
- 等待冷卻時間結束
- 檢查是否達到每日/每小時限制
- 聯繫管理員重置限制

## 費用說明

### 阿里雲短信費用
- **國內短信**：0.045元/條
- **國際短信**：0.5-1.5元/條
- **免費額度**：新用戶有免費測試額度

### 騰訊雲短信費用
- **國內短信**：0.045元/條
- **國際短信**：0.5-1.5元/條
- **免費額度**：新用戶有免費測試額度

### 華為雲短信費用
- **國內短信**：0.045元/條
- **國際短信**：0.5-1.5元/條
- **免費額度**：新用戶有免費測試額度

## 聯繫支持

如果在配置過程中遇到問題，請聯繫：
- **技術支持**：通過應用內客服系統
- **運營商支持**：各運營商官方客服
- **項目維護**：AI進化論-花生

---

**注意**：請確保在生產環境中正確配置短信服務，並遵守相關法律法規。 