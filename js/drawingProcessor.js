/**
 * 涂鸦标注处理器
 * 实现画笔、橡皮擦、形状绘制等功能
 */

class DrawingProcessor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.brushColor = '#ff0000';
        this.brushSize = 5;
        this.brushStyle = 'solid'; // 新增：画笔样式
        this.drawingHistory = [];
        this.historyIndex = -1;
        this.gradientColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']; // 新增：渐变色
        this.emojiList = ['😀', '😍', '👍', '🎉', '💯', '🔥', '⭐', '💖', '🎯', '🏆']; // 新增：表情符号
        
        // 绑定事件处理函数，确保可以正确移除
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);
        this.boundHandleTouchStart = this.handleTouchStart.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        
        this.initCanvas();
        this.initEventListeners();
        
        console.log('DrawingProcessor 初始化成功');
    }

    // 初始化画布
    initCanvas() {
        // 设置画布样式
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.border = '1px solid #ccc';
        
        // 设置绘制上下文
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        
        console.log('Canvas初始化完成:', {
            width: this.canvas.width,
            height: this.canvas.height,
            style: {
                cursor: this.canvas.style.cursor,
                border: this.canvas.style.border
            }
        });
    }

    // 重新设置Canvas（新增方法）
    resetCanvas(newCanvas) {
        try {
            // 保存旧的Canvas引用
            const oldCanvas = this.canvas;
            
            // 先移除旧Canvas的事件监听器
            if (oldCanvas) {
                this.removeEventListeners();
            }
            
            // 更新Canvas引用
            this.canvas = newCanvas;
            this.ctx = newCanvas.getContext('2d');
            
            // 重新初始化画布
            this.initCanvas();
            
            // 重新初始化事件监听器
            this.initEventListeners();
            
            console.log('Canvas重新設置成功:', {
                oldSize: oldCanvas ? `${oldCanvas.width}x${oldCanvas.height}` : 'N/A',
                newSize: `${this.canvas.width}x${this.canvas.height}`,
                newPosition: `(${this.canvas.style.left}, ${this.canvas.style.top})`
            });
            
        } catch (error) {
            console.error('Canvas重新設置失敗:', error);
            throw error;
        }
    }

    // 初始化事件监听器
    initEventListeners() {
        // 先移除旧的事件监听器（如果存在）
        this.removeEventListeners();
        
        // 鼠标事件
        this.canvas.addEventListener('mousedown', this.boundHandleMouseDown);
        this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
        this.canvas.addEventListener('mouseup', this.boundHandleMouseUp);
        this.canvas.addEventListener('mouseleave', this.boundHandleMouseLeave);
        
        // 触控事件（移动端支持）
        this.canvas.addEventListener('touchstart', this.boundHandleTouchStart);
        this.canvas.addEventListener('touchmove', this.boundHandleTouchMove);
        this.canvas.addEventListener('touchend', this.boundHandleTouchEnd);
        
        console.log('DrawingProcessor 事件監聽器初始化完成');
    }

    // 移除事件监听器
    removeEventListeners() {
        try {
            if (this.canvas) {
                this.canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
                this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
                this.canvas.removeEventListener('mouseup', this.boundHandleMouseUp);
                this.canvas.removeEventListener('mouseleave', this.boundHandleMouseLeave);
                this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
                this.canvas.removeEventListener('touchmove', this.boundHandleTouchMove);
                this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);
            }
        } catch (error) {
            console.warn('移除事件监听器时出现错误:', error);
        }
    }

    // 处理鼠标按下事件
    handleMouseDown(e) {
        try {
            this.isDrawing = true;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 检查坐标是否在画布范围内
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.startDrawing(x, y);
            }
        } catch (error) {
            console.error('鼠标按下事件处理错误:', error);
        }
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        try {
            if (!this.isDrawing) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 检查坐标是否在画布范围内
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.continueDrawing(x, y);
            }
        } catch (error) {
            console.error('鼠标移动事件处理错误:', error);
        }
    }

    // 处理鼠标释放事件
    handleMouseUp(e) {
        try {
            this.isDrawing = false;
            this.endDrawing();
        } catch (error) {
            console.error('鼠标释放事件处理错误:', error);
        }
    }

    // 处理鼠标离开事件
    handleMouseLeave(e) {
        try {
            this.isDrawing = false;
            this.endDrawing();
        } catch (error) {
            console.error('鼠标离开事件处理错误:', error);
        }
    }

    // 处理触控开始事件
    handleTouchStart(e) {
        try {
            e.preventDefault();
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // 检查坐标是否在画布范围内
                if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                    this.isDrawing = true;
                    this.startDrawing(x, y);
                }
            }
        } catch (error) {
            console.error('触控开始事件处理错误:', error);
        }
    }

    // 处理触控移动事件
    handleTouchMove(e) {
        try {
            e.preventDefault();
            if (!this.isDrawing || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // 检查坐标是否在画布范围内
            if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
                this.continueDrawing(x, y);
            }
        } catch (error) {
            console.error('触控移动事件处理错误:', error);
        }
    }

    // 处理触控结束事件
    handleTouchEnd(e) {
        try {
            e.preventDefault();
            this.isDrawing = false;
            this.endDrawing();
        } catch (error) {
            console.error('触控结束事件处理错误:', error);
        }
    }

    // 开始绘制
    startDrawing(x, y) {
        try {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.lastX = x;
            this.lastY = y;
        } catch (error) {
            console.error('开始绘制错误:', error);
        }
    }

    // 继续绘制
    continueDrawing(x, y) {
        try {
            if (this.currentTool === 'brush') {
                this.applyBrushStyle(x, y);
            } else if (this.currentTool === 'eraser') {
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                this.ctx.restore();
            } else if (this.currentTool === 'spray') {
                this.drawSprayEffect(x, y);
            } else if (this.currentTool === 'neon') {
                this.drawNeonEffect(x, y);
            } else if (this.currentTool === 'sparkle') {
                this.drawSparkleEffect(x, y);
            }
            
            this.lastX = x;
            this.lastY = y;
        } catch (error) {
            console.error('继续绘制错误:', error);
        }
    }

    // 结束绘制
    endDrawing() {
        try {
            this.ctx.closePath();
            this.saveToHistory();
            
            // 通知UIController保存绘制结果
            if (this.onDrawingComplete) {
                this.onDrawingComplete(this.getCanvasData());
            }
        } catch (error) {
            console.error('结束绘制错误:', error);
        }
    }

    // 应用画笔样式
    applyBrushStyle(x, y) {
        // 如果有选择的渐变色，优先使用渐变色
        if (this.currentGradient) {
            this.applyGradient(x, y);
            return;
        }
        
        switch (this.brushStyle) {
            case 'solid':
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
            case 'gradient':
                this.drawGradientLine(x, y);
                break;
            case 'rainbow':
                this.drawRainbowLine(x, y);
                break;
            case 'glow':
                this.drawGlowLine(x, y);
                break;
            case 'dotted':
                this.drawDottedLine(x, y);
                break;
            case 'dashed':
                this.drawDashedLine(x, y);
                break;
            default:
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
        }
    }

    // 设置绘制工具
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
        
        console.log('绘制工具已切换为:', tool);
    }

    // 设置画笔颜色
    setColor(color) {
        this.brushColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        console.log('画笔颜色已设置为:', color);
    }

    // 设置渐变色
    setGradient(gradientType) {
        this.currentGradient = gradientType;
        console.log('渐变色已设置为:', gradientType);
    }

    // 获取渐变色
    getGradient(gradientType) {
        const gradients = {
            'sunset': ['#ff6b6b', '#feca57'],
            'ocean': ['#4ecdc4', '#45b7d1'],
            'forest': ['#96ceb4', '#06ffa5'],
            'sunrise': ['#ff9ff3', '#ff6b35'],
            'aurora': ['#a855f7', '#00d4ff'],
            'rainbow': ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff']
        };
        
        return gradients[gradientType] || ['#ff0000', '#00ff00'];
    }

    // 应用渐变色到绘制
    applyGradient(x, y) {
        if (!this.currentGradient) return;
        
        const colors = this.getGradient(this.currentGradient);
        const gradient = this.ctx.createLinearGradient(this.lastX, this.lastY, x, y);
        
        if (colors.length === 2) {
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
        } else {
            // 彩虹渐变
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
        }
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.strokeStyle = this.brushColor;
    }

    // 设置画笔大小
    setBrushSize(size) {
        this.brushSize = size;
        this.ctx.lineWidth = size;
        console.log('画笔大小已设置为:', size);
    }

    // 设置画笔样式
    setBrushStyle(style) {
        this.brushStyle = style;
        console.log('画笔样式已设置为:', style);
    }

    // 繪製漸變線條
    drawGradientLine(x, y) {
        const gradient = this.ctx.createLinearGradient(this.lastX, this.lastY, x, y);
        gradient.addColorStop(0, this.brushColor);
        gradient.addColorStop(1, this.getRandomGradientColor());
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.strokeStyle = this.brushColor;
    }

    // 繪製彩虹線條
    drawRainbowLine(x, y) {
        const distance = Math.sqrt((x - this.lastX) ** 2 + (y - this.lastY) ** 2);
        const steps = Math.max(1, Math.floor(distance / 5));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const currentX = this.lastX + (x - this.lastX) * t;
            const currentY = this.lastY + (y - this.lastY) * t;
            
            const hue = (Date.now() / 10 + i * 20) % 360;
            this.ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = this.brushColor;
    }

    // 繪製發光線條
    drawGlowLine(x, y) {
        // 外層發光
        this.ctx.save();
        this.ctx.shadowColor = this.brushColor;
        this.ctx.shadowBlur = 15;
        this.ctx.lineWidth = this.brushSize + 2;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.restore();
        
        // 內層實線
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    // 繪製虛線
    drawDottedLine(x, y) {
        const distance = Math.sqrt((x - this.lastX) ** 2 + (y - this.lastY) ** 2);
        const steps = Math.max(1, Math.floor(distance / 10));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const currentX = this.lastX + (x - this.lastX) * t;
            const currentY = this.lastY + (y - this.lastY) * t;
            
            if (i % 2 === 0) {
                this.ctx.beginPath();
                this.ctx.arc(currentX, currentY, this.brushSize / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    // 繪製虛線
    drawDashedLine(x, y) {
        const distance = Math.sqrt((x - this.lastX) ** 2 + (y - this.lastY) ** 2);
        const steps = Math.max(1, Math.floor(distance / 15));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const currentX = this.lastX + (x - this.lastX) * t;
            const currentY = this.lastY + (y - this.lastY) * t;
            
            if (i % 3 !== 0) {
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
            } else {
                this.ctx.moveTo(currentX, currentY);
            }
        }
    }

    // 噴漆效果
    drawSprayEffect(x, y) {
        const particles = 20;
        for (let i = 0; i < particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.brushSize * 2;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            this.ctx.save();
            this.ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            this.ctx.fillStyle = this.brushColor;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, Math.random() * 2 + 1, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    // 霓虹效果
    drawNeonEffect(x, y) {
        // 外層發光
        this.ctx.save();
        this.ctx.shadowColor = this.brushColor;
        this.ctx.shadowBlur = 20;
        this.ctx.lineWidth = this.brushSize + 4;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.restore();
        
        // 中層發光
        this.ctx.save();
        this.ctx.shadowColor = this.brushColor;
        this.ctx.shadowBlur = 10;
        this.ctx.lineWidth = this.brushSize + 2;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.restore();
        
        // 內層實線
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    // 閃爍效果
    drawSparkleEffect(x, y) {
        const sparkles = 5;
        for (let i = 0; i < sparkles; i++) {
            const angle = (i / sparkles) * Math.PI * 2;
            const distance = this.brushSize * 2;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;
            
            this.drawSparkle(sparkleX, sparkleY);
        }
    }

    // 繪製單個閃爍
    drawSparkle(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = this.getRandomGradientColor();
        this.ctx.lineWidth = 2;
        
        // 十字閃爍
        this.ctx.beginPath();
        this.ctx.moveTo(x - 8, y);
        this.ctx.lineTo(x + 8, y);
        this.ctx.moveTo(x, y - 8);
        this.ctx.lineTo(x, y + 8);
        this.ctx.stroke();
        
        // 對角線閃爍
        this.ctx.beginPath();
        this.ctx.moveTo(x - 6, y - 6);
        this.ctx.lineTo(x + 6, y + 6);
        this.ctx.moveTo(x - 6, y + 6);
        this.ctx.lineTo(x + 6, y - 6);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    // 獲取隨機漸變色彩
    getRandomGradientColor() {
        return this.gradientColors[Math.floor(Math.random() * this.gradientColors.length)];
    }

    // 绘制直线
    drawLine(startX, startY, endX, endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.saveToHistory();
    }

    // 绘制矩形
    drawRectangle(x, y, width, height, fill = false) {
        if (fill) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
        this.saveToHistory();
    }

    // 绘制圆形
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

    // 绘制箭头
    drawArrow(startX, startY, endX, endY) {
        const headLength = 15;
        const angle = Math.atan2(endY - startY, endX - startX);
        
        // 绘制箭头主体
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // 绘制箭头头部
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

    // 绘制霓虹箭头
    drawNeonArrow(startX, startY, endX, endY) {
        const headLength = 15;
        const angle = Math.atan2(endY - startY, endX - startX);
        
        // 外层发光
        this.ctx.save();
        this.ctx.shadowColor = this.brushColor;
        this.ctx.shadowBlur = 15;
        this.ctx.lineWidth = this.brushSize + 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), 
                        endY - headLength * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), 
                        endY - headLength * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
        this.ctx.restore();
        
        // 内层实线
        this.ctx.lineWidth = this.brushSize;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
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

    // 绘制爱心
    drawHeart(x, y, size = 20) {
        this.ctx.save();
        this.ctx.fillStyle = this.brushColor;
        this.ctx.beginPath();
        
        const topCurveHeight = size * 0.3;
        this.ctx.moveTo(x, y + topCurveHeight);
        
        // 左边曲线
        this.ctx.bezierCurveTo(
            x, y, 
            x - size, y, 
            x - size, y + size
        );
        
        // 底部曲线
        this.ctx.bezierCurveTo(
            x - size, y + size * 1.3, 
            x, y + size * 1.3, 
            x, y + size
        );
        
        // 右边曲线
        this.ctx.bezierCurveTo(
            x, y + size * 1.3, 
            x + size, y + size * 1.3, 
            x + size, y + size
        );
        
        // 顶部曲线
        this.ctx.bezierCurveTo(
            x + size, y, 
            x, y, 
            x, y + topCurveHeight
        );
        
        this.ctx.fill();
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制星星
    drawStar(x, y, size = 20) {
        this.ctx.save();
        this.ctx.fillStyle = this.brushColor;
        this.ctx.beginPath();
        
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x1 = x + size * Math.cos(angle);
            const y1 = y + size * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x1, y1);
            } else {
                this.ctx.lineTo(x1, y1);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const x2 = x + size * 0.5 * Math.cos(innerAngle);
            const y2 = y + size * 0.5 * Math.sin(innerAngle);
            this.ctx.lineTo(x2, y2);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制爆炸效果
    drawExplosion(x, y, size = 30) {
        this.ctx.save();
        
        // 中心圆
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 爆炸线条
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const endX = x + Math.cos(angle) * size;
            const endY = y + Math.sin(angle) * size;
            
            this.ctx.strokeStyle = this.getRandomGradientColor();
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制表情符号
    drawEmoji(x, y, emoji = null) {
        const selectedEmoji = emoji || this.emojiList[Math.floor(Math.random() * this.emojiList.length)];
        
        this.ctx.save();
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(selectedEmoji, x, y);
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制对话框
    drawSpeechBubble(x, y, text = 'Wow!', width = 100, height = 60) {
        this.ctx.save();
        
        // 对话框背景
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = 2;
        
        // 圆角矩形
        this.ctx.beginPath();
        this.ctx.roundRect(x - width/2, y - height/2, width, height, 10);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 小尾巴
        this.ctx.beginPath();
        this.ctx.moveTo(x - width/2 + 20, y + height/2);
        this.ctx.lineTo(x - width/2 + 10, y + height/2 + 10);
        this.ctx.lineTo(x - width/2 + 30, y + height/2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 文字
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制进度条
    drawProgressBar(x, y, progress = 0.7, width = 100, height = 20) {
        this.ctx.save();
        
        // 背景
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(x - width/2, y - height/2, width, height);
        
        // 进度
        this.ctx.fillStyle = this.brushColor;
        this.ctx.fillRect(x - width/2, y - height/2, width * progress, height);
        
        // 边框
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        // 百分比文字
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${Math.round(progress * 100)}%`, x, y);
        
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制高亮区域
    drawHighlight(x, y, width, height) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
        this.saveToHistory();
    }

    // 绘制印章
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

    // 保存到历史记录
    saveToHistory() {
        // 移除当前位置之后的历史记录
        this.drawingHistory = this.drawingHistory.slice(0, this.historyIndex + 1);
        
        // 添加新的状态
        this.drawingHistory.push(this.canvas.toDataURL());
        this.historyIndex++;
        
        // 限制历史记录数量
        if (this.drawingHistory.length > 50) {
            this.drawingHistory.shift();
            this.historyIndex--;
        }
    }

    // 撤销
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

    // 从历史记录加载
    loadFromHistory() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.drawingHistory[this.historyIndex];
    }

    // 清空画布
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveToHistory();
    }

    // 获取画布数据
    getCanvasData() {
        return this.canvas.toDataURL();
    }

    // 获取当前工具
    getTool() {
        return this.currentTool;
    }

    // 获取历史记录
    getHistory() {
        return [...this.drawingHistory];
    }

    // 获取历史记录索引
    getHistoryIndex() {
        return this.historyIndex;
    }

    // 设置历史记录
    setHistory(history) {
        if (Array.isArray(history)) {
            this.drawingHistory = [...history];
        }
    }

    // 设置历史记录索引
    setHistoryIndex(index) {
        if (typeof index === 'number' && index >= -1 && index < this.drawingHistory.length) {
            this.historyIndex = index;
        }
    }

    // 销毁处理器
    destroy() {
        // 移除事件监听器
        this.removeEventListeners();
        
        // 清空数据
        this.drawingHistory = [];
        this.historyIndex = -1;
    }
}

// 导出涂鸦标注处理器
window.DrawingProcessor = DrawingProcessor; 