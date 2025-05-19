// Constants
const MOBILE_BREAKPOINT = 768;

// URL and Storage management
function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

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
    urlParams.set('singleMode', singleMode);
    urlParams.set('volume', showVolume);
    
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
            if (["macd", "sideToolbar", "topToolbar", "singleMode", "volume"].includes(key)) {
                if (urlValue === 'false') return false;
                return urlValue === 'true';
            }
            // Handle numeric values
            if (["cols", "rows", "zoom"].includes(key)) {
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
let symbols = getSetting('symbols', ["BTCUSDT", "XRPUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"]);
let showMACD = getSetting('macd', false);
let showSideToolbar = getSetting('sideToolbar', false);
let showTopToolbar = getSetting('topToolbar', false);
let selectedInterval = getSetting('interval', "15");
let zoomLevel = getSetting('zoom', 1);
let currentPage = 0;
let singleMode = getSetting('singleMode', false);
let showVolume = getSetting('volume', false);

// Get initial columns and rows based on screen width and saved settings
function getInitialGridSize() {
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
    if (isMobile()) {
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
    const toolbar = document.querySelector('.toolbar');
    const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
    const windowHeight = window.innerHeight;
    const containerHeight = windowHeight - toolbarHeight;

    scaleContainer.style.transform = `scale(${zoomLevel})`;
    scaleContainer.style.width = `${100 / zoomLevel}vw`;
    scaleContainer.style.height = `${(containerHeight / windowHeight) * (100 / zoomLevel)}vh`;
    localStorage.setItem('zoomLevel', zoomLevel);

    // Update zoom value indicators
    const zoomValue = document.getElementById('zoomValue');
    if (zoomValue) zoomValue.textContent = zoomLevel.toFixed(1);
    const mobileZoomValue = document.getElementById('mobileZoomValue');
    if (mobileZoomValue) mobileZoomValue.textContent = zoomLevel.toFixed(1);
}

function zoomIn() {
    zoomLevel = Math.min(2, zoomLevel + 0.1);
    zoomLevel = Math.round(zoomLevel * 10) / 10;
    if (isMobile() && zoomLevel > 1) zoomLevel = 1;
    applyZoom();
    updateUrlParams();
    renderWidgets();
}

function zoomOut() {
    zoomLevel = Math.max(0.5, zoomLevel - 0.1);
    zoomLevel = Math.round(zoomLevel * 10) / 10;
    if (isMobile() && zoomLevel > 1) zoomLevel = 1;
    applyZoom();
    updateUrlParams();
    renderWidgets();
}

// Zoom value click-to-reset handler
function setupZoomValueReset() {
    function resetZoomIfNeeded() {
        if (zoomLevel !== 1) {
            zoomLevel = 1;
            zoomLevel = Math.round(zoomLevel * 10) / 10;
            applyZoom();
            saveSettings();
            updateUrlParams();
            renderWidgets();
        }
    }
    const zoomValue = document.getElementById('zoomValue');
    if (zoomValue) {
        zoomValue.title = 'Reset zoom';
        zoomValue.style.cursor = 'pointer';
        zoomValue.onclick = resetZoomIfNeeded;
    }
    const mobileZoomValue = document.getElementById('mobileZoomValue');
    if (mobileZoomValue) {
        mobileZoomValue.title = 'Reset zoom';
        mobileZoomValue.style.cursor = 'pointer';
        mobileZoomValue.onclick = resetZoomIfNeeded;
    }
}

// Settings management
function saveSettings() {
    // Save to localStorage using the same keys as getSetting
    localStorage.setItem('symbols', JSON.stringify(symbols));
    localStorage.setItem('macd', JSON.stringify(showMACD));
    localStorage.setItem('sideToolbar', JSON.stringify(showSideToolbar));
    localStorage.setItem('topToolbar', JSON.stringify(showTopToolbar));
    localStorage.setItem('interval', selectedInterval);
    localStorage.setItem('cols', colsInput.value);
    localStorage.setItem('rows', rowsInput.value);
    localStorage.setItem('zoom', zoomLevel);
    localStorage.setItem('singleMode', JSON.stringify(singleMode));
    localStorage.setItem('volume', JSON.stringify(showVolume));
    // Update URL parameters
    updateUrlParams();
}

function updateButtonStates() {
    btnMACD.classList.toggle('active', showMACD);
    const btnMACD_mobile = document.getElementById('btnMACD_mobile');
    if (btnMACD_mobile) {
        btnMACD_mobile.classList.toggle('active', showMACD);
    }
    btnSideToolbar.classList.toggle('active', showSideToolbar);
    btnTopToolbar.classList.toggle('active', showTopToolbar);
    const btnSingleMode = document.getElementById('btnSingleMode');
    if (btnSingleMode) {
        btnSingleMode.classList.toggle('active', singleMode);
    }
    const btnSingleModeMobile = document.getElementById('btnSingleMode_mobile');
    if (btnSingleModeMobile) {
        btnSingleModeMobile.classList.toggle('active', singleMode);
    }
    const btnVolume = document.getElementById('btnVolume');
    if (btnVolume) {
        btnVolume.classList.toggle('active', showVolume);
    }
    const btnVolumeMobile = document.getElementById('btnVolume_mobile');
    if (btnVolumeMobile) {
        btnVolumeMobile.classList.toggle('active', showVolume);
    }
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
    const cols = parseInt(colsInput.value);
    const rows = parseInt(rowsInput.value);
    const pageSize = cols * rows;
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;

    symbols.forEach((s, index) => {
        const tag = document.createElement('div');
        tag.className = 'symbol-tag';
        if (index < startIndex || index >= endIndex) {
            tag.classList.add('inactive');
        }
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
    const mobileInput = document.getElementById('mobileSymbolInput');
    const newSymbol = (input?.value || mobileInput?.value || '').trim().toUpperCase();

    if (newSymbol && !symbols.includes(newSymbol)) {
        symbols.push(newSymbol);
        renderWidgets();
        updateUrlParams();
        
        // Clear input based on device
        if (isMobile() && mobileInput) {
            mobileInput.value = '';
            // Update mobile symbols list if mobile settings exist
            if (window.mobileSettings) {
                window.mobileSettings.renderSymbolsList();
            }
        } else if (input) {
            input.value = '';
        }
    }
}

function handleInputKeydown(event) {
    if (event.key === 'Enter') {
        addSymbol();
        // Close mobile settings popup if it's open
        if (isMobile() && window.mobileSettings) {
            window.mobileSettings.closeSettings();
        }
    }
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
let lastScrollWrapper = null;

function renderWidgets() {
    grid.innerHTML = '';
    const cols = parseInt(colsInput.value);
    const rows = parseInt(rowsInput.value);
    const pageSize = cols * rows;
    let pageSymbols, totalPages;
    const gridWrapper = document.querySelector('.grid-wrapper');

    const toolbar = document.querySelector('.toolbar');

    // Update symbol list
    if (isMobile() && window.mobileSettings) {
        window.mobileSettings.renderSymbolsList();
    } else {
        renderSymbolList();
    }

    const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
    // Always explicitly set the number of columns
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    // Calculate row height for both modes
    let availableHeight = window.innerHeight - toolbarHeight;
    let rowHeight = availableHeight / rows / zoomLevel;
    grid.style.gridTemplateRows = 'unset';
    if (singleMode) {
        pageSymbols = symbols;
        totalPages = 1;
        currentPage = 0;
        document.body.classList.add('single-page-mode');
        if (gridWrapper) {
            // Set height only for desktop
            if (!isMobile()) {
                gridWrapper.style.height = `calc(100vh - ${toolbarHeight}px)`;
            } else {
                gridWrapper.style.height = '';
            }
            // Remove right padding logic
            gridWrapper.style.paddingRight = '';
            // Add scroll event listener for thumb sync only on mobile
            if (lastScrollWrapper && lastScrollWrapper !== gridWrapper) {
                lastScrollWrapper.removeEventListener('scroll', lastScrollWrapper._singleScrollHandler);
            }
            if (isMobile()) {
                const handler = () => updateSingleScrollButton(gridWrapper);
                gridWrapper.addEventListener('scroll', handler);
                gridWrapper._singleScrollHandler = handler;
                lastScrollWrapper = gridWrapper;
            } else {
                lastScrollWrapper = null;
            }
        }
    } else {
        totalPages = Math.ceil(symbols.length / pageSize);
        pageSymbols = symbols.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        document.body.classList.remove('single-page-mode');
        if (gridWrapper) {
            gridWrapper.style.height = '';
            gridWrapper.style.paddingRight = '';
            // Remove scroll event listener if present
            if (gridWrapper._singleScrollHandler) {
                gridWrapper.removeEventListener('scroll', gridWrapper._singleScrollHandler);
                delete gridWrapper._singleScrollHandler;
            }
        }
        lastScrollWrapper = null;
    }
    // Render widgets
    pageSymbols.forEach((s, index) => {
        const containerId = 'widget-' + index;
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'widget-container';
        container.style.height = `${rowHeight}px`;
        grid.appendChild(container);
        new TradingView.widget({
            autosize: true,
            symbol: `BYBIT:${s}.P`,
            interval: selectedInterval,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            hide_side_toolbar: !showSideToolbar || isMobile(),
            hide_top_toolbar: !showTopToolbar || isMobile(),
            allow_symbol_change: true,
            save_image: false,
            studies: showMACD ? ["STD;MACD"] : [],
            hide_volume: !showVolume,
            container_id: containerId,
            support_host: "https://www.tradingview.com"
        });
    });
    // Add spacer in singleMode
    if (singleMode) {
        const spacer = document.createElement('div');
        spacer.className = 'grid-spacer';
        spacer.style.height = (20 * rows / zoomLevel) + 'px';
        grid.appendChild(spacer);
    }
    // Update pagination display
    const shouldShowPaginator = !singleMode && totalPages > 1;
    paginator.style.display = shouldShowPaginator ? 'flex' : 'none';
    pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;

    updateButtonStates();
    saveSettings();
    applyZoom();
    updateSingleScrollButton(gridWrapper);
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
    saveSettings();
    updateButtonStates();
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

function toggleSingleMode() {
    singleMode = !singleMode;
    saveSettings();
    updateButtonStates();
    renderWidgets();
    updateUrlParams();
}

function toggleVolume() {
    showVolume = !showVolume;
    saveSettings();
    updateButtonStates();
    renderWidgets();
    updateUrlParams();
}

function changeInterval() {
    // Determine the source of interval
    let newInterval;
    if (isMobile()) {
        const mobileIntervalSelect = document.getElementById('mobileIntervalSelect');
        newInterval = mobileIntervalSelect ? mobileIntervalSelect.value : selectedInterval;
    } else {
        newInterval = intervalSelect.value;
    }
    selectedInterval = newInterval;
    // Synchronize both selectors
    if (intervalSelect) intervalSelect.value = selectedInterval;
    const mobileIntervalSelect = document.getElementById('mobileIntervalSelect');
    if (mobileIntervalSelect) mobileIntervalSelect.value = selectedInterval;
    saveSettings();
    renderWidgets();
    updateUrlParams();
}

// Mobile-specific functions
function updateGridSize() {
    if (isMobile()) {
        colsInput.value = document.getElementById('mobileColsInput').value;
        rowsInput.value = document.getElementById('mobileRowsInput').value;
    }
    renderWidgets();
}

// Add touch event handlers for mobile
function setupTouchHandlers() {
    if (isMobile()) {
        // Add touch handlers for widget containers
        document.querySelectorAll('.widget-container').forEach(container => {
            container.addEventListener('touchstart', (e) => {
                const symbol = container.id.split('-')[1];
                if (symbol) {
                    openPopup(symbols[parseInt(symbol)]);
                }
            });
        });
    }
}

// Update initialization
document.addEventListener('DOMContentLoaded', () => {
    const initialGrid = getInitialGridSize();
    colsInput.value = initialGrid.cols;
    rowsInput.value = initialGrid.rows;
    // Set mobile inputs if they exist
    const mobileColsInput = document.getElementById('mobileColsInput');
    const mobileRowsInput = document.getElementById('mobileRowsInput');
    if (mobileColsInput && mobileRowsInput) {
        mobileColsInput.value = initialGrid.cols;
        mobileRowsInput.value = initialGrid.rows;
    }
    // Ensure button state reflects persisted singleMode
    updateButtonStates();
    if (isMobile() && zoomLevel > 1) {
        zoomLevel = 1;
        applyZoom();
    }
    renderWidgets();
    setupTouchHandlers();
    setupZoomValueReset();
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (isMobile() && zoomLevel > 1) {
            zoomLevel = 1;
            applyZoom();
        }
        if (isMobile()) {
            if (window.mobileSettings) {
                window.mobileSettings.updateSettingsUI();
            }
        }
        renderWidgets();
    }, 250);
});

// Mobile + / - controls for columns and rows
function changeMobileCols(delta) {
    const input = document.getElementById('mobileColsInput');
    let value = parseInt(input.value) || 1;
    value += delta;
    if (value < 1) value = 1;
    input.value = value;
    colsInput.value = value;
    updateGridSize();
}

function changeMobileRows(delta) {
    const input = document.getElementById('mobileRowsInput');
    let value = parseInt(input.value) || 1;
    value += delta;
    if (value < 1) value = 1;
    input.value = value;
    rowsInput.value = value;
    updateGridSize();
}

function updateSingleScrollButton(gridWrapper) {
    let btn = document.getElementById('singleScrollButton');
    if (!singleMode || !isMobile() || !gridWrapper || gridWrapper.scrollHeight <= gridWrapper.clientHeight) {
        if (btn) btn.remove();
        return;
    }
    if (!btn) {
        btn = document.createElement('div');
        btn.id = 'singleScrollButton';
        btn.title = 'Scroll vertically';
        btn.innerHTML = '<div class="scroll-thumb"></div>';
        document.body.appendChild(btn);
        // Drag logic
        let isDragging = false;
        let startY = 0;
        let startScroll = 0;
        btn.addEventListener('mousedown', function(e) {
            isDragging = true;
            startY = e.clientY;
            startScroll = gridWrapper.scrollTop;
            document.body.style.userSelect = 'none';
            const thumb = btn.querySelector('.scroll-thumb');
            if (thumb) thumb.classList.add('active');
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const delta = e.clientY - startY;
            const maxScroll = gridWrapper.scrollHeight - gridWrapper.clientHeight;
            gridWrapper.scrollTop = Math.min(Math.max(startScroll + delta * (maxScroll / (window.innerHeight - 100)) * 1.2, 0), maxScroll);
        });
        document.addEventListener('mouseup', function() {
            isDragging = false;
            document.body.style.userSelect = '';
            const thumb = btn.querySelector('.scroll-thumb');
            if (thumb) thumb.classList.remove('active');
        });
        // Touch support
        btn.addEventListener('touchstart', function(e) {
            isDragging = true;
            startY = e.touches[0].clientY;
            startScroll = gridWrapper.scrollTop;
            const thumb = btn.querySelector('.scroll-thumb');
            if (thumb) thumb.classList.add('active');
        });
        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            const delta = e.touches[0].clientY - startY;
            const maxScroll = gridWrapper.scrollHeight - gridWrapper.clientHeight;
            gridWrapper.scrollTop = Math.min(Math.max(startScroll + delta * (maxScroll / (window.innerHeight - 100)) * 2, 0), maxScroll);
        });
        document.addEventListener('touchend', function() {
            isDragging = false;
            const thumb = btn.querySelector('.scroll-thumb');
            if (thumb) thumb.classList.remove('active');
        });
        // Click to scroll up/down
        btn.addEventListener('click', function(e) {
            if (e.target.classList.contains('scroll-thumb')) return;
            const rect = btn.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const percent = y / rect.height;
            const maxScroll = gridWrapper.scrollHeight - gridWrapper.clientHeight;
            gridWrapper.scrollTop = percent * maxScroll;
        });
    }
    // Update thumb position/size
    const thumb = btn.querySelector('.scroll-thumb');
    if (thumb) {
        const percent = gridWrapper.scrollTop / (gridWrapper.scrollHeight - gridWrapper.clientHeight);
        const thumbHeight = Math.max(40, (gridWrapper.clientHeight / gridWrapper.scrollHeight) * btn.offsetHeight);
        thumb.style.height = thumbHeight + 'px';
        thumb.style.top = percent * (btn.offsetHeight - thumbHeight) + 'px';
    }
} 