/**
 * 語音控制模組
 * 負責語音識別和語音合成功能
 */

class VoiceControl {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        this.onCommandCallback = null;
        
        this.initSpeechRecognition();
    }

    // 檢查瀏覽器支持
    checkSupport() {
        const recognitionSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const synthesisSupport = 'speechSynthesis' in window;
        
        if (!recognitionSupport) {
            console.warn('語音識別不被支持');
        }
        if (!synthesisSupport) {
            console.warn('語音合成不被支持');
        }
        
        return recognitionSupport && synthesisSupport;
    }

    // 初始化語音識別
    initSpeechRecognition() {
        if (!this.isSupported) return;

        // 創建語音識別實例
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // 配置語音識別
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'zh-TW';
        this.recognition.maxAlternatives = 1;

        // 語音識別開始
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
            Utils.showNotification('開始語音識別', 'info');
        };

        // 語音識別結果
        this.recognition.onresult = (event) => {
            const result = event.results[0];
            const transcript = result[0].transcript;
            
            console.log('語音識別結果:', transcript);
            
            // 處理語音指令
            this.processVoiceCommand(transcript);
        };

        // 語音識別結束
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
            Utils.showNotification('語音識別結束', 'info');
        };

        // 語音識別錯誤
        this.recognition.onerror = (event) => {
            this.isListening = false;
            this.updateUI();
            
            let errorMessage = '語音識別錯誤';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = '沒有檢測到語音';
                    break;
                case 'audio-capture':
                    errorMessage = '無法捕獲音頻';
                    break;
                case 'not-allowed':
                    errorMessage = '麥克風權限被拒絕';
                    break;
                case 'network':
                    errorMessage = '網絡錯誤';
                    break;
                case 'service-not-allowed':
                    errorMessage = '服務不被允許';
                    break;
            }
            
            Utils.showNotification(errorMessage, 'error');
        };
    }

    // 開始語音識別
    startListening() {
        if (!this.isSupported) {
            Utils.showNotification('您的瀏覽器不支持語音功能', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('啟動語音識別失敗:', error);
            Utils.showNotification('啟動語音識別失敗', 'error');
        }
    }

    // 停止語音識別
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // 更新UI狀態
    updateUI() {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceStatus = document.getElementById('voiceStatus');
        
        if (voiceBtn) {
            if (this.isListening) {
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            } else {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }
        
        if (voiceStatus) {
            voiceStatus.textContent = this.isListening ? '正在聆聽...' : '點擊開始語音輸入';
        }
    }

    // 處理語音指令
    processVoiceCommand(transcript) {
        // 解析語音指令
        const actions = Utils.parseVoiceCommand(transcript);
        
        if (actions.length === 0) {
            Utils.showNotification('無法識別指令，請重試', 'warning');
            return;
        }

        // 語音反饋
        this.speak(`正在執行${actions.length}個操作`);
        
        // 執行指令
        if (this.onCommandCallback) {
            this.onCommandCallback(actions, transcript);
        }
    }

    // 語音合成
    speak(text, options = {}) {
        if (!this.synthesis) return;

        // 停止當前語音
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // 設置語音參數
        utterance.lang = 'zh-TW';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.8;

        // 語音開始
        utterance.onstart = () => {
            console.log('開始語音合成:', text);
        };

        // 語音結束
        utterance.onend = () => {
            console.log('語音合成結束');
        };

        // 語音錯誤
        utterance.onerror = (event) => {
            console.error('語音合成錯誤:', event.error);
        };

        // 播放語音
        this.synthesis.speak(utterance);
    }

    // 設置指令回調
    setCommandCallback(callback) {
        this.onCommandCallback = callback;
    }

    // 語音提示
    speakHint() {
        const hints = [
            '您可以說：將圖片亮度提高20%',
            '您可以說：添加黑白濾鏡',
            '您可以說：裁剪為16比9比例',
            '您可以說：轉換為PNG格式',
            '您可以說：添加水印文字',
            '您可以說：自動優化圖片',
            '您可以說：去除反光',
            '您可以說：提亮圖片'
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        this.speak(randomHint);
    }

    // 語音確認
    speakConfirmation(action) {
        const confirmations = {
            'auto-optimize': '正在進行智能優化',
            'remove-reflection': '正在去除反光',
            'brighten': '正在提亮圖片',
            'mosaic': '正在應用馬賽克效果',
            'remove-shadow': '正在去除陰影',
            'crop': '正在裁剪圖片',
            'format': '正在轉換格式',
            'watermark': '正在添加水印',
            'filter': '正在應用濾鏡',
            'brightness': '正在調整亮度',
            'contrast': '正在調整對比度',
            'saturation': '正在調整飽和度'
        };
        
        const message = confirmations[action] || '正在處理圖片';
        this.speak(message);
    }

    // 語音完成
    speakCompletion(action) {
        const completions = {
            'auto-optimize': '智能優化完成',
            'remove-reflection': '反光去除完成',
            'brighten': '圖片提亮完成',
            'mosaic': '馬賽克效果應用完成',
            'remove-shadow': '陰影去除完成',
            'crop': '圖片裁剪完成',
            'format': '格式轉換完成',
            'watermark': '水印添加完成',
            'filter': '濾鏡應用完成',
            'brightness': '亮度調整完成',
            'contrast': '對比度調整完成',
            'saturation': '飽和度調整完成'
        };
        
        const message = completions[action] || '處理完成';
        this.speak(message);
    }

    // 語音錯誤
    speakError(error) {
        const errorMessages = {
            'no-image': '請先上傳圖片',
            'processing': '圖片正在處理中，請稍候',
            'unsupported': '不支持此操作',
            'failed': '操作失敗，請重試'
        };
        
        const message = errorMessages[error] || '發生錯誤，請重試';
        this.speak(message);
    }

    // 獲取可用的語音
    getAvailableVoices() {
        return new Promise((resolve) => {
            let voices = this.synthesis.getVoices();
            
            if (voices.length > 0) {
                resolve(voices);
            } else {
                this.synthesis.onvoiceschanged = () => {
                    voices = this.synthesis.getVoices();
                    resolve(voices);
                };
            }
        });
    }

    // 設置語音
    setVoice(voice) {
        this.currentVoice = voice;
    }

    // 設置語音參數
    setVoiceParams(params) {
        this.voiceParams = { ...this.voiceParams, ...params };
    }

    // 停止語音
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // 暫停語音
    pauseSpeaking() {
        if (this.synthesis) {
            this.synthesis.pause();
        }
    }

    // 恢復語音
    resumeSpeaking() {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }

    // 檢查麥克風權限
    async checkMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('麥克風權限檢查失敗:', error);
            return false;
        }
    }

    // 請求麥克風權限
    async requestMicrophonePermission() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            Utils.showNotification('麥克風權限已獲得', 'success');
            return true;
        } catch (error) {
            console.error('麥克風權限請求失敗:', error);
            Utils.showNotification('請允許麥克風權限以使用語音功能', 'error');
            return false;
        }
    }

    // 語音指令示例
    getVoiceCommandExamples() {
        return [
            {
                category: '基礎調整',
                commands: [
                    '將圖片亮度提高20%',
                    '降低對比度10%',
                    '增加飽和度30%',
                    '調整銳度到50%'
                ]
            },
            {
                category: '濾鏡效果',
                commands: [
                    '添加黑白濾鏡',
                    '應用復古濾鏡',
                    '使用冷色調濾鏡',
                    '添加電影感濾鏡'
                ]
            },
            {
                category: '圖片處理',
                commands: [
                    '自動優化圖片',
                    '去除反光',
                    '提亮圖片',
                    '去除陰影'
                ]
            },
            {
                category: '裁剪和格式',
                commands: [
                    '裁剪為16比9比例',
                    '裁剪為正方形',
                    '轉換為PNG格式',
                    '轉換為WebP格式'
                ]
            },
            {
                category: '水印和標註',
                commands: [
                    '添加水印文字',
                    '在右下角添加水印',
                    '添加時間戳水印'
                ]
            }
        ];
    }

    // 語音訓練模式
    startTrainingMode() {
        this.speak('歡迎使用語音訓練模式，我會教您如何使用語音指令');
        
        const examples = this.getVoiceCommandExamples();
        let currentIndex = 0;
        
        const speakNextExample = () => {
            if (currentIndex < examples.length) {
                const category = examples[currentIndex];
                this.speak(`${category.category}的指令包括：`);
                
                setTimeout(() => {
                    category.commands.forEach((command, index) => {
                        setTimeout(() => {
                            this.speak(command);
                        }, (index + 1) * 2000);
                    });
                    
                    setTimeout(() => {
                        currentIndex++;
                        speakNextExample();
                    }, (category.commands.length + 1) * 2000);
                }, 1000);
            } else {
                this.speak('語音訓練完成，您可以開始使用語音指令了');
            }
        };
        
        speakNextExample();
    }

    // 語音幫助
    speakHelp() {
        const helpText = `
            語音指令使用說明：
            您可以通過語音來控制圖片處理，例如：
            說"將圖片亮度提高20%"來調整亮度，
            說"添加黑白濾鏡"來應用濾鏡效果，
            說"裁剪為16比9比例"來裁剪圖片，
            說"轉換為PNG格式"來轉換格式。
            更多指令請查看幫助文檔。
        `;
        
        this.speak(helpText);
    }

    // 銷毀實例
    destroy() {
        this.stopListening();
        this.stopSpeaking();
        
        if (this.recognition) {
            this.recognition.abort();
            this.recognition = null;
        }
        
        this.isListening = false;
        this.onCommandCallback = null;
    }
}

// 導出語音控制
window.VoiceControl = VoiceControl; 