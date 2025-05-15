// URL and Storage management
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function updateUrlParams() {
    const urlParams = new URLSearchParams();
    
    // Add all settings to URL
    urlParams.set('symbols', JSON.stringify(symbols));
    urlParams.set('macd', showMACD);
    urlParams.set('sideToolbar', showSideToolbar);
    urlParams.set('topToolbar', showTopToolbar);
    urlParams.set('interval', selectedInterval);
    urlParams.set('cols', colsInput.value);
    urlParams.set('rows', rowsInput.value);
    urlParams.set('zoom', zoomLevel);
    
    // Update URL without page reload
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
}

function getSetting(key, defaultValue) {
    // Try to get from URL first
    const urlValue = getUrlParam(key);
    if (urlValue !== null) {
        try {
            // Handle JSON values
            if (key === 'symbols') {
                return JSON.parse(urlValue);
            }
            // Handle boolean values
            if (['macd', 'sideToolbar', 'topToolbar'].includes(key)) {
                return urlValue === 'true';
            }
            // Handle numeric values
            if (['cols', 'rows', 'zoom'].includes(key)) {
                return parseFloat(urlValue);
            }
            // Handle string values
            return urlValue;
        } catch (e) {
            console.warn(`Failed to parse URL parameter ${key}:`, e);
        }
    }
    
    // Fallback to localStorage
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
        try {
            return JSON.parse(storedValue);
        } catch (e) {
            return storedValue;
        }
    }
    
    return defaultValue;
}

// State management
let symbols = getSetting('symbols', ["BTCUSDT", "ETHUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"]);
let showMACD = getSetting('macd', true);
let showSideToolbar = getSetting('sideToolbar', true);
let showTopToolbar = getSetting('topToolbar', true);
let selectedInterval = getSetting('interval', "15");
let zoomLevel = getSetting('zoom', 1);
let currentPage = 0;

// Get initial columns and rows based on screen width and saved settings
function getInitialGridSize() {
    const isMobile = window.innerWidth <= 768;
    const savedCols = localStorage.getItem('gridCols');
    const savedRows = localStorage.getItem('gridRows');
    
    // If we have saved custom settings, use them regardless of device
    if (savedCols && savedRows) {
        return {
            cols: parseInt(savedCols),
            rows: parseInt(savedRows)
        };
    }
    
    // Default values for mobile if no custom settings
    if (isMobile) {
        return {
            cols: 1,
            rows: 4
        };
    }
    
    // Default values for desktop if no custom settings
    return {
        cols: 2,
        rows: 2
    };
}

// DOM Elements
const scaleContainer = document.getElementById('scaleContainer');
const grid = document.getElementById('widgetGrid');
const symbolList = document.getElementById('symbolList');
const paginator = document.getElementById('paginator');
const pageInfo = document.getElementById('pageInfo');
const intervalSelect = document.getElementById('intervalSelect');
const btnMACD = document.getElementById('btnMACD');
const btnSideToolbar = document.getElementById('btnSideToolbar');
const btnTopToolbar = document.getElementById('btnTopToolbar');
const colsInput = document.getElementById('colsInput');
const rowsInput = document.getElementById('rowsInput');
const widgetPopup = document.getElementById('widgetPopup');
const popupWidgetContainer = document.getElementById('popupWidgetContainer');

// Initialize
intervalSelect.value = selectedInterval;
const initialGrid = getInitialGridSize();
colsInput.value = initialGrid.cols;
rowsInput.value = initialGrid.rows;

// Zoom functionality
function applyZoom() {
    scaleContainer.style.transform = `scale(${zoomLevel})`;
    scaleContainer.style.width = `${100 / zoomLevel}vw`;
    scaleContainer.style.height = `${100 / zoomLevel}vh`;
    localStorage.setItem('zoomLevel', zoomLevel);
}

function zoomIn() {
    zoomLevel = Math.min(2, zoomLevel + 0.1);
    applyZoom();
    updateUrlParams();
}

function zoomOut() {
    zoomLevel = Math.max(0.5, zoomLevel - 0.1);
    applyZoom();
    updateUrlParams();
}

// Settings management
function saveSettings() {
    // Save to localStorage
    localStorage.setItem('cryptoSymbols', JSON.stringify(symbols));
    localStorage.setItem('showMACD', JSON.stringify(showMACD));
    localStorage.setItem('showSideToolbar', JSON.stringify(showSideToolbar));
    localStorage.setItem('showTopToolbar', JSON.stringify(showTopToolbar));
    localStorage.setItem('cryptoInterval', selectedInterval);
    localStorage.setItem('gridCols', colsInput.value);
    localStorage.setItem('gridRows', rowsInput.value);
    localStorage.setItem('zoomLevel', zoomLevel);
    
    // Update URL parameters
    updateUrlParams();
}

