/**
 * VectorMagic Pro - محرك تحويل الصور إلى فيكتور
 * تم تصميمه بواسطة الأستاذ عمر سنجق
 * @version 2.0.0
 */

// ============================================
// المتغيرات العامة
// ============================================
let currentSVG = '';
let originalImage = '';
let settings = {
    colorScheme: 'blackOnWhite',
    threshold: 128,
    strokeWidth: 2,
    detailLevel: 'medium'
};

// ============================================
// تهيئة الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initTabs();
    initUpload();
    initSettings();
    initColorSchemes();
});

// ============================================
// إنشاء الجزيئات المتحركة
// ============================================
function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = 15 + Math.random() * 10 + 's';
        const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(particle);
    }
}

// ============================================
// التبويبات
// ============================================
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
}

// ============================================
// إعدادات التحويل
// ============================================
function initSettings() {
    // حساسية الحواف
    const thresholdSlider = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');
    thresholdSlider.addEventListener('input', function() {
        settings.threshold = parseInt(this.value);
        thresholdValue.textContent = this.value;
    });

    // سمك الخطوط
    const strokeSlider = document.getElementById('strokeWidth');
    const strokeValue = document.getElementById('strokeValue');
    strokeSlider.addEventListener('input', function() {
        settings.strokeWidth = parseInt(this.value);
        strokeValue.textContent = this.value;
    });

    // جودة التفاصيل
    const detailSelect = document.getElementById('detailLevel');
    detailSelect.addEventListener('change', function() {
        settings.detailLevel = this.value;
    });
}

// ============================================
// نظام الألوان
// ============================================
function initColorSchemes() {
    document.querySelectorAll('.color-scheme').forEach(scheme => {
        scheme.addEventListener('click', function() {
            document.querySelectorAll('.color-scheme').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            settings.colorScheme = this.querySelector('input').value;
        });
    });
}

// ============================================
// رفع الملفات
// ============================================
function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // السحب والإفلات
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    });

    // النقر للاختيار
    uploadArea.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    // اختيار ملف
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    });
}

// ============================================
// معالجة الصورة
// ============================================
function processImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = e.target.result;
        showProcessing();
        
        // تحميل الصورة وتحويلها
        const img = new Image();
        img.onload = function() {
            simulateProgress(() => {
                convertToVector(img);
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// محاكاة شريط التقدم
// ============================================
function simulateProgress(callback) {
    let progress = 0;
    const steps = [
        { progress: 20, status: 'تحليل الصورة...' },
        { progress: 40, status: 'إزالة الخلفية...' },
        { progress: 60, status: 'استخراج الحواف...' },
        { progress: 80, status: 'إنشاء المسارات...' },
        { progress: 95, status: 'تحسين الفيكتور...' }
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
        if (stepIndex < steps.length) {
            progress = steps[stepIndex].progress;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressPercent').textContent = progress + '%';
            document.getElementById('progressStatus').textContent = steps[stepIndex].status;
            stepIndex++;
        } else {
            clearInterval(interval);
            document.getElementById('progressFill').style.width = '100%';
            document.getElementById('progressPercent').textContent = '100%';
            document.getElementById('progressStatus').textContent = 'اكتمل!';
            setTimeout(callback, 300);
        }
    }, 400);
}

// ============================================
// عرض قسم المعالجة
// ============================================
function showProcessing() {
    document.getElementById('upload-tab').style.display = 'none';
    document.getElementById('processingSection').classList.add('active');
    document.getElementById('resultSection').classList.remove('active');
}

// ============================================
// محرك تحويل الفيكتور الاحترافي
// ============================================
function convertToVector(img) {
    const canvas = document.getElementById('processingCanvas');
    const ctx = canvas.getContext('2d');
    
    // تحديد حجم المعالجة حسب مستوى الجودة
    const qualitySettings = {
        low: 300,
        medium: 500,
        high: 800,
        ultra: 1200
    };
    
    const maxSize = qualitySettings[settings.detailLevel];
    let width = img.width;
    let height = img.height;
    
    // تغيير الحجم مع الحفاظ على النسبة
    if (width > height) {
        if (width > maxSize) {
            height = Math.round(height * maxSize / width);
            width = maxSize;
        }
    } else {
        if (height > maxSize) {
            width = Math.round(width * maxSize / height);
            height = maxSize;
        }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // الحصول على بيانات البكسل
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // الخطوة 1: تحويل إلى تدرج رمادي
    const grayscale = convertToGrayscale(data, width, height);
    
    // الخطوة 2: تطبيق Gaussian Blur لتقليل الضوضاء
    const blurred = gaussianBlur(grayscale, width, height);
    
    // الخطوة 3: كشف الحواف باستخدام Sobel
    const edges = sobelEdgeDetection(blurred, width, height);
    
    // الخطوة 4: تطبيق Threshold
    const binary = applyThreshold(edges, width, height, settings.threshold);
    
    // الخطوة 5: ترقيق الخطوط (Thinning)
    const thinned = thinLines(binary, width, height);
    
    // الخطوة 6: تتبع الخطوط وإنشاء المسارات
    const paths = traceContours(thinned, width, height);
    
    // الخطوة 7: تبسيط المسارات
    const simplifiedPaths = simplifyPaths(paths);
    
    // الخطوة 8: إنشاء SVG
    currentSVG = generateSVG(simplifiedPaths, width, height);
    
    // عرض النتيجة
    showResult();
}

// ============================================
// تحويل إلى تدرج رمادي
// ============================================
function convertToGrayscale(data, width, height) {
    const grayscale = new Float32Array(width * height);
    
    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        // استخدام معادلة اللمعان
        grayscale[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
    
    return grayscale;
}

// ============================================
// تطبيق Gaussian Blur
// ============================================
function gaussianBlur(input, width, height) {
    const output = new Float32Array(width * height);
    const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
    ];
    const kernelSum = 16;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = (y + ky) * width + (x + kx);
                    sum += input[idx] * kernel[ky + 1][kx + 1];
                }
            }
            output[y * width + x] = sum / kernelSum;
        }
    }
    
    return output;
}

