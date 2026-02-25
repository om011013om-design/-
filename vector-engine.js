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
    const thresholdSlider = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');
    thresholdSlider.addEventListener('input', function() {
        settings.threshold = parseInt(this.value);
        thresholdValue.textContent = this.value;
    });

    const strokeSlider = document.getElementById('strokeWidth');
    const strokeValue = document.getElementById('strokeValue');
    strokeSlider.addEventListener('input', function() {
        settings.strokeWidth = parseInt(this.value);
        strokeValue.textContent = this.value;
    });

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

    uploadArea.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

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
        { progress: 50, status: 'تتبع الحواف...' },
        { progress: 80, status: 'إنشاء المسارات...' },
        { progress: 95, status: 'تنعيم الفيكتور...' }
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

function showProcessing() {
    document.getElementById('upload-tab').style.display = 'none';
    document.getElementById('processingSection').classList.add('active');
    document.getElementById('resultSection').classList.remove('active');
}

// ============================================
// محرك تحويل الفيكتور الحقيقي (ImageTracer.js)
// ============================================
function convertToVector(img) {
    let detailPrecision = 1; 
    if (settings.detailLevel === 'ultra') detailPrecision = 0.1;
    else if (settings.detailLevel === 'high') detailPrecision = 0.5;
    else if (settings.detailLevel === 'medium') detailPrecision = 1;
    else detailPrecision = 5;

    const options = {
        ltres: detailPrecision,
        qtres: detailPrecision,
        pathomit: 20,
        colorsampling: 0,
        numberofcolors: 2,
        mincolorratio: 0,
        colorquantcycles: 3,
        blurradius: 1,
        blurdelta: 20
    };

    ImageTracer.imageToSVG(
        img.src,
        function(svgString) {
            currentSVG = svgString;
            showResult();
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
// تحميل ومشاركة SVG
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
    gallery.unshift({
        id: Date.now(),
        original: original,
        svg: svg,
        settings: { ...settings },
        date: new Date().toISOString()
    });
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
        if (item.settings) settings = { ...item.settings };
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
// API & Tools
// ============================================
function generateApiKey() {
    const key = 'vmk_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('apiKey').value = key;
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

document.getElementById('galleryModal').addEventListener('click', function(e) {
    if (e.target === this) closeGallery();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeGallery();
});

console.log('%c VectorMagic Pro v2.0 ', 'background: linear-gradient(135deg, #6366f1, #ec4899); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c تصميم: الأستاذ عمر سنجق ', 'color: #6366f1; font-size: 14px;');
