const ITERATIONS = 100000;

// I18n Dictionary
const i18n = {
    zh: {
        page_title: "NodeAuth Worker 部署辅助工具",
        lang_btn: "EN",
        header_sub: "部署辅助工具",
        nav_random: "随机密钥",
        nav_base64: "Base64 编码",
        nav_hex: "Hex 编码",
        nav_aes: "AES 批量加密",
        t1_title: "随机密钥生成",
        t1_subtitle: "用于生成高强度的 JWT_SECRET 或 ENCRYPTION_KEY。",
        t1_length: "密钥长度：",
        t1_label: "生成的安全字符串：",
        btn_regenerate: "重新生成 (Regenerate)",
        t2_title: "Base64 编码",
        t2_subtitle: "将环境变量包装为 base64: 前缀格式。",
        t2_label: "输入原始变量：",
        t2_ph: "输入环境变量...",
        t2_out_label: "编码输出：",
        t_hex_title: "Hex 编码",
        t_hex_subtitle: "将敏感值转换为十六进制 hex: 格式。",
        t3_title: "AES 批量加密",
        t3_subtitle: "支持多行 KEY=VALUE 解析。浏览器本地并行计算，安全可靠。",
        t3_secret_label: "根密钥 (明文 JWT_SECRET)：",
        t3_secret_ph: "填入刚才生成的 64 位密钥...",
        t3_license_label: "授权码 (NODEAUTH_LICENSE)：",
        t3_license_ph: "填入您的授权码...",
        t3_license_hint: "离开输入框自动保存在本地",
        t3_target_label: "待加密环境变量 (支持多行、KEY=VALUE 格式)：",
        t3_target_ph: "示例\nabc@example.com\n- OAUTH_GOOGLE_CLIENT_ID=357284972762-oogleusercontent.com",
        t3_out_label: "AES 加密输出 (aes:iv:tag:cipher)：",
        ready_status: "准备就绪",
        btn_encrypt: "执行加密",
        err_missing: "请提供 JWT_SECRET 和 待加密值",
        status_derive: "正在派生根密钥 (100k PBKDF2)...",
        status_encrypting: "正在解析并加密 {n} 个条目...",
        btn_copy_tips: "点击复制",
        toast_copied: "已复制到剪贴板！",
        toast_saved: "授权码已保存到本地",
        lang_btn_title: "Switch to English",
        theme_btn: "切换主题",
        link_website: "NodeAuth",
        link_demo: "在线演示",
        link_license: "授权中心",
        link_wiki: "Wiki文档",
        link_tools: "部署工具",
        url_website: "https://www.nodeauth.io/cn/",
        url_wiki: "https://wiki.nodeauth.io/cn/"
    },
    en: {
        page_title: "NodeAuth Worker Deploy Helper",
        lang_btn: "中文",
        header_sub: "Deploy Helper",
        nav_random: "Random Secret",
        nav_base64: "Base64 Encoder",
        nav_hex: "Hex Encoder",
        nav_aes: "AES Batch Encryptor",
        t1_title: "Random Secret Generator",
        t1_subtitle: "Generate high-strength JWT_SECRET or ENCRYPTION_KEY.",
        t1_length: "Key Length:",
        t1_label: "Generated Secure String:",
        btn_regenerate: "Regenerate",
        t2_title: "Base64 Encoder",
        t2_subtitle: "Encodes variables into base64: prefix format.",
        t2_label: "Input Plaintext:",
        t2_ph: "Enter environment variable...",
        t2_out_label: "Encoded Output:",
        t_hex_title: "Hex Encoder",
        t_hex_subtitle: "Encodes sensitive values into hex: prefix format.",
        t3_title: "AES Batch Encryptor",
        t3_subtitle: "Browser-local batch encryption for KEY=VALUE envs.",
        t3_secret_label: "Root Key (Plaintext JWT_SECRET):",
        t3_secret_ph: "Enter the generated secret...",
        t3_license_label: "License (NODEAUTH_LICENSE):",
        t3_license_ph: "Enter your license...",
        t3_license_hint: "Saved locally on blur",
        t3_target_label: "Target Variables (Multi-line, KEY=VALUE supported):",
        t3_target_ph: "Example\nabc@example.com\n- OAUTH_GOOGLE_CLIENT_ID=357284972762-oogleusercontent.com",
        t3_out_label: "AES Output (aes:iv:tag:cipher):",
        ready_status: "Ready",
        btn_encrypt: "Encrypt Now",
        err_missing: "Please provide JWT_SECRET and values",
        status_derive: "Deriving root key (100k PBKDF2)...",
        status_encrypting: "Parsing and encrypting {n} items...",
        btn_copy_tips: "Click to copy",
        toast_copied: "Copied to clipboard!",
        toast_saved: "License saved locally",
        lang_btn_title: "切换到中文",
        theme_btn: "Toggle Theme",
        link_website: "NodeAuth Home",
        link_demo: "Online Demo",
        link_license: "License Center",
        link_wiki: "Wiki Docs",
        link_tools: "Deployment Tools",
        url_website: "https://www.nodeauth.io",
        url_wiki: "https://wiki.nodeauth.io"
    }
};