// ============================================
// كشف الحواف باستخدام Sobel
// ============================================
function sobelEdgeDetection(input, width, height) {
    const output = new Float32Array(width * height);
    
    // Sobel kernels
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = (y + ky) * width + (x + kx);
                    const pixel = input[idx];
                    gx += pixel * sobelX[ky + 1][kx + 1];
                    gy += pixel * sobelY[ky + 1][kx + 1];
                }
            }
            
            // حساب قوة الحافة
            output[y * width + x] = Math.sqrt(gx * gx + gy * gy);
        }
    }
    
    // تطبيع القيم
    let max = 0;
    for (let i = 0; i < output.length; i++) {
        if (output[i] > max) max = output[i];
    }
    
    if (max > 0) {
        for (let i = 0; i < output.length; i++) {
            output[i] = (output[i] / max) * 255;
        }
    }
    
    return output;
}

// ============================================
// تطبيق Threshold
// ============================================
function applyThreshold(input, width, height, threshold) {
    const output = new Uint8Array(width * height);
    
    // Adaptive threshold
    const blockSize = 15;
    const C = 5;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // حساب المتوسط المحلي
            let sum = 0;
            let count = 0;
            
            for (let dy = -blockSize; dy <= blockSize; dy++) {
                for (let dx = -blockSize; dx <= blockSize; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        sum += input[ny * width + nx];
                        count++;
                    }
                }
            }
            
            const localMean = sum / count;
            const idx = y * width + x;
            
            // تطبيق العتبة مع النظر للقيمة العامة
            const dynamicThreshold = Math.min(localMean - C, threshold);
            output[idx] = input[idx] > dynamicThreshold ? 1 : 0;
        }
    }
    
    return output;
}

