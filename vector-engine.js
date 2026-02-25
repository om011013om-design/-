/**
 * VectorMagic Pro - محرك تحويل الصور إلى فيكتور
 * تم تصميمه بواسطة الأستاذ عمر السيد
 * @version 4.0.0 (Local OpenCV Style - Adaptive Threshold)
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

function initSettings() {
    const thresholdSlider = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');
    thresholdSlider.addEventListener('input', function() {
        settings.threshold = parseInt(this.value);
        thresholdValue.textContent = this.value;
    });

    const detailSelect = document.getElementById('detailLevel');
    detailSelect.addEventListener('change', function() {
        settings.detailLevel = this.value;
    });
}

function initColorSchemes() {
    document.querySelectorAll('.color-scheme').forEach(scheme => {
        scheme.addEventListener('click', function() {
            document.querySelectorAll('.color-scheme').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            settings.colorScheme = this.querySelector('input').value;
        });
    });
}

function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => { uploadArea.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) processImage(file);
    });

    uploadArea.addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) processImage(e.target.files[0]); });
}

function processImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = e.target.result;
        showProcessing();
        const img = new Image();
        img.onload = function() {
            document.getElementById('progressFill').style.width = '20%';
            document.getElementById('progressPercent').textContent = '20%';
            // إعطاء المتصفح لحظة لتحديث الواجهة قبل بدء المعالجة الثقيلة
            setTimeout(() => convertToVector(img), 50);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showProcessing() {
    document.getElementById('upload-tab').style.display = 'none';
    document.getElementById('processingSection').classList.add('active');
    document.getElementById('resultSection').classList.remove('active');
}

// ============================================
// محرك التحويل (عزل ذكي محلي + ImageTracer)
// ============================================
function convertToVector(img) {
    document.getElementById('progressStatus').textContent = 'جاري العزل الذكي للخلفية وتنظيف الشوائب...';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // 1. تحويل الصورة إلى تدرج رمادي (Grayscale)
    const gray = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
        gray[i] = data[i*4] * 0.299 + data[i*4+1] * 0.587 + data[i*4+2] * 0.114;
    }

    // 2. خوارزمية (Integral Image) لسرعة المعالجة
    const intImg = new Uint32Array(width * height);
    for (let y = 0; y < height; y++) {
        let sum = 0;
        for (let x = 0; x < width; x++) {
            sum += gray[y * width + x];
            if (y === 0) intImg[y * width + x] = sum;
            else intImg[y * width + x] = intImg[(y - 1) * width + x] + sum;
        }
    }

    // 3. تطبيق العزل الذكي (Adaptive Threshold)
    const s = Math.max(Math.floor(Math.min(width, height) / 16), 2); // حجم نافذة الفحص
    const t = settings.threshold / 10; // حساسية الاستخراج (من شريط التمرير)

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const x1 = Math.max(x - s, 0);
            const x2 = Math.min(x + s, width - 1);
            const y1 = Math.max(y - s, 0);
            const y2 = Math.min(y + s, height - 1);

            const count = (x2 - x1 + 1) * (y2 - y1 + 1);
            const A = (x1 > 0 && y1 > 0) ? intImg[(y1 - 1) * width + (x1 - 1)] : 0;
            const B = (y1 > 0) ? intImg[(y1 - 1) * width + x2] : 0;
            const C = (x1 > 0) ? intImg[y2 * width + (x1 - 1)] : 0;
            const D = intImg[y2 * width + x2];
            
            const sum = D - B - C + A;

            // تحديد ما إذا كان البيكسل نص أم خلفية
            let colorVal = 255; // أبيض (خلفية)
            if ((gray[y * width + x] * count) <= (sum * (100 - t) / 100)) {
                colorVal = 0; // أسود (نص)
            }

            // عكس الألوان إذا اختار المستخدم أبيض على أسود
            if (settings.colorScheme === 'whiteOnBlack') {
                colorVal = colorVal === 0 ? 255 : 0;
            }

            const idx = (y * width + x) * 4;
            data[idx] = colorVal;
            data[idx+1] = colorVal;
            data[idx+2] = colorVal;
            data[idx+3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    document.getElementById('progressFill').style.width = '60%';
    document.getElementById('progressPercent').textContent = '60%';
    document.getElementById('progressStatus').textContent = 'جاري رسم المنحنيات وتحويلها لفيكتور...';

    // 4. تحويل الصورة النظيفة إلى مسارات SVG باستخدام المكتبة
    let detailPrecision = 1; 
    if (settings.detailLevel === 'ultra') detailPrecision = 0.1;
    else if (settings.detailLevel === 'high') detailPrecision = 0.5;
    else if (settings.detailLevel === 'medium') detailPrecision = 1;
    else detailPrecision = 5;

    const options = {
        ltres: detailPrecision,
        qtres: detailPrecision,
        pathomit: 8,          // تنظيف الحواف
        colorsampling: 0,
        numberofcolors: 2,    // أبيض وأسود فقط
        mincolorratio: 0,
        colorquantcycles: 1,
        blurradius: 0,
        blurdelta: 0,
        viewbox: true         // لمنع قص الصورة والزووم
    };

    // استدعاء المكتبة
    ImageTracer.imageToSVG(
        canvas.toDataURL('image/png'),
        function(svgString) {
            document.getElementById('progressFill').style.width = '100%';
            document.getElementById('progressPercent').textContent = '100%';
            document.getElementById('progressStatus').textContent = 'اكتمل!';
            currentSVG = svgString;
            setTimeout(showResult, 500);
        },
        options
    );
}

// ============================================
// عرض النتيجة
// ============================================
function showResult() {
    document.getElementById('processingSection').classList.remove('active');
    document.getElementById('resultSection').classList.add('active');
    
    document.getElementById('originalPreview').innerHTML = `<img src="${originalImage}" alt="Original">`;
    
    const svgPreview = document.getElementById('svgPreview');
    svgPreview.innerHTML = currentSVG;
    svgPreview.style.background = settings.colorScheme === 'blackOnWhite' ? '#fff' : '#000';
    
    saveToGallery(originalImage, currentSVG);
    showToast('تم التحويل بنجاح!', 'success');
}

// ============================================
// تحميل ومشاركة
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

function shareSVG() {
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(currentSVG)));
    navigator.clipboard.writeText(dataUrl).then(() => {
        showToast('تم نسخ رابط الصورة!', 'success');
    }).catch(() => {
        showToast('فشل النسخ', 'error');
    });
}

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
    gallery.unshift({ id: Date.now(), original: original, svg: svg, settings: { ...settings }, date: new Date().toISOString() });
    gallery = gallery.slice(0, 20);
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
                <div class="select-overlay"><i class="fas fa-check-circle"></i></div>
            </div>
        `).join('');
    }
    document.getElementById('galleryModal').classList.add('active');
}

function closeGallery() { document.getElementById('galleryModal').classList.remove('active'); }

function loadFromGallery(id) {
    const gallery = JSON.parse(localStorage.getItem('vectorGallery') || '[]');
    const item = gallery.find(g => g.id === id);
    if (item) {
        originalImage = item.original;
        currentSVG = item.svg;
        if (item.settings) settings = { ...item.settings };
        closeGallery();
        document.getElementById('upload-tab').style.display = 'none';
        showResult();
    }
}

// ============================================
// أدوات مساعدة
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    toastMessage.textContent = message;
    toast.className = 'toast ' + type;
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

document.getElementById('galleryModal').addEventListener('click', function(e) { if (e.target === this) closeGallery(); });

function openApiSection() { showToast('الموقع يعمل الآن بقدرات متقدمة مجانية تماماً!', 'success'); }

console.log('%c VectorMagic Pro v4.0 (Local OpenCV Style) ', 'background: linear-gradient(135deg, #6366f1, #ec4899); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c تصميم وتطوير: الأستاذ عمر السيد ', 'color: #6366f1; font-size: 14px;');