let currentLang = localStorage.getItem('nodeauth-lang') ||
    (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

// UI Logic
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '';
    if (type === 'success') icon = '<svg width="18" height="18"><use href="#icon-success"/></svg>';
    else if (type === 'error') icon = '<svg width="18" height="18"><use href="#icon-error"/></svg>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function switchTab(targetId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[data-target="${targetId}"]`).classList.add('active');

    document.querySelectorAll('.tool-section').forEach(el => el.classList.remove('active-tool'));
    document.getElementById(`tool-${targetId}`).classList.add('active-tool');

    // Auto-close mobile menu if open
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar && sidebar.classList.contains('menu-open')) {
        sidebar.classList.remove('menu-open');
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar) sidebar.classList.toggle('menu-open');
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        switchTab(item.getAttribute('data-target'));
    });
});

// Lang & Theme
function toggleLang() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('nodeauth-lang', currentLang);
    applyLang();
}

function applyLang() {
    const dict = i18n[currentLang];
    document.documentElement.lang = currentLang;
    if (dict.page_title) document.title = dict.page_title;

    const attrMap = {
        'data-i18n': 'innerHTML',
        'data-placeholder': 'placeholder',
        'data-i18n-title': 'title',
        'data-i18n-href': 'href'
    };

    Object.entries(attrMap).forEach(([attr, prop]) => {
        document.querySelectorAll(`[${attr}]`).forEach(el => {
            const key = el.getAttribute(attr);
            if (dict[key]) el[prop] = dict[key];
        });
    });
}

function updateThemeIcons(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.innerHTML = theme === 'light' ?
            '<svg><use href="#icon-moon"/></svg>' :
            '<svg><use href="#icon-sun"/></svg>';
    });
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('nodeauth-theme', newTheme);
    updateThemeIcons(newTheme);
}

function initTheme() {
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = sysDark ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('nodeauth-theme') || defaultTheme;
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

// Features
function generateRandom() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
    let result = '';
    const len = parseInt(document.getElementById('random-length').value) || 64;
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
        result += chars[array[i] % chars.length];
    }
    document.getElementById('random-out').textContent = result;
}

function encodeBase64() {
    const input = document.getElementById('b64-in').value;
    const out = document.getElementById('b64-out');
    if (!input) { out.textContent = ''; return; }
    const b64 = btoa(unescape(encodeURIComponent(input)));
    out.textContent = `base64:${b64}`;
}

function encodeHex() {
    const input = document.getElementById('hex-in').value;
    const out = document.getElementById('hex-out');
    if (!input) { out.textContent = ''; return; }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
    out.textContent = `hex:${hex}`;
}

function saveLicense() {
    const val = document.getElementById('aes-license').value.trim();
    if (val) {
        localStorage.setItem('nodeauth-license', val);
        showToast(i18n[currentLang].toast_saved, 'success');
    } else {
        localStorage.removeItem('nodeauth-license');
    }
}