// ============================================
// ترقيق الخطوط (Zhang-Suen Thinning)
// ============================================
function thinLines(input, width, height) {
    const output = new Uint8Array(input);
    let changed = true;
    
    while (changed) {
        changed = false;
        
        // المرحلة 1
        const toRemove1 = [];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (output[y * width + x] === 1) {
                    const neighbors = getNeighbors(output, x, y, width);
                    const p2 = neighbors[0], p3 = neighbors[1], p4 = neighbors[2];
                    const p5 = neighbors[3], p6 = neighbors[4], p7 = neighbors[5];
                    const p8 = neighbors[6], p9 = neighbors[7];
                    
                    const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
                    const A = countTransitions(neighbors);
                    
                    if (B >= 2 && B <= 6 && A === 1 &&
                        (p2 * p4 * p6) === 0 && (p4 * p6 * p8) === 0) {
                        toRemove1.push(y * width + x);
                    }
                }
            }
        }
        
        for (const idx of toRemove1) {
            output[idx] = 0;
            changed = true;
        }
        
        // المرحلة 2
        const toRemove2 = [];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (output[y * width + x] === 1) {
                    const neighbors = getNeighbors(output, x, y, width);
                    const p2 = neighbors[0], p3 = neighbors[1], p4 = neighbors[2];
                    const p5 = neighbors[3], p6 = neighbors[4], p7 = neighbors[5];
                    const p8 = neighbors[6], p9 = neighbors[7];
                    
                    const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
                    const A = countTransitions(neighbors);
                    
                    if (B >= 2 && B <= 6 && A === 1 &&
                        (p2 * p4 * p8) === 0 && (p2 * p6 * p8) === 0) {
                        toRemove2.push(y * width + x);
                    }
                }
            }
        }
        
        for (const idx of toRemove2) {
            output[idx] = 0;
            changed = true;
        }
    }
    
    return output;
}

function getNeighbors(data, x, y, width) {
    return [
        data[(y - 1) * width + x],     // P2
        data[(y - 1) * width + x + 1], // P3
        data[y * width + x + 1],       // P4
        data[(y + 1) * width + x + 1], // P5
        data[(y + 1) * width + x],     // P6
        data[(y + 1) * width + x - 1], // P7
        data[y * width + x - 1],       // P8
        data[(y - 1) * width + x - 1]  // P9
    ];
}

function countTransitions(neighbors) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
        if (neighbors[i] === 0 && neighbors[(i + 1) % 8] === 1) {
            count++;
        }
    }
    return count;
}

// ============================================
// تتبع الخطوط
// ============================================
function traceContours(binary, width, height) {
    const paths = [];
    const visited = new Set();
    
    // البحث عن نقاط البداية
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (binary[idx] === 1 && !visited.has(idx)) {
                const path = tracePath(binary, x, y, width, height, visited);
                if (path.length > 3) {
                    paths.push(path);
                }
            }
        }
    }
    
    return paths;
}

function tracePath(binary, startX, startY, width, height, visited) {
    const path = [];
    let x = startX, y = startY;
    
    // الاتجاهات الثمانية
    const dx = [0, 1, 1, 1, 0, -1, -1, -1];
    const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
    
    let maxSteps = 5000;
    
    while (maxSteps-- > 0) {
        const idx = y * width + x;
        if (visited.has(idx)) break;
        
        visited.add(idx);
        path.push({ x, y });
        
        let found = false;
        for (let dir = 0; dir < 8; dir++) {
            const nx = x + dx[dir];
            const ny = y + dy[dir];
            const nidx = ny * width + nx;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
                binary[nidx] === 1 && !visited.has(nidx)) {
                x = nx;
                y = ny;
                found = true;
                break;
            }
        }
        
        if (!found) break;
    }
    
    return path;
}

// ============================================
// تبسيط المسارات (Ramer-Douglas-Peucker)
// ============================================
function simplifyPaths(paths) {
    const tolerance = settings.detailLevel === 'ultra' ? 0.5 :
                     settings.detailLevel === 'high' ? 1 :
                     settings.detailLevel === 'medium' ? 1.5 : 2;
    
    return paths.map(path => rdpSimplify(path, tolerance));
}

function rdpSimplify(points, epsilon) {
    if (points.length < 3) return points;
    
    let maxDist = 0;
    let maxIndex = 0;
    const start = points[0];
    const end = points[points.length - 1];
    
    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], start, end);
        if (dist > maxDist) {
            maxDist = dist;
            maxIndex = i;
        }
    }
    
    if (maxDist > epsilon) {
        const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
        const right = rdpSimplify(points.slice(maxIndex), epsilon);
        return left.slice(0, -1).concat(right);
    }
    
    return [start, end];
}

