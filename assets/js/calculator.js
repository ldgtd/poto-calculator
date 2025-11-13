const modelKubernetes = document.getElementById('model-kubernetes');
const modelVPS = document.getElementById('model-vps');
const ramSlider = document.getElementById('ram-slider');
const ramInput = document.getElementById('ram-input');
const storageSlider = document.getElementById('storage-slider');
const storageInput = document.getElementById('storage-input');
const ramValues = [2, 4, 8, 16];

// Base price mapping based on RAM
const basePrices = {
  2: 130,
  4: 150,
  8: 170,
  16: 190
};

// Base price mapping based on RAM for VPS
// 2GB = 3 CHF, 4GB = 6 CHF, 8GB = 12 CHF, 16GB = 24 CHF
const vpsRamPrices = {
  2: 3,
  4: 6,
  8: 12,
  16: 24
};

// Convert slider position (0-3) to RAM value
function sliderToRam(sliderPos) {
  if (sliderPos >= ramValues.length) {
    return ramValues[ramValues.length - 1];
  }
  return ramValues[sliderPos] || 2;
}

// Convert RAM value to slider position (0-3)
function ramToSlider(ramValue) {
  if (ramValue >= 16) {
    return 3;
  }

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

function updateModelSettings() {
  // RAM slider uses 0-3 internally, mapped to values (2, 4, 8, 16)
  ramSlider.min = 0;
  ramSlider.max = 3;
  ramSlider.step = 1;
  ramInput.min = 2;
  ramInput.max = 16;
  
  // Storage is 50-1000GB with step of 10
  storageSlider.min = 50;
  storageInput.min = 50;
  storageSlider.max = 1000;
  storageInput.max = 1000;
  storageSlider.step = 10;
  storageInput.step = 10;
  
  // Ensure current RAM value is valid
  let ramValue = parseInt(ramInput.value) || 2;
  if (ramValue < 2) ramValue = 2;
  if (ramValue > 16) ramValue = 16;
  ramValue = sliderToRam(ramToSlider(ramValue));
  ramInput.value = ramValue;
  ramSlider.value = ramToSlider(ramValue);
  
  // Ensure current storage value is valid and rounded to nearest 10
  let storageValue = parseInt(storageInput.value) || 50;
  if (storageValue < 50) storageValue = 50;
  if (storageValue > 1000) storageValue = 1000;
  storageValue = Math.round(storageValue / 10) * 10;
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
    basePrice = basePrices[ram] || 130;
    storagePrice = storage * 0.1; 
    ramPrice = ram * 2.5;
    monthlyPrice = basePrice + storagePrice + ramPrice;
    yearlyPrice = monthlyPrice * 12;
  } else {
    basePrice = basePrices[ram] || 130;
    ramPrice = vpsRamPrices[ram] || 3;
    storagePrice = storage * 0.09;
    monthlyPrice = basePrice + ramPrice + storagePrice;
    yearlyPrice = monthlyPrice * 12;
  }
  
  if (selectedModel === 'kubernetes') {
    document.getElementById('kubernetes-pricing').style.display = 'block';
    document.getElementById('vps-pricing').style.display = 'none';
    document.getElementById('price-monthly').textContent = `CHF ${monthlyPrice.toFixed(2)}`;
    document.getElementById('price-yearly').innerHTML = `<strong>CHF ${yearlyPrice.toFixed(2)}</strong>`;
  } else {
    document.getElementById('kubernetes-pricing').style.display = 'none';
    document.getElementById('vps-pricing').style.display = 'block';
    document.getElementById('vps-monthly-price').textContent = `CHF ${monthlyPrice.toFixed(2)}`;
    document.getElementById('vps-yearly-price').textContent = `CHF ${yearlyPrice.toFixed(2)}`;
  }
}

modelKubernetes.addEventListener('change', function() {
  if (this.checked) {
    updateModelSettings();
    calculatePrice();
  }
});

modelVPS.addEventListener('change', function() {
  if (this.checked) {
    updateModelSettings();
    calculatePrice();
  }
});

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
  value = Math.round(value / 10) * 10;
  this.value = value;
  storageSlider.value = value;
  calculatePrice();
});

updateModelSettings();
calculatePrice();