function updateButtonStates() {
    btnMACD.classList.toggle('active', showMACD);
    btnSideToolbar.classList.toggle('active', showSideToolbar);
    btnTopToolbar.classList.toggle('active', showTopToolbar);
}

// Symbol management
function openPopup(symbol) {
    widgetPopup.style.display = 'flex';
    popupWidgetContainer.innerHTML = '';
    
    new TradingView.widget({
        autosize: true,
        symbol: `BYBIT:${symbol}.P`,
        interval: selectedInterval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        studies: showMACD ? ["STD;MACD"] : [],
        hide_volume: true,
        container_id: "popupWidgetContainer",
        support_host: "https://www.tradingview.com"
    });
}

function closePopup() {
    widgetPopup.style.display = 'none';
    popupWidgetContainer.innerHTML = '';
}

function renderSymbolList() {
    symbolList.innerHTML = '';
    symbols.forEach((s, index) => {
        const tag = document.createElement('div');
        tag.className = 'symbol-tag';
        tag.textContent = s;
        tag.onmouseenter = () => tag.classList.add('hovered');
        tag.onmouseleave = () => tag.classList.remove('hovered');
        tag.onwheel = (e) => {
            e.preventDefault();
            if (e.deltaY < 0) moveSymbolUp(index);
            else moveSymbolDown(index);
        };
        tag.onclick = () => openPopup(s);
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeSymbol(index);
        };
        tag.appendChild(removeBtn);
        symbolList.appendChild(tag);
    });
}

function moveSymbolUp(index) {
    if (index > 0) {
        [symbols[index], symbols[index - 1]] = [symbols[index - 1], symbols[index]];
        renderWidgets();
    }
}

function moveSymbolDown(index) {
    if (index < symbols.length - 1) {
        [symbols[index], symbols[index + 1]] = [symbols[index + 1], symbols[index]];
        renderWidgets();
    }
}

function addSymbol() {
    const input = document.getElementById('symbolInput');
    const newSymbol = input.value.trim().toUpperCase();
    if (newSymbol && !symbols.includes(newSymbol)) {
        symbols.push(newSymbol);
        renderWidgets();
        updateUrlParams();
    }
    input.value = '';
}

function handleInputKeydown(event) {
    if (event.key === 'Enter') addSymbol();
}

function removeSymbol(index) {
    symbols.splice(index, 1);
    renderWidgets();
    updateUrlParams();
}

function clearSymbols() {
    if (confirm('Are you sure you want to remove all symbols?')) {
        symbols = [];
        renderWidgets();
        updateUrlParams();
    }
}

// Widget management
function renderWidgets() {
    grid.innerHTML = '';
    const cols = parseInt(colsInput.value);
    const rows = parseInt(rowsInput.value);
    const pageSize = cols * rows;
    const totalPages = Math.ceil(symbols.length / pageSize);

    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const pageSymbols = symbols.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    pageSymbols.forEach((s, index) => {
        const containerId = 'widget-' + index;
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'widget-container';
        grid.appendChild(container);

        new TradingView.widget({
            autosize: true,
            symbol: `BYBIT:${s}.P`,
            interval: selectedInterval,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            hide_side_toolbar: !showSideToolbar,
            hide_top_toolbar: !showTopToolbar,
            allow_symbol_change: true,
            save_image: false,
            studies: showMACD ? ["STD;MACD"] : [],
            hide_volume: true,
            container_id: containerId,
            support_host: "https://www.tradingview.com"
        });
    });

    paginator.style.display = totalPages > 1 ? 'flex' : 'none';
    pageInfo.textContent = `Page ${currentPage + 1} / ${totalPages}`;
    renderSymbolList();
    updateButtonStates();
    saveSettings();
    applyZoom();
}

// Pagination
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        renderWidgets();
    }
}

function nextPage() {
    const cols = parseInt(colsInput.value);
    const rows = parseInt(rowsInput.value);
    const pageSize = cols * rows;
    const totalPages = Math.ceil(symbols.length / pageSize);
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderWidgets();
    }
}

// UI Controls
function toggleMACD() {
    showMACD = !showMACD;
    renderWidgets();
    updateUrlParams();
}

function toggleSideToolbar() {
    showSideToolbar = !showSideToolbar;
    renderWidgets();
    updateUrlParams();
}

function toggleTopToolbar() {
    showTopToolbar = !showTopToolbar;
    renderWidgets();
    updateUrlParams();
}

function changeInterval() {
    selectedInterval = intervalSelect.value;
    renderWidgets();
    updateUrlParams();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const initialGrid = getInitialGridSize();
    colsInput.value = initialGrid.cols;
    rowsInput.value = initialGrid.rows;
    renderWidgets();
}); 