function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    
    if (dx === 0 && dy === 0) {
        return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
    }
    
    const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    const nearestX = lineStart.x + t * dx;
    const nearestY = lineStart.y + t * dy;
    
    return Math.sqrt(Math.pow(point.x - nearestX, 2) + Math.pow(point.y - nearestY, 2));
}

// ============================================
// إنشاء SVG
// ============================================
function generateSVG(paths, width, height) {
    const bgColor = settings.colorScheme === 'blackOnWhite' ? '#FFFFFF' : '#000000';
    const strokeColor = settings.colorScheme === 'blackOnWhite' ? '#000000' : '#FFFFFF';
    const strokeWidth = settings.strokeWidth;
    
    let pathsData = '';
    
    for (const path of paths) {
        if (path.length < 2) continue;
        
        // إنشاء مسار SVG سلس باستخدام منحنيات Bezier
        let d = `M ${path[0].x} ${path[0].y}`;
        
        if (path.length === 2) {
            d += ` L ${path[1].x} ${path[1].y}`;
        } else {
            // استخدام منحنيات Catmull-Rom المحولة إلى Bezier
            for (let i = 0; i < path.length - 1; i++) {
                const p0 = path[Math.max(0, i - 1)];
                const p1 = path[i];
                const p2 = path[Math.min(path.length - 1, i + 1)];
                const p3 = path[Math.min(path.length - 1, i + 2)];
                
                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;
                
                d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x} ${p2.y}`;
            }
        }
        
        pathsData += `    <path d="${d}" />\n`;
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${width} ${height}" 
     width="${width}" 
     height="${height}">
  
  <!-- تم إنشاؤه بواسطة VectorMagic Pro -->
  <!-- تصميم: الأستاذ عمر سنجق -->
  
  <defs>
    <style>
      .vector-paths {
        fill: none;
        stroke: ${strokeColor};
        stroke-width: ${strokeWidth};
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    </style>
  </defs>
  
  <!-- الخلفية -->
  <rect width="100%" height="100%" fill="${bgColor}" />
  
  <!-- المسارات -->
  <g class="vector-paths">
${pathsData}  </g>
</svg>`;
}

// ============================================
// عرض النتيجة
// ============================================
function showResult() {
    document.getElementById('processingSection').classList.remove('active');
    document.getElementById('resultSection').classList.add('active');
    
    // عرض الصورة الأصلية
    document.getElementById('originalPreview').innerHTML = `<img src="${originalImage}" alt="Original">`;
    
    // عرض SVG
    const svgPreview = document.getElementById('svgPreview');
    svgPreview.innerHTML = currentSVG;
    svgPreview.style.background = settings.colorScheme === 'blackOnWhite' ? '#fff' : '#000';
    
    // حفظ في المعرض
    saveToGallery(originalImage, currentSVG);
    
    showToast('تم التحويل بنجاح!', 'success');
}

// ============================================
// تحميل SVG
// ============================================
function downloadSVG() {
    const blob = new Blob([currentSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector_' + Date.now() + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تحميل الملف بنجاح!', 'success');
}

// ============================================
// مشاركة SVG
// ============================================
function shareSVG() {
    const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
    
    if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'vector.svg', { type: 'image/svg+xml' });
        const shareData = { files: [file], title: 'Vector Image', text: 'تم إنشاؤه بواسطة VectorMagic Pro' };
        
        if (navigator.canShare(shareData)) {
            navigator.share(shareData).catch(console.log);
            return;
        }
    }
    
    // Fallback: نسخ SVG كـ Data URL
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(currentSVG)));
    navigator.clipboard.writeText(dataUrl).then(() => {
        showToast('تم نسخ رابط الصورة!', 'success');
    });
}

// ============================================
// إعادة تعيين
// ============================================
function resetUpload() {
    document.getElementById('upload-tab').style.display = 'block';
    document.getElementById('processingSection').classList.remove('active');
    document.getElementById('resultSection').classList.remove('active');
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('progressStatus').textContent = 'جاري المعالجة';
    document.getElementById('fileInput').value = '';
}

// ============================================
// المعرض
// ============================================
function saveToGallery(original, svg) {
    let gallery = JSON.parse(localStorage.getItem('vectorGallery') || '[]');
    gallery.unshift({
        id: Date.now(),
        original: original,
        svg: svg,
        settings: { ...settings },
        date: new Date().toISOString()
    });
    gallery = gallery.slice(0, 20); // الاحتفاظ بآخر 20
    localStorage.setItem('vectorGallery', JSON.stringify(gallery));
}

