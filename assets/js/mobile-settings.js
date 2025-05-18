// Mobile Settings Management
class MobileSettings {
    constructor() {
        this.settingsPopup = document.getElementById('mobileSettingsPopup');
        this.menuButton = document.getElementById('mobileMenuButton');
        this.symbolsList = document.getElementById('mobileSymbolsList');
        this.symbolInput = document.getElementById('mobileSymbolInput');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Menu button touch events
        this.menuButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleSettings();
        });

        // Close popup on outside click
        document.addEventListener('touchstart', (e) => {
            if (!this.settingsPopup.contains(e.target) && 
                !this.menuButton.contains(e.target) && 
                this.settingsPopup.style.display === 'flex') {
                this.closeSettings();
            }
        });

        // Add input handling for mobile symbol input
        if (this.symbolInput) {
            this.symbolInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInputKeydown(e);
                }
            });
        }
    }

    toggleSettings() {
        if (this.settingsPopup.style.display === 'flex') {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }

    openSettings() {
        this.settingsPopup.style.display = 'flex';
        this.renderSymbolsList();
        this.updateSettingsUI();
    }

    closeSettings() {
        this.settingsPopup.style.display = 'none';
    }

    renderSymbolsList() {
        this.symbolsList.innerHTML = '';
        symbols.forEach((symbol, index) => {
            const item = document.createElement('div');
            item.className = 'mobile-symbol-item';
            
            const symbolText = document.createElement('span');
            symbolText.textContent = symbol;
            
            const controls = document.createElement('div');
            controls.className = 'mobile-symbol-controls';
            
            // Move up button
            const upBtn = document.createElement('button');
            upBtn.className = 'icon-btn';
            upBtn.title = 'Move up';
            upBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 6v8M10 6l-4 4M10 6l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            upBtn.onclick = (e) => {
                e.stopPropagation();
                moveSymbolUp(index);
                this.renderSymbolsList();
            };
            
            // Move down button
            const downBtn = document.createElement('button');
            downBtn.className = 'icon-btn';
            downBtn.title = 'Move down';
            downBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 14V6M10 14l-4-4M10 14l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            downBtn.onclick = (e) => {
                e.stopPropagation();
                moveSymbolDown(index);
                this.renderSymbolsList();
            };
            
            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'icon-btn';
            removeBtn.title = 'Remove';
            removeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeSymbol(index);
                this.renderSymbolsList();
            };
            
            controls.appendChild(upBtn);
            controls.appendChild(downBtn);
            controls.appendChild(removeBtn);
            
            item.appendChild(symbolText);
            item.appendChild(controls);
            this.symbolsList.appendChild(item);
        });
    }

    updateSettingsUI() {        
        // Update interval select
        const mobileIntervalSelect = document.getElementById('mobileIntervalSelect');
        if (mobileIntervalSelect) {
            mobileIntervalSelect.value = selectedInterval;
        }
        // Update grid size inputs
        document.getElementById('mobileColsInput').value = colsInput.value;
        document.getElementById('mobileRowsInput').value = rowsInput.value;
        // Update MACD button state
        if (typeof updateButtonStates === 'function') {
            updateButtonStates();
        }
    }
}

// Initialize mobile settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileSettings = new MobileSettings();
}); 