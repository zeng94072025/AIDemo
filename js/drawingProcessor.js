/**
 * 塗鴉標註處理器
 * 實現畫筆、橡皮擦、形狀繪製等功能
 */

class DrawingProcessor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.brushColor = '#ff0000';
        this.brushSize = 5;
        this.drawingHistory = [];
        this.historyIndex = -1;
        
        this.initCanvas();
        this.initEventListeners();
        
        console.log('DrawingProcessor 初始化成功');
    }

    // 初始化畫布
    initCanvas() {
        // 設置畫布樣式
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.border = '1px solid #ccc';
        
        // 設置繪製上下文
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
    }

    // 初始化事件監聽器
    initEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // 觸控事件（移動端支持）
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    // 處理滑鼠按下事件
    handleMouseDown(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.startDrawing(x, y);
    }

    // 處理滑鼠移動事件
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.continueDrawing(x, y);
    }

    // 處理滑鼠釋放事件
    handleMouseUp(e) {
        this.isDrawing = false;
        this.endDrawing();
    }

    // 處理滑鼠離開事件
    handleMouseLeave(e) {
        this.isDrawing = false;
        this.endDrawing();
    }

    // 處理觸控開始事件
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.isDrawing = true;
            this.startDrawing(x, y);
        }
    }

    // 處理觸控移動事件
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.continueDrawing(x, y);
    }

    // 處理觸控結束事件
    handleTouchEnd(e) {
        e.preventDefault();
        this.isDrawing = false;
        this.endDrawing();
    }

    // 開始繪製
    startDrawing(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.lastX = x;
        this.lastY = y;
    }

    // 繼續繪製
    continueDrawing(x, y) {
        if (this.currentTool === 'brush') {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.restore();
        }
        
        this.lastX = x;
        this.lastY = y;
    }

    // 結束繪製
    endDrawing() {
        this.ctx.closePath();
        this.saveToHistory();
    }

    // 設置繪製工具
    setTool(tool) {
        this.currentTool = tool;
        
        switch (tool) {
            case 'brush':
                this.canvas.style.cursor = 'crosshair';
                this.ctx.globalCompositeOperation = 'source-over';
                break;
            case 'eraser':
                this.canvas.style.cursor = 'crosshair';
                this.ctx.globalCompositeOperation = 'destination-out';
                break;
            case 'line':
                this.canvas.style.cursor = 'crosshair';
                this.ctx.globalCompositeOperation = 'source-over';
                break;
            case 'rectangle':
                this.canvas.style.cursor = 'crosshair';
                this.ctx.globalCompositeOperation = 'source-over';
                break;
            case 'circle':
                this.canvas.style.cursor = 'crosshair';
                this.ctx.globalCompositeOperation = 'source-over';
                break;
            case 'text':
                this.canvas.style.cursor = 'text';
                this.ctx.globalCompositeOperation = 'source-over';
                break;
        }
        
        console.log('繪製工具已切換為:', tool);
    }

    // 設置畫筆顏色
    setColor(color) {
        this.brushColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        console.log('畫筆顏色已設置為:', color);
    }

    // 設置畫筆大小
    setBrushSize(size) {
        this.brushSize = size;
        this.ctx.lineWidth = size;
        console.log('畫筆大小已設置為:', size);
    }

    // 繪製直線
    drawLine(startX, startY, endX, endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.saveToHistory();
    }

    // 繪製矩形
    drawRectangle(x, y, width, height, fill = false) {
        if (fill) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
        this.saveToHistory();
    }

    // 繪製圓形
    drawCircle(x, y, radius, fill = false) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        this.saveToHistory();
    }

    // 添加文字
    addText(text, x, y, fontSize = 16) {
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillText(text, x, y);
        this.saveToHistory();
    }

    // 繪製箭頭
    drawArrow(startX, startY, endX, endY) {
        const headLength = 15;
        const angle = Math.atan2(endY - startY, endX - startX);
        
        // 繪製箭頭主體
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // 繪製箭頭頭部
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), 
                        endY - headLength * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), 
                        endY - headLength * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        
        this.saveToHistory();
    }

    // 繪製高亮區域
    drawHighlight(x, y, width, height) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
        this.saveToHistory();
    }

    // 繪製印章
    drawStamp(x, y, text = '✓') {
        this.ctx.save();
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
        this.saveToHistory();
    }

    // 保存到歷史記錄
    saveToHistory() {
        // 移除當前位置之後的歷史記錄
        this.drawingHistory = this.drawingHistory.slice(0, this.historyIndex + 1);
        
        // 添加新的狀態
        this.drawingHistory.push(this.canvas.toDataURL());
        this.historyIndex++;
        
        // 限制歷史記錄數量
        if (this.drawingHistory.length > 50) {
            this.drawingHistory.shift();
            this.historyIndex--;
        }
    }

    // 撤銷
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadFromHistory();
            return true;
        }
        return false;
    }

    // 重做
    redo() {
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.historyIndex++;
            this.loadFromHistory();
            return true;
        }
        return false;
    }

    // 從歷史記錄加載
    loadFromHistory() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.drawingHistory[this.historyIndex];
    }

    // 清空畫布
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveToHistory();
    }

    // 獲取畫布數據
    getCanvasData() {
        return this.canvas.toDataURL();
    }

    // 銷毀處理器
    destroy() {
        // 移除事件監聽器
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        // 清空數據
        this.drawingHistory = [];
        this.historyIndex = -1;
    }
}

// 導出塗鴉標註處理器
window.DrawingProcessor = DrawingProcessor; 