function openGallery() {
    const gallery = JSON.parse(localStorage.getItem('vectorGallery') || '[]');
    const grid = document.getElementById('galleryGrid');
    
    if (gallery.length === 0) {
        grid.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 40px; grid-column: 1/-1;">لا توجد صور محفوظة</p>';
    } else {
        grid.innerHTML = gallery.map(item => `
            <div class="gallery-item" onclick="loadFromGallery(${item.id})">
                <img src="${item.original}" alt="Image">
                <div class="select-overlay">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('galleryModal').classList.add('active');
}

function closeGallery() {
    document.getElementById('galleryModal').classList.remove('active');
}

function loadFromGallery(id) {
    const gallery = JSON.parse(localStorage.getItem('vectorGallery') || '[]');
    const item = gallery.find(g => g.id === id);
    if (item) {
        originalImage = item.original;
        currentSVG = item.svg;
        if (item.settings) {
            settings = { ...item.settings };
        }
        closeGallery();
        document.getElementById('upload-tab').style.display = 'none';
        showResult();
    }
}

// ============================================
// تحميل من رابط
// ============================================
function loadFromUrl() {
    const url = document.getElementById('imageUrl').value.trim();
    if (!url) {
        showToast('الرجاء إدخال رابط صحيح', 'error');
        return;
    }
    
    showProcessing();
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        originalImage = canvas.toDataURL('image/png');
        
        simulateProgress(() => {
            convertToVector(img);
        });
    };
    img.onerror = function() {
        showToast('فشل تحميل الصورة من الرابط', 'error');
        resetUpload();
    };
    img.src = url;
}

// ============================================
// API
// ============================================
function generateApiKey() {
    const key = 'vmk_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('apiKey').value = key;
    
    let apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]');
    apiKeys.push({
        key: key,
        created: new Date().toISOString(),
        requests: 0
    });
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    
    showToast('تم إنشاء مفتاح API جديد!', 'success');
}

function copyApiKey() {
    const input = document.getElementById('apiKey');
    if (input.value) {
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('تم نسخ مفتاح API!', 'success');
        });
    } else {
        showToast('قم بإنشاء مفتاح API أولاً', 'error');
    }
}

function openApiSection() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="api"]').classList.add('active');
    document.getElementById('api-tab').classList.add('active');
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = 'toast ' + type;
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// أحداث إضافية
// ============================================
document.getElementById('galleryModal').addEventListener('click', function(e) {
    if (e.target === this) closeGallery();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeGallery();
});

// ============================================
// API Endpoint Simulation (للتطوير المحلي)
// ============================================
const VectorMagicAPI = {
    version: '2.0.0',
    author: 'عمر سنجق',
    
    async convert(imageData, options = {}) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const tempSettings = { ...settings, ...options };
                settings = tempSettings;
                
                // تحويل الصورة
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // معالجة الصورة
                const imageDataObj = ctx.getImageData(0, 0, img.width, img.height);
                const grayscale = convertToGrayscale(imageDataObj.data, img.width, img.height);
                const blurred = gaussianBlur(grayscale, img.width, img.height);
                const edges = sobelEdgeDetection(blurred, img.width, img.height);
                const binary = applyThreshold(edges, img.width, img.height, settings.threshold);
                const thinned = thinLines(binary, img.width, img.height);
                const paths = traceContours(thinned, img.width, img.height);
                const simplifiedPaths = simplifyPaths(paths);
                const svg = generateSVG(simplifiedPaths, img.width, img.height);
                
                resolve({
                    success: true,
                    svg: svg,
                    width: img.width,
                    height: img.height,
                    pathCount: paths.length
                });
            };
            img.src = imageData;
        });
    }
};

// جعل API متاحاً عالمياً
window.VectorMagicAPI = VectorMagicAPI;

console.log('%c VectorMagic Pro v2.0 ', 'background: linear-gradient(135deg, #6366f1, #ec4899); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c تصميم: الأستاذ عمر سنجق ', 'color: #6366f1; font-size: 14px;');