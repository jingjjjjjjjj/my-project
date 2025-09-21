// IoT Dashboard JavaScript

class IoTDashboard {
    constructor() {
        this.init();
        this.startDataSimulation();
        this.setupEventListeners();
        this.updateCurrentTime();
    }

    init() {
        console.log('IoT Dashboard 初始化中...');
        this.isSecurityArmed = false;
        this.sensorData = {
            temperature: 24.5,
            humidity: 65,
            power: 2.4
        };
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 亮度調節器
        const brightnessSlider = document.getElementById('brightness');
        const brightnessValue = document.getElementById('brightness-value');
        
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', (e) => {
                brightnessValue.textContent = e.target.value + '%';
                this.updateLightBrightness(e.target.value);
            });
        }

        // 燈光開關
        const lightSwitches = document.querySelectorAll('.toggle-switch');
        lightSwitches.forEach(switch_ => {
            switch_.addEventListener('change', (e) => {
                this.toggleLight(e.target.id, e.target.checked);
            });
        });

        // 安全系統按鈕
        const armButton = document.getElementById('arm-system');
        if (armButton) {
            armButton.addEventListener('click', () => {
                this.toggleSecuritySystem();
            });
        }

        // 窗口大小調整時重新繪製圖表
        window.addEventListener('resize', () => {
            this.drawEnergyChart();
        });
    }

    // 開始數據模擬
    startDataSimulation() {
        // 更新溫濕度數據（每5秒）
        setInterval(() => {
            this.updateTemperatureHumidity();
        }, 5000);

        // 更新能源數據（每10秒）
        setInterval(() => {
            this.updateEnergyData();
        }, 10000);

        // 更新時間（每秒）
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);

        // 初始化圖表
        setTimeout(() => {
            this.drawEnergyChart();
        }, 1000);
    }

    // 更新溫濕度數據
    updateTemperatureHumidity() {
        // 模擬溫度變化 (20-30°C)
        this.sensorData.temperature = 20 + Math.random() * 10;
        // 模擬濕度變化 (40-80%)
        this.sensorData.humidity = 40 + Math.random() * 40;

        const tempElement = document.getElementById('temperature');
        const humidityElement = document.getElementById('humidity');
        const progressElement = document.getElementById('temp-progress');

        if (tempElement) {
            tempElement.textContent = this.sensorData.temperature.toFixed(1);
            tempElement.classList.add('loading');
            setTimeout(() => tempElement.classList.remove('loading'), 500);
        }

        if (humidityElement) {
            humidityElement.textContent = Math.round(this.sensorData.humidity);
            humidityElement.classList.add('loading');
            setTimeout(() => humidityElement.classList.remove('loading'), 500);
        }

        if (progressElement) {
            const tempPercentage = ((this.sensorData.temperature - 20) / 10) * 100;
            progressElement.style.width = `${Math.min(Math.max(tempPercentage, 0), 100)}%`;
        }
    }

    // 更新能源數據
    updateEnergyData() {
        // 模擬功率變化 (1.5-3.5 kW)
        this.sensorData.power = 1.5 + Math.random() * 2;

        const powerElement = document.getElementById('power');
        const dailyUsageElement = document.getElementById('daily-usage');
        const monthlyUsageElement = document.getElementById('monthly-usage');

        if (powerElement) {
            powerElement.textContent = this.sensorData.power.toFixed(1) + ' kW';
        }

        if (dailyUsageElement) {
            const dailyUsage = 15 + Math.random() * 5;
            dailyUsageElement.textContent = dailyUsage.toFixed(1) + ' kWh';
        }

        if (monthlyUsageElement) {
            const monthlyUsage = 450 + Math.random() * 50;
            monthlyUsageElement.textContent = Math.round(monthlyUsage) + ' kWh';
        }

        // 重新繪製能源圖表
        this.drawEnergyChart();
    }

    // 繪製能源圖表
    drawEnergyChart() {
        const canvas = document.getElementById('energy-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // 設置畫布大小
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        const width = rect.width;
        const height = rect.height;

        // 清空畫布
        ctx.clearRect(0, 0, width, height);

        // 生成模擬數據點
        const dataPoints = [];
        for (let i = 0; i < 24; i++) {
            dataPoints.push(1 + Math.random() * 3);
        }

        // 繪製背景網格
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        
        // 垂直線
        for (let i = 0; i <= 24; i += 4) {
            const x = (i / 24) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // 水平線
        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 繪製數據線
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = (index / 23) * width;
            const y = height - (point / 4) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // 繪製數據點
        ctx.fillStyle = '#3498db';
        dataPoints.forEach((point, index) => {
            const x = (index / 23) * width;
            const y = height - (point / 4) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 切換燈光狀態
    toggleLight(lightId, isOn) {
        console.log(`${lightId} 燈光 ${isOn ? '開啟' : '關閉'}`);
        
        // 添加視覺回饋
        const switchElement = document.getElementById(lightId);
        if (switchElement) {
            switchElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                switchElement.style.transform = 'scale(1)';
            }, 150);
        }

        // 模擬API調用
        this.mockApiCall(`/api/lights/${lightId}`, { status: isOn });
    }

    // 更新燈光亮度
    updateLightBrightness(value) {
        console.log(`燈光亮度調整為 ${value}%`);
        this.mockApiCall('/api/lights/brightness', { brightness: value });
    }

    // 切換安全系統
    toggleSecuritySystem() {
        this.isSecurityArmed = !this.isSecurityArmed;
        
        const button = document.getElementById('arm-system');
        const frontDoorStatus = document.getElementById('front-door');
        const cameraStatus = document.getElementById('camera');
        const alarmStatus = document.getElementById('alarm');

        if (button) {
            if (this.isSecurityArmed) {
                button.textContent = '解除警戒';
                button.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            } else {
                button.textContent = '啟動警戒';
                button.style.background = 'linear-gradient(135deg, #3498db, #2ecc71)';
            }
        }

        // 更新系統狀態顯示
        const statusText = this.isSecurityArmed ? '警戒中' : '已鎖定';
        if (frontDoorStatus) frontDoorStatus.textContent = statusText;
        if (cameraStatus) cameraStatus.textContent = this.isSecurityArmed ? '監控中' : '正常';
        if (alarmStatus) alarmStatus.textContent = this.isSecurityArmed ? '已啟動' : '未觸發';

        console.log(`安全系統 ${this.isSecurityArmed ? '啟動' : '關閉'}`);
        this.mockApiCall('/api/security/arm', { armed: this.isSecurityArmed });
    }

    // 更新系統時間
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    // 模擬API調用
    mockApiCall(endpoint, data) {
        console.log(`模擬API調用: ${endpoint}`, data);
        
        // 模擬網路延遲
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, data });
            }, 100 + Math.random() * 200);
        });
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // 顯示動畫
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自動移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new IoTDashboard();
    
    // 在全域作用域中暴露dashboard實例，以便調試
    window.iotDashboard = dashboard;
    
    // 歡迎訊息
    setTimeout(() => {
        dashboard.showNotification('IoT 智慧家庭系統已啟動', 'success');
    }, 1000);
});

// 處理頁面可見性變化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('頁面隱藏，暫停數據更新');
    } else {
        console.log('頁面顯示，恢復數據更新');
    }
});

// 錯誤處理
window.addEventListener('error', (e) => {
    console.error('JavaScript 錯誤:', e.error);
});

// 處理未處理的Promise拒絕
window.addEventListener('unhandledrejection', (e) => {
    console.error('未處理的Promise拒絕:', e.reason);
});
