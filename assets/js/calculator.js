const modelKubernetes = document.getElementById('model-kubernetes');
const modelVPS = document.getElementById('model-vps');
const ram2 = document.getElementById('ram-2');
const ram4 = document.getElementById('ram-4');
const ram8 = document.getElementById('ram-8');
const ram16 = document.getElementById('ram-16');
const storageSlider = document.getElementById('storage-slider');
const storageInput = document.getElementById('storage-input');

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

// Get selected RAM value from radio buttons
function getSelectedRam() {
  if (ram2.checked) return 2;
  if (ram4.checked) return 4;
  if (ram8.checked) return 8;
  if (ram16.checked) return 16;
  return 2; // default
}

function updateModelSettings() {
  // Storage is 50-1000GB with step of 10
  storageSlider.min = 50;
  storageInput.min = 50;
  storageSlider.max = 1000;
  storageInput.max = 1000;
  storageSlider.step = 10;
  storageInput.step = 10;
  
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
  const ram = getSelectedRam();
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

function updateModelInfo() {
  if (modelKubernetes.checked) {
    document.getElementById('kubernetes-info').style.display = 'block';
    document.getElementById('vps-info').style.display = 'none';
  } else {
    document.getElementById('kubernetes-info').style.display = 'none';
    document.getElementById('vps-info').style.display = 'block';
  }
}

modelKubernetes.addEventListener('change', function() {
  if (this.checked) {
    updateModelSettings();
    updateModelInfo();
    calculatePrice();
  }
});

modelVPS.addEventListener('change', function() {
  if (this.checked) {
    updateModelSettings();
    updateModelInfo();
    calculatePrice();
  }
});

// RAM radio button event listeners
ram2.addEventListener('change', function() {
  if (this.checked) calculatePrice();
});

ram4.addEventListener('change', function() {
  if (this.checked) calculatePrice();
});

ram8.addEventListener('change', function() {
  if (this.checked) calculatePrice();
});

ram16.addEventListener('change', function() {
  if (this.checked) calculatePrice();
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
updateModelInfo();
calculatePrice();
