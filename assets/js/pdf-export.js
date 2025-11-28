function getSelectedRamForPDF() {
  const ram2 = document.getElementById('ram-2');
  const ram4 = document.getElementById('ram-4');
  const ram8 = document.getElementById('ram-8');
  const ram16 = document.getElementById('ram-16');
  
  if (ram2 && ram2.checked) return 2;
  if (ram4 && ram4.checked) return 4;
  if (ram8 && ram8.checked) return 8;
  if (ram16 && ram16.checked) return 16;
  return 2;
}

function exportToPDF() {
  const hostingManaged = document.getElementById('hosting-managed');
  const modelKubernetes = document.getElementById('model-kubernetes');
  const storageInput = document.getElementById('storage-input');
  const servicesInput = document.getElementById('services-input');

  const basePricesLocal = {
    2: 130,
    4: 150,
    8: 170,
    16: 190
  };
  
  const vpsRamPricesLocal = {
    2: 3,
    4: 6,
    8: 12,
    16: 24
  };

  let ram;
  try {
    ram = (typeof getSelectedRam !== 'undefined' && getSelectedRam) ? getSelectedRam() : getSelectedRamForPDF();
  } catch (e) {
    ram = getSelectedRamForPDF();
  }
  
  const storage = storageInput ? (parseInt(storageInput.value) || 0) : 0;
  const services = servicesInput ? (parseInt(servicesInput.value) || 3) : 3;
  const selectedModel = modelKubernetes && modelKubernetes.checked ? 'kubernetes' : 'vps';
  const isManaged = hostingManaged && hostingManaged.checked ? true : false;
  const hostingType = isManaged ? 'Managed' : 'Unmanaged';
  const modelType = selectedModel === 'kubernetes' ? 'Kubernetes' : 'VPS';
  
  if (!ram || isNaN(ram)) {
    ram = getSelectedRamForPDF();
  }

  const cpu = selectedModel === 'kubernetes' ? ram / 4 : ram / 2;
  let basePrice, storagePrice, ramPrice = 0, servicesPrice = 0, adminFee = 0;
  let monthlyPrice, yearlyPrice;
  if (selectedModel === 'kubernetes') {
    ramPrice = ram * 2.5;
  } else {
    ramPrice = vpsRamPricesLocal[ram] || 3;
  }

  storagePrice = storage * 0.1;

  if (!isManaged) {
    basePrice = 0;
    servicesPrice = 0;
    adminFee = 24;
    monthlyPrice = basePrice + ramPrice + storagePrice + servicesPrice + adminFee;
    yearlyPrice = monthlyPrice * 12;
  } else {
    const additionalServices = Math.max(0, services - 3);
    servicesPrice = additionalServices * 40;

    if (selectedModel === 'kubernetes') {
      basePrice = basePricesLocal[ram] || 130;
      monthlyPrice = basePrice + ramPrice + storagePrice + servicesPrice;
      yearlyPrice = monthlyPrice * 12;
    } else {
      basePrice = basePricesLocal[ram] || 130;
      monthlyPrice = basePrice + ramPrice + storagePrice + servicesPrice;
      yearlyPrice = monthlyPrice * 12;
    }
  }

  const monthlyPriceText = 'CHF ' + monthlyPrice.toFixed(2);
  const yearlyPriceText = 'CHF ' + yearlyPrice.toFixed(2);
  const cpuText = cpu % 1 === 0 ? cpu.toString() : cpu.toFixed(1);
  const jsPDF = getJsPDF();
  if (!jsPDF || typeof jsPDF !== 'function') {
    console.error('jsPDF library is not available or not a function');
    console.log('typeof window.jsPDF:', typeof window.jsPDF);
    console.log('typeof window.jspdf:', typeof window.jspdf);
    alert('PDF library not loaded correctly. Please refresh the page.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('Hosting Quote', margin, yPos);
  yPos += 15;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Information', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  // Get model info from DOM element
  let modelInfoElement;
  if (selectedModel === 'kubernetes' && isManaged) {
    modelInfoElement = document.getElementById('kubernetes-managed-info');
  } else if (selectedModel === 'kubernetes' && !isManaged) {
    modelInfoElement = document.getElementById('kubernetes-unmanaged-info');
  } else if (selectedModel === 'vps' && isManaged) {
    modelInfoElement = document.getElementById('vps-managed-info');
  } else if (selectedModel === 'vps' && !isManaged) {
    modelInfoElement = document.getElementById('vps-unmanaged-info');
  }
  
  if (modelInfoElement) {
    // Get all direct child elements (p, ul, etc.)
    const children = Array.from(modelInfoElement.children);
    
    children.forEach(function(child) {
      const tagName = child.tagName.toLowerCase();
      
      if (tagName === 'p') {
        // Handle paragraphs - check for bold text
        const text = child.textContent.trim();
        if (text) {
          // Check if it starts with bold (b or strong tag)
          const firstElement = child.querySelector('b, strong');
          const isBold = firstElement && child.textContent.trim().startsWith(firstElement.textContent.trim());
          
          if (isBold || text.endsWith(':')) {
            doc.setFont(undefined, 'bold');
          } else {
            doc.setFont(undefined, 'normal');
          }
          
          const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
          doc.text(lines, margin, yPos);
          yPos += lines.length * 5;
        }
        yPos += 2; // Small spacing after paragraph
      } else if (tagName === 'ul') {
        // Handle unordered lists
        const listItems = child.querySelectorAll('li');
        listItems.forEach(function(li) {
          const text = li.textContent.trim();
          if (text) {
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize('• ' + text, pageWidth - 2 * margin);
            doc.text(lines, margin + 3, yPos);
            yPos += lines.length * 5;
          }
        });
        yPos += 2; // Spacing after list
      } else if (tagName === 'br') {
        yPos += 3; // Spacing for line break
      }
    });
  }
  
  yPos += 5;
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Configuration', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  const configData = [
    ['Hosting Type:', hostingType],
    ['Model:', modelType],
    ['RAM:', ram + ' GB'],
    ['CPU:', cpuText + ' vCPU'],
    ['Storage:', storage + ' GB']
  ];
  
  if (isManaged) {
    configData.push(['Services:', services.toString()]);
  }
  
  configData.forEach(function(row) {
    doc.setFont(undefined, 'bold');
    doc.text(row[0], margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(row[1], margin + 60, yPos);
    yPos += 8;
  });
  
  yPos += 5;
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Pricing', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Monthly:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(monthlyPriceText, pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Yearly:', margin, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(yearlyPriceText, pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('VAT not included', margin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 15;
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Quote generated on ' + new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), margin, yPos);
  yPos += 5;
  doc.text('This quote is valid for 30 days.', margin, yPos);

  const filename = 'hosting-quote-' + hostingType.toLowerCase() + '-' + modelType.toLowerCase() + '-' + ram + 'gb.pdf';
  doc.save(filename);
}

function getJsPDF() {
  if (typeof window.jsPDF !== 'undefined') {
    return window.jsPDF;
  }
  if (typeof window.jspdf !== 'undefined') {
    return window.jspdf.jsPDF || window.jspdf;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', function() {
  const exportBtn = document.getElementById('export-pdf-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      const jsPDF = getJsPDF();
      if (!jsPDF) {
        console.error('jsPDF not found. Available window properties:', 
          Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
        alert('PDF library not loaded. Please refresh the page and ensure jspdf.umd.min.js loads correctly.');
        return;
      }
      exportToPDF();
    });
  }
});

