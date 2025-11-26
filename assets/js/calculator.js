const hostingManaged = document.getElementById('hosting-managed');
const hostingUnmanaged = document.getElementById('hosting-unmanaged');
const modelKubernetes = document.getElementById('model-kubernetes');
const modelVPS = document.getElementById('model-vps');
const ram2 = document.getElementById('ram-2');
const ram4 = document.getElementById('ram-4');
const ram8 = document.getElementById('ram-8');
const ram16 = document.getElementById('ram-16');
const storageSlider = document.getElementById('storage-slider');
const storageInput = document.getElementById('storage-input');
const servicesSlider = document.getElementById('services-slider');
const servicesInput = document.getElementById('services-input');

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

function updateCpuDisplay() {
  const ram = getSelectedRam();

  const kubernetesCpu = ram / 4;
  const vpsCpu = ram / 2;

  const kubernetesCpuText = `${kubernetesCpu}`;
  const vpsCpuText = `${vpsCpu}`;
  
  document.getElementById('kubernetes-cpu').querySelector('.cpu-value').textContent = kubernetesCpuText;
  document.getElementById('vps-cpu').querySelector('.cpu-value').textContent = vpsCpuText;
}

function updateModelSettings() {
  storageSlider.min = 0;
  storageInput.min = 0;
  storageSlider.max = 1000;
  storageInput.max = 1000;
  storageSlider.step = 10;
  storageInput.step = 10;
  
  let storageValue = parseInt(storageInput.value) || 0;
  if (storageValue < 0) storageValue = 0;
  if (storageValue > 1000) storageValue = 1000;
  storageValue = Math.round(storageValue / 10) * 10;
  storageInput.value = storageValue;
  storageSlider.value = storageValue;
}

// Price calculation
function calculatePrice() {
  const ram = getSelectedRam();
  const storage = parseInt(storageInput.value) || 0;
  const services = parseInt(servicesInput.value) || 3;
  const selectedModel = modelKubernetes.checked ? 'kubernetes' : 'vps';
  const isManaged = hostingManaged.checked;

  let basePrice, storagePrice, ramPrice = 0, servicesPrice = 0, adminFee = 0;
  let monthlyPrice, yearlyPrice;

  // Calculate RAM price (same for both managed and unmanaged)
  if (selectedModel === 'kubernetes') {
    ramPrice = ram * 2.5;
  } else {
    ramPrice = vpsRamPrices[ram] || 3;
  }

  storagePrice = storage * 0.1;

  if (!isManaged) {
    basePrice = 0;
    servicesPrice = 0;
    adminFee = 20;
    monthlyPrice = basePrice + ramPrice + storagePrice + servicesPrice + adminFee;
    yearlyPrice = monthlyPrice * 12;
  } else {
    const additionalServices = Math.max(0, services - 3);
    servicesPrice = additionalServices * 40;

    if (selectedModel === 'kubernetes') {
      basePrice = basePrices[ram] || 130;
      monthlyPrice = basePrice + ramPrice + storagePrice + servicesPrice;
      yearlyPrice = monthlyPrice * 12;
    } else {
      basePrice = basePrices[ram] || 130;
      monthlyPrice = basePrice + ramPrice + storagePrice + servicesPrice;
      yearlyPrice = monthlyPrice * 12;
    }
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
  const isManaged = hostingManaged.checked;
  const isKubernetes = modelKubernetes.checked;
  document.getElementById('hosting-title').textContent = isManaged ? 'Managed hosting' : 'Unmanaged hosting';
  document.getElementById('services-section').style.display = isManaged ? 'block' : 'none';
  if (isKubernetes) {
    document.getElementById('kubernetes-managed-info').style.display = isManaged ? 'block' : 'none';
    document.getElementById('kubernetes-unmanaged-info').style.display = isManaged ? 'none' : 'block';
    document.getElementById('vps-managed-info').style.display = 'none';
    document.getElementById('vps-unmanaged-info').style.display = 'none';
    document.getElementById('kubernetes-cpu').style.display = 'block';
    document.getElementById('vps-cpu').style.display = 'none';
  } else {
    document.getElementById('kubernetes-managed-info').style.display = 'none';
    document.getElementById('kubernetes-unmanaged-info').style.display = 'none';
    document.getElementById('vps-managed-info').style.display = isManaged ? 'block' : 'none';
    document.getElementById('vps-unmanaged-info').style.display = isManaged ? 'none' : 'block';
    document.getElementById('kubernetes-cpu').style.display = 'none';
    document.getElementById('vps-cpu').style.display = 'block';
  }
  updateCpuDisplay();
}

hostingManaged.addEventListener('change', function() {
  if (this.checked) {
    updateModelInfo();
    calculatePrice();
  }
});

hostingUnmanaged.addEventListener('change', function() {
  if (this.checked) {
    updateModelInfo();
    calculatePrice();
  }
});

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
  if (this.checked) {
    updateCpuDisplay();
    calculatePrice();
  }
});

ram4.addEventListener('change', function() {
  if (this.checked) {
    updateCpuDisplay();
    calculatePrice();
  }
});

ram8.addEventListener('change', function() {
  if (this.checked) {
    updateCpuDisplay();
    calculatePrice();
  }
});

ram16.addEventListener('change', function() {
  if (this.checked) {
    updateCpuDisplay();
    calculatePrice();
  }
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

servicesSlider.addEventListener('input', function() {
  servicesInput.value = this.value;
  calculatePrice();
});

servicesInput.addEventListener('input', function() {
  let value = parseInt(this.value);
  const maxValue = parseInt(servicesInput.max);
  const minValue = parseInt(servicesInput.min);
  if (value < minValue) value = minValue;
  if (value > maxValue) value = maxValue;
  this.value = value;
  servicesSlider.value = value;
  calculatePrice();
});

updateModelSettings();
updateModelInfo();
updateCpuDisplay();
calculatePrice();