function loadLicense() {
    const saved = localStorage.getItem('nodeauth-license');
    if (saved) document.getElementById('aes-license').value = saved;
}

async function encryptAES() {
    const dict = i18n[currentLang];
    const secretStr = document.getElementById('aes-secret').value.trim();
    const targetArea = document.getElementById('aes-target').value;
    const out = document.getElementById('aes-out');
    const btn = document.getElementById('btn-encrypt');

    if (!secretStr || !targetArea.trim()) {
        showToast(dict.err_missing, 'error');
        return;
    }
    try {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        const encoder = new TextEncoder();
        const secretBuf = encoder.encode(secretStr);
        const licenseValue = document.getElementById('aes-license').value.trim();

        out.innerHTML = `<span class="placeholder-text">${dict.status_derive}</span>`;

        // Logic Lock 核心
        async function getDerivedLicenseKey(masterKey, license) {
            let licenseFeature = 'no_license_feature';
            try {
                if (license) {
                    const decoded = atob(license);
                    const parts = decoded.split('|');
                    if (parts.length === 3) licenseFeature = parts[2];
                }
            } catch (e) { }

            const baseKey = await window.crypto.subtle.importKey(
                'raw', encoder.encode(masterKey),
                { name: 'HMAC', hash: 'SHA-256' },
                false, ['sign']
            );

            const derivedSignature = await window.crypto.subtle.sign(
                'HMAC', baseKey,
                encoder.encode(`logic_lock_v1_${licenseFeature}`)
            );
            return new Uint8Array(derivedSignature);
        }

        const dynamicSalt = await getDerivedLicenseKey(secretStr, licenseValue);

        const material = await window.crypto.subtle.importKey('raw', secretBuf, { name: 'PBKDF2' }, false, ['deriveKey']);
        const aesKey = await window.crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: dynamicSalt, iterations: ITERATIONS, hash: 'SHA-256' },
            material, { name: 'AES-GCM', length: 256 }, true, ['encrypt']
        );
        const lines = targetArea.split('\n').filter(l => l.trim() !== '');
        out.innerHTML = `<span class="placeholder-text">${dict.status_encrypting.replace('{n}', lines.length)}</span>`;
        const b64 = (buf) => btoa(String.fromCharCode(...buf));

        const promises = lines.map(async (line) => {
            let prefix = "";
            let valToEncrypt = line.trim();
            const eqIndex = line.indexOf('=');
            if (eqIndex !== -1) {
                prefix = line.substring(0, eqIndex + 1);
                valToEncrypt = line.substring(eqIndex + 1).trim();
            }
            if (!valToEncrypt) return prefix;
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoder.encode(valToEncrypt));
            const arr = new Uint8Array(encrypted);
            const tag = arr.slice(arr.length - 16);
            const cipher = arr.slice(0, arr.length - 16);
            return `${prefix}aes:${b64(iv)}:${b64(tag)}:${b64(cipher)}`;
        });
        const encryptedLines = await Promise.all(promises);
        out.textContent = encryptedLines.join('\n');
        showToast("加密成功", 'success');
    } catch (e) {
        out.innerHTML = `<span class="placeholder-text error" style="color:var(--error)">❌ ${e.message}</span>`;
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function copy(id) {
    const el = document.getElementById(id);
    let text = el.textContent;
    // Don't copy placeholder
    if (el.querySelector('.placeholder-text') || !text) return;

    navigator.clipboard.writeText(text).then(() => {
        showToast(i18n[currentLang].toast_copied, 'success');
        const btn = el.closest('.output-area').querySelector('.btn-copy');
        if (btn) {
            btn.innerHTML = '<svg><use href="#icon-check"/></svg>';
            btn.style.color = 'var(--success)';
            setTimeout(() => {
                btn.innerHTML = '<svg><use href="#icon-copy"/></svg>';
                btn.style.color = 'var(--text-main)';
            }, 2000);
        }
    });
}

// Init
initTheme();
applyLang();
loadLicense();
generateRandom();
document.querySelectorAll('.copyright-year').forEach(el => {
    el.textContent = new Date().getFullYear();
});
