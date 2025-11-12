// Get all DOM elements
const modelKubernetes = document.getElementById('model-kubernetes');
const modelVPS = document.getElementById('model-vps');
const ramSlider = document.getElementById('ram-slider');
const ramInput = document.getElementById('ram-input');
const storageSlider = document.getElementById('storage-slider');
const storageInput = document.getElementById('storage-input');
const ramValues = [2, 4, 8, 16];

// Base price mapping based on RAM (used for both Kubernetes base price and VPS managed price)
const basePrices = {
    2: 130,
    4: 150,
    8: 170,
    16: 190
};

// Base price mapping based on RAM for VPS (from Infomaniak pricing)
// 2GB = 2.93 CHF, 4GB = 5.86 CHF, 8GB = 11.72 CHF, 16GB = 17.58 CHF
const vpsRamPrices = {
    2: 2.93,
    4: 5.86,
    8: 11.72,
    16: 17.58
};

// Storage price lookup table for VPS (from Infomaniak pricing)
// Maps storage GB to monthly cost
const vpsStoragePrices = {
    50: 4.38,
    100: 8.76,
    150: 13.14,
    200: 17.52,
    250: 21.9,
    300: 26.28,
    350: 30.66,
    400: 35.04
};

// Lookup function for storage price (similar to XLOOKUP)
function lookupStoragePrice(storageGB) {
    // First try exact match
    if (vpsStoragePrices[storageGB] !== undefined) {
        return vpsStoragePrices[storageGB];
    }
    
    // If no exact match, find the closest lower value
    const storageKeys = Object.keys(vpsStoragePrices).map(Number).sort((a, b) => a - b);
    let closestKey = storageKeys[0];
    
    for (let i = 0; i < storageKeys.length; i++) {
        if (storageKeys[i] <= storageGB) {
            closestKey = storageKeys[i];
        } else {
            break;
        }
    }
    
    // If storage is less than minimum, return minimum
    // If storage is greater than maximum, calculate based on rate
    if (storageGB < closestKey) {
        return storageGB * 0.0876; // Use per-GB rate for values below lookup table
    } else if (storageGB > storageKeys[storageKeys.length - 1]) {
        // For values above max, use the per-GB rate
        return storageGB * 0.0876;
    }
    
    return vpsStoragePrices[closestKey];
}

// Convert slider position (0-3) to RAM value
function sliderToRam(sliderPos) {
    if (sliderPos >= ramValues.length) {
        return ramValues[ramValues.length - 1]; // Return 16
    }
    return ramValues[sliderPos] || 2;
}

