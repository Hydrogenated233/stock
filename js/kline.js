let originalData = [
    {open: 100, close: 105, high: 110, low: 98, volume: 10000},
    {open: 105, close: 102, high: 108, low: 101, volume: 8000},
    {open: 102, close: 108, high: 112, low: 100, volume: 12000},
    {open: 108, close: 106, high: 110, low: 104, volume: 9000},
    {open: 106, close: 112, high: 115, low: 105, volume: 11000},
    {open: 112, close: 110, high: 115, low: 108, volume: 8500},
    {open: 110, close: 115, high: 118, low: 108, volume: 13000},
    {open: 115, close: 118, high: 120, low: 113, volume: 15000},
    {open: 118, close: 116, high: 120, low: 115, volume: 9500},
    {open: 116, close: 120, high: 122, low: 115, volume: 14000},
    {open: 120, close: 118, high: 123, low: 117, volume: 10000},
    {open: 118, close: 122, high: 125, low: 117, volume: 16000},
    {open: 122, close: 125, high: 128, low: 120, volume: 18000},
    {open: 125, close: 123, high: 127, low: 122, volume: 11000},
    {open: 123, close: 127, high: 130, low: 122, volume: 17000},
    {open: 127, close: 125, high: 129, low: 124, volume: 12000},
    {open: 125, close: 130, high: 132, low: 124, volume: 19000},
    {open: 130, close: 128, high: 132, low: 127, volume: 14000},
    {open: 128, close: 132, high: 135, low: 127, volume: 20000},
    {open: 132, close: 135, high: 138, low: 130, volume: 22000}
];

let canvas, ctx;
let klineData = [];
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let offsetX = 0;
let offsetY = 0;
let visibleCandles = 10;
let candleWidth = 30;
let padding = { top: 50, right: 60, bottom: 60, left: 80 };
let chartWidth, chartHeight;
let priceRange = { min: 0, max: 0, range: 0 };

function initKLine(data) {
    canvas = document.getElementById('k-line');
    ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 500;

    chartWidth = canvas.width - padding.left - padding.right;
    chartHeight = canvas.height - padding.top - padding.bottom;

    klineData = processData(data);

    visibleCandles = Math.min(klineData.length, 10);
    candleWidth = chartWidth / visibleCandles;

    calculateFixedPriceRange();

    setupEventListeners();

    drawKLine();
}

function processData(data) {
    if (!Array.isArray(data) || data.length !== 20) {
        console.warn('数据格式错误，使用默认数据');
        return [...originalData];
    }

    return data.map((item, index) => {
        if (item === -1) {
            return originalData[index] || generateRandomCandle(100 + index * 2);
        }
        return item;
    });
}

function generateRandomCandle(basePrice) {
    const open = basePrice;
    const change = (Math.random() - 0.5) * 10;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = 5000 + Math.random() * 15000;
    
    return {open, close, high, low, volume};
}

function calculateFixedPriceRange() {
    if (klineData.length === 0) {
        priceRange = { min: 0, max: 100, range: 100 };
        return;
    }
    
    let min = Infinity;
    let max = -Infinity;
    
    klineData.forEach(candle => {
        min = Math.min(min, candle.low);
        max = Math.max(max, candle.high);
    });
    
    const margin = (max - min) * 0.1;
    priceRange = {
        min: min - margin,
        max: max + margin,
        range: (max + margin) - (min - margin)
    };
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX - canvas.getBoundingClientRect().left;
        dragStartY = e.clientY - canvas.getBoundingClientRect().top;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.clientX - canvas.getBoundingClientRect().left;
        const currentY = e.clientY - canvas.getBoundingClientRect().top;
        
        const deltaX = currentX - dragStartX;
        const deltaY = currentY - dragStartY;
        
        dragStartX = currentX;
        dragStartY = currentY;
        
        offsetX -= deltaX;
        // 增加左侧空白区域的限制
        const leftBlankSpace = candleWidth; // 左侧一个K线的空白宽度
        const maxOffsetX = klineData.length * candleWidth - chartWidth + leftBlankSpace;
        offsetX = Math.max(0, Math.min(offsetX, maxOffsetX));
        
        offsetY += deltaY;
        
        const maxVerticalOffset = chartHeight;
        offsetY = Math.max(-maxVerticalOffset, Math.min(maxVerticalOffset, offsetY));
        
        drawKLine();
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'default';
    });

    canvas.addEventListener('mouseenter', () => {
        canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const oldVisibleCandles = visibleCandles;
        
        visibleCandles = Math.max(5, Math.min(30, visibleCandles * zoomFactor));
        candleWidth = chartWidth / visibleCandles;
        
        const mouseX = e.clientX - canvas.getBoundingClientRect().left - padding.left;
        const dataIndex = Math.floor((mouseX + offsetX) / (chartWidth / oldVisibleCandles));
        offsetX = dataIndex * candleWidth - mouseX;
        
        // 增加左侧空白区域的限制
        const leftBlankSpace = candleWidth;
        const maxOffsetX = klineData.length * candleWidth - chartWidth + leftBlankSpace;
        offsetX = Math.max(0, Math.min(offsetX, maxOffsetX));
        
        drawKLine();
    });
}

