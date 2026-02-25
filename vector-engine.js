/**
 * VectorMagic Pro - محرك تحويل الصور إلى فيكتور
 * تم تصميمه بواسطة الأستاذ عمر السيد
 * @version 3.0.0 (AI Powered - Hardcoded Keys)
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
            document.getElementById('progressFill').style.width = '30%';
            document.getElementById('progressPercent').textContent = '30%';
            convertToVector(img);
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
// محرك التحويل المزدوج (تنظيف محلي + API خارجي)
// ============================================
async function convertToVector(img) {
    // تم دمج المفاتيح مباشرة في الكود هنا
    const apiKey = 'vkeyvg9yiiely8i';
    const apiSecret = 'knckq2ssuv32cjhj113n86ommn6seombg4iqcddgb5b5flinpksp';

    document.getElementById('progressStatus').textContent = 'جاري عزل الخلفية وتنظيف الخطوط...';

    // 1. التنظيف المحلي وعزل الألوان
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const thresholdLevel = settings.threshold;

    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        let colorVal;
        if (settings.colorScheme === 'whiteOnBlack') {
            colorVal = brightness < thresholdLevel ? 255 : 0; 
        } else {
            colorVal = brightness < thresholdLevel ? 0 : 255; 
        }
        data[i] = colorVal;
        data[i+1] = colorVal;
        data[i+2] = colorVal;
    }
    ctx.putImageData(imageData, 0, 0);

    document.getElementById('progressFill').style.width = '60%';
    document.getElementById('progressPercent').textContent = '60%';
    document.getElementById('progressStatus').textContent = 'جاري الإرسال لسيرفرات الذكاء الاصطناعي...';

    // 2. إرسال الصورة النظيفة إلى السيرفر
    canvas.toBlob(async function(blob) {
        const formData = new FormData();
        formData.append('image', blob, 'clean_image.png');

        try {
            // نستخدم Proxy لتخطي حماية المتصفح (CORS) والسماح بالاتصال
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = 'https://vectorizer.ai/api/v1/vectorize';
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(apiKey + ':' + apiSecret)
                },
                body: formData
            });

            if (response.ok) {
                document.getElementById('progressFill').style.width = '100%';
                document.getElementById('progressPercent').textContent = '100%';
                document.getElementById('progressStatus').textContent = 'تم استلام الفيكتور بنجاح!';
                
                const svgString = await response.text();
                currentSVG = svgString;
                setTimeout(showResult, 500);
            } else {
                const errorText = await response.text();
                showToast('تأكد من صحة الرصيد في حساب Vectorizer.ai', 'error');
                console.error('API Error:', errorText);
                resetUpload();
            }
        } catch (error) {
            showToast('خطأ في الاتصال بالبروكسي أو السيرفر', 'error');
            console.error('Fetch Error:', error);
            resetUpload();
        }
    }, 'image/png');
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

document.getElementById('galleryModal').addEventListener('click', function(e) {
    if (e.target === this) closeGallery();
});

function openApiSection() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="api"]').classList.add('active');
    document.getElementById('api-tab').classList.add('active');
}

function generateApiKey() { showToast('هذه واجهة تجريبية، مفاتيح Vectorizer.ai مدمجة بالفعل في النظام.', 'error'); }
function copyApiKey() { showToast('لا يوجد مفتاح للنسخ.', 'error'); }

console.log('%c VectorMagic Pro v3.0 (AI Powered) ', 'background: linear-gradient(135deg, #6366f1, #ec4899); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c تصميم وتطوير: الأستاذ عمر السيد ', 'color: #6366f1; font-size: 14px;');