// Convert RAM value to slider position (0-3)
function ramToSlider(ramValue) {
    // If value is 16 or greater, return max position (3)
    if (ramValue >= 16) {
        return 3;
    }
    
    // Find the closest value
    let closestIndex = 0;
    let minDiff = Math.abs(ramValue - ramValues[0]);
    
    for (let i = 1; i < ramValues.length; i++) {
        const diff = Math.abs(ramValue - ramValues[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }
    
    return closestIndex;
}

// Model-specific settings
function updateModelSettings(model) {
    // RAM slider uses 0-3 internally, mapped to values (2, 4, 8, 16)
    ramSlider.min = 0;
    ramSlider.max = 3;
    ramSlider.step = 1;
    ramInput.min = 2;
    ramInput.max = 16;
    
    // Storage is 50-400GB with step of 50
    storageSlider.min = 50;
    storageInput.min = 50;
    storageSlider.max = 400;
    storageInput.max = 400;
    storageSlider.step = 50;
    storageInput.step = 50;
    
    // Ensure current RAM value is valid
    let ramValue = parseInt(ramInput.value) || 2;
    if (ramValue < 2) ramValue = 2;
    if (ramValue > 16) ramValue = 16;
    // Round to nearest valid value
    ramValue = sliderToRam(ramToSlider(ramValue));
    ramInput.value = ramValue;
    ramSlider.value = ramToSlider(ramValue);
    
    // Ensure current storage value is valid and rounded to nearest 50
    let storageValue = parseInt(storageInput.value) || 50;
    if (storageValue < 50) storageValue = 50;
    if (storageValue > 400) storageValue = 400;
    // Round to nearest multiple of 50
    storageValue = Math.round(storageValue / 50) * 50;
    storageInput.value = storageValue;
    storageSlider.value = storageValue;
}

// Price calculation
function calculatePrice() {
    const ram = parseInt(ramInput.value) || 2;
    const storage = parseInt(storageInput.value) || 50;
    const selectedModel = modelKubernetes.checked ? 'kubernetes' : 'vps';
    
    let basePrice, storagePrice, ramPrice = 0;
    let monthlyPrice, yearlyPrice;
    
    if (selectedModel === 'kubernetes') {
        // Kubernetes pricing
        basePrice = basePrices[ram] || 130;
        storagePrice = storage * 0.1; // 0.1 CHF per GB storage
        ramPrice = ram * 2.5; // 2.5 CHF per GB RAM
        monthlyPrice = basePrice + storagePrice + ramPrice;
        yearlyPrice = monthlyPrice * 12;
        
        // Show Kubernetes pricing, hide VPS pricing
        document.getElementById('kubernetes-pricing').style.display = 'block';
        document.getElementById('vps-pricing').style.display = 'none';
        
        // Update Kubernetes display
        document.getElementById('price-monthly').textContent = `CHF ${monthlyPrice.toFixed(2)}`;
        document.getElementById('price-yearly').innerHTML = `<strong>CHF ${yearlyPrice.toFixed(2)}</strong>`;
    } else {
        // VPS pricing (based on Infomaniak pricing table using lookup)
        // RAM price from lookup table
        const ramPrice = vpsRamPrices[ram] || 2.93;
        // Storage price from lookup table (similar to XLOOKUP)
        storagePrice = lookupStoragePrice(storage);
        
        // VPS calculation: Infomaniak cost (RAM + Storage from lookup tables) + Managed service price
        const infomaniakCost = ramPrice + storagePrice;
        const managedPrice = basePrices[ram] || 130; // Managed price varies by RAM
        monthlyPrice = infomaniakCost + managedPrice;
        yearlyPrice = monthlyPrice * 12;
        
        // Show VPS pricing, hide Kubernetes pricing
        document.getElementById('kubernetes-pricing').style.display = 'none';
        document.getElementById('vps-pricing').style.display = 'block';
        
        // Update VPS display
        document.getElementById('vps-monthly-price').textContent = `CHF ${monthlyPrice.toFixed(2)}`;
        document.getElementById('vps-yearly-price').textContent = `CHF ${yearlyPrice.toFixed(2)}`;
    }
    
    // Console log for debugging
    console.log('=== Price Calculation ===');
    console.log('RAM:', ram, 'GB');
    console.log('Storage:', storage, 'GB');
    console.log('Model:', selectedModel);
    if (selectedModel === 'kubernetes') {
        console.log('Base Price (RAM-based):', basePrice, 'CHF');
        console.log('RAM Price:', ramPrice, 'CHF');
        console.log('Storage Price:', storagePrice, 'CHF');
    } else {
        console.log('RAM Price (from lookup):', (vpsRamPrices[ram] || 2.93).toFixed(2), 'CHF');
        console.log('Storage Price (from lookup):', storagePrice.toFixed(2), 'CHF');
        console.log('Infomaniak Cost:', ((vpsRamPrices[ram] || 2.93) + storagePrice).toFixed(2), 'CHF');
        console.log('Managed Price:', (basePrices[ram] || 130).toFixed(2), 'CHF');
    }
    console.log('Monthly Price:', monthlyPrice.toFixed(2), 'CHF');
    console.log('Yearly Price:', yearlyPrice.toFixed(2), 'CHF');
    console.log('========================');
}

// Model selection event listeners
modelKubernetes.addEventListener('change', function() {
    if (this.checked) {
        updateModelSettings('kubernetes');
        calculatePrice();
    }
});

modelVPS.addEventListener('change', function() {
    if (this.checked) {
        updateModelSettings('vps');
        calculatePrice();
    }
});

// Sync slider and input for RAM
ramSlider.addEventListener('input', function() {
    const sliderPos = parseInt(this.value);
    const ramValue = sliderToRam(sliderPos);
    ramInput.value = ramValue;
    calculatePrice();
});

ramInput.addEventListener('input', function() {
    let value = parseInt(this.value);
    const maxValue = parseInt(ramInput.max);
    const minValue = parseInt(ramInput.min);
    if (value < minValue) value = minValue;
    if (value > maxValue) value = maxValue;
    // Round to nearest valid value (2, 4, 8, 16)
    value = sliderToRam(ramToSlider(value));
    this.value = value;
    ramSlider.value = ramToSlider(value);
    calculatePrice();
});

// Sync slider and input for Storage
storageSlider.addEventListener('input', function() {
    storageInput.value = this.value;
    calculatePrice();
});

storageInput.addEventListener('input', function() {
    let value = parseInt(this.value);
    const maxValue = parseInt(storageInput.max);
    const minValue = parseInt(storageInput.min);
    if (value < minValue) value = minValue;
    if (value > maxValue) value = maxValue;
    // Round to nearest multiple of 50
    value = Math.round(value / 50) * 50;
    this.value = value;
    storageSlider.value = value;
    calculatePrice();
});

// Initialize model settings and price on load
updateModelSettings('kubernetes');
calculatePrice();