function drawKLine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    // 计算可见的数据范围（考虑左侧空白区域）
    const leftBlankSpace = candleWidth; // 左侧一个K线的空白宽度
    const adjustedOffsetX = offsetX - leftBlankSpace; // 调整后的偏移量
    const startIndex = Math.floor(Math.max(0, adjustedOffsetX) / candleWidth);
    const endIndex = Math.min(klineData.length, startIndex + visibleCandles);
    
    const visibleData = klineData.slice(startIndex, endIndex);
    
    drawAxes();
    drawGrid();
    drawCandles(visibleData, startIndex, leftBlankSpace);
    drawPriceLabels();
    drawTimeLabels();
    drawTitle();
    drawIndicator();
}

function drawBackground() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#121212';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);
}

function getAdjustedPriceRange() {
    if (offsetY === 0) return priceRange;
    
    const offsetPrice = (offsetY / chartHeight) * priceRange.range;
    
    return {
        min: priceRange.min + offsetPrice,
        max: priceRange.max + offsetPrice,
        range: priceRange.range
    };
}

function drawAxes() {
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1.5;
    
    // Y轴（价格轴）
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // X轴（时间轴）
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
    
    // 坐标轴箭头
    ctx.beginPath();
    // Y轴箭头
    ctx.moveTo(padding.left - 5, padding.top + 10);
    ctx.lineTo(padding.left, padding.top);
    ctx.lineTo(padding.left + 5, padding.top + 10);
    // X轴箭头
    ctx.moveTo(padding.left + chartWidth - 10, padding.top + chartHeight - 5);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth - 10, padding.top + chartHeight + 5);
    ctx.stroke();
}

function drawGrid() {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    
    const horizontalLines = 6;
    for (let i = 0; i <= horizontalLines; i++) {
        const y = padding.top + (chartHeight / horizontalLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
    }
    
    const verticalLines = Math.min(visibleCandles, 10);
    for (let i = 0; i <= verticalLines; i++) {
        const x = padding.left + (chartWidth / verticalLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();
    }
}

function drawCandles(visibleData, startIndex, leftBlankSpace) {
    const adjustedRange = getAdjustedPriceRange();
    const { min, range } = adjustedRange;
    
    ctx.save();
    
    ctx.beginPath();
    ctx.rect(padding.left, padding.top, chartWidth, chartHeight);
    ctx.clip();
    
    visibleData.forEach((candle, index) => {
        // 调整X坐标计算，考虑左侧空白区域
        const x = padding.left + (index * candleWidth) - (offsetX % candleWidth) + leftBlankSpace;
        
        const bodyWidth = Math.max(2, candleWidth * 0.7);
        const bodyX = x - bodyWidth / 2;
        
        if (bodyX + bodyWidth < padding.left || bodyX > padding.left + chartWidth) {
            return;
        }
        
        const yHigh = padding.top + chartHeight - ((candle.high - min) / range) * chartHeight;
        const yLow = padding.top + chartHeight - ((candle.low - min) / range) * chartHeight;
        const yOpen = padding.top + chartHeight - ((candle.open - min) / range) * chartHeight;
        const yClose = padding.top + chartHeight - ((candle.close - min) / range) * chartHeight;
        
        const isBullish = candle.close >= candle.open;
        ctx.fillStyle = isBullish ? '#ff4444' : '#44ff44';
        ctx.strokeStyle = isBullish ? '#cc3333' : '#33cc33';
        ctx.lineWidth = 1;
        
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.abs(yOpen - yClose);
        
        if (bodyHeight > 0) {
            ctx.fillRect(bodyX, bodyTop, bodyWidth, bodyHeight);
            ctx.strokeRect(bodyX, bodyTop, bodyWidth, bodyHeight);
        }
        
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, Math.min(yOpen, yClose));
        ctx.moveTo(x, Math.max(yOpen, yClose));
        ctx.lineTo(x, yLow);
        ctx.stroke();
    });
    
    ctx.restore();
}

function drawPriceLabels() {
    const adjustedRange = getAdjustedPriceRange();
    const { min, range } = adjustedRange;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'right';
    
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
        const price = min + (range / steps) * i;
        const y = padding.top + chartHeight - (i / steps) * chartHeight;
        
        if (y >= padding.top && y <= padding.top + chartHeight) {
            ctx.fillText(price.toFixed(2), padding.left - 10, y + 4);
        }
    }
    
    // Y轴标题
    ctx.save();
    ctx.translate(25, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('价格', 0, 0);
    ctx.restore();
}

function drawTimeLabels() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    const steps = Math.min(6, visibleCandles);
    for (let i = 0; i <= steps; i++) {
        const x = padding.left + (i / steps) * chartWidth;
        
        if (x >= padding.left && x <= padding.left + chartWidth) {
            ctx.fillText('', x, padding.top + chartHeight + 20);
        }
    }
    
    // X轴标题
    ctx.textAlign = 'center';
    ctx.fillText('时间', padding.left + chartWidth / 2, canvas.height - 20);
}

function drawTitle() {
    // 计算当前显示的数据范围
    const leftBlankSpace = candleWidth;
    const adjustedOffsetX = offsetX - leftBlankSpace;
    const startIndex = Math.floor(Math.max(0, adjustedOffsetX) / candleWidth);
    const endIndex = Math.min(klineData.length, startIndex + visibleCandles);
    const lastCandle = klineData[Math.min(endIndex-1, klineData.length-1)];
    const priceChange = ((lastCandle.close - lastCandle.open) / lastCandle.open * 100).toFixed(2);
    
    // 标题文本
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('K线图分析系统', padding.left, 30);
    
    // 当前价格信息
    ctx.font = '13px Arial, sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`显示: ${startIndex + 1}-${Math.min(endIndex, klineData.length)} / ${klineData.length}`, padding.left, 50);
    
    ctx.fillStyle = lastCandle.close >= lastCandle.open ? '#ff4444' : '#44ff44';
    ctx.fillText(`当前: ${lastCandle.close.toFixed(2)} (${priceChange}%)`, padding.left + 150, 50);
    
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`范围: ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}`, padding.left + 300, 50);
}

function drawIndicator() {
    if (isDragging) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(padding.left + chartWidth - 120, padding.top + 10, 110, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('拖动中...', padding.left + chartWidth - 115, padding.top + 20);
        ctx.fillText(`X: ${offsetX.toFixed(0)}`, padding.left + chartWidth - 115, padding.top + 30);
        ctx.fillText(`Y: ${offsetY.toFixed(0)}`, padding.left + chartWidth - 115, padding.top + 40);
    }
}

function generateRandomData() {
    const basePrice = 100 + Math.random() * 50;
    const newData = [];
    
    for (let i = 0; i < 20; i++) {
        if (Math.random() < 0.1) {
            newData.push(-1);
        } else {
            newData.push(generateRandomCandle(basePrice + i * (Math.random() - 0.5) * 5));
        }
    }
    
    klineData = processData(newData);
    calculateFixedPriceRange();
    offsetX = 0;
    offsetY = 0;
    drawKLine();
}

function resetView() {
    offsetX = 0;
    offsetY = 0;
    visibleCandles = 10;
    candleWidth = chartWidth / visibleCandles;
    drawKLine();
}

function drawKLineChart(data) {
    initKLine(data);
    
    return {
        updateData: (newData) => {
            klineData = processData(newData);
            calculateFixedPriceRange();
            drawKLine();
        },
        resetView: resetView,
        generateRandomData: generateRandomData,
        zoomIn: () => {
            visibleCandles = Math.max(5, visibleCandles * 0.8);
            candleWidth = chartWidth / visibleCandles;
            drawKLine();
        },
        zoomOut: () => {
            visibleCandles = Math.min(30, visibleCandles * 1.2);
            candleWidth = chartWidth / visibleCandles;
            drawKLine();
        }
    };
}

window.onload = function () {
    const klineChart = drawKLineChart(originalData);
    
    window.generateRandomData = klineChart.generateRandomData;
    window.resetView = klineChart.resetView;
    window.zoomIn = klineChart.zoomIn;
    window.zoomOut = klineChart.zoomOut;
};