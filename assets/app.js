const SALT_STR = 'env_key_derivation_salt';
const ITERATIONS = 100000;

// I18n Dictionary
const i18n = {
    zh: {
        lang_btn: "English",
        header_sub: "部署辅助工具",
        t1_title: "🎲 随机密钥生成",
        t1_subtitle: "用于生成 64 位强度的 JWT_SECRET 或 ENCRYPTION_KEY。",
        t1_label: "生成的安全字符串 (64位)：",
        btn_regenerate: "重新生成",
        t2_title: "📦 Base64 编码",
        t2_subtitle: "将环境变量包装为 base64: 前缀格式。",
        t2_label: "输入原始变量：",
        t2_ph: "输入环境变量",
        t2_out_label: "编码输出：",
        t_hex_title: "🔡 Hex 编码",
        t_hex_subtitle: "将敏感值转换为十六进制 hex: 格式。",
        t3_title: "🔐 AES 批量加密",
        t3_subtitle: "支持多行 KEY=VALUE 解析。浏览器本地并行计算。",
        t3_secret_label: "根密钥 (明文 JWT_SECRET)：",
        t3_secret_ph: "填入刚才生成的 64 位密钥...",
        t3_target_label: "待加密环境变量 (支持多行、KEY=VALUE 格式)：",
        t3_target_ph: "示例\nabc@example.com\n- OAUTH_GOOGLE_CLIENT_ID=357284972762-oogleusercontent.com",
        t3_out_label: "AES 加密输出 (aes:iv:tag:cipher)：",
        ready_status: "准备就绪",
        btn_encrypt: "执行加密",
        footer_note: "私密本地计算 · 极致安全保障",
        err_missing: "❌ 请提供 JWT_SECRET 和 待加密值",
        t3_license_label: "授权码 (NODEAUTH_LICENSE - 选填)：",
        t3_license_ph: "填入您的授权码，以启用逻辑锁。若不填则使用默认盐值。",
        status_derive: "⚡ 正在派生根密钥 (100k PBKDF2)...",
        status_encrypting: "🔨 正在解析并加密 {n} 个条目...",
        btn_copy_tips: "点击复制"
    },
    en: {
        lang_btn: "简体中文",
        header_sub: "Deploy Helper",
        t1_title: "🎲 Random Secret Generator",
        t1_subtitle: "Used for high-strength JWT_SECRET or ENCRYPTION_KEY.",
        t1_label: "Generated Secure String (64-bit):",
        btn_regenerate: "Regenerate",
        t2_title: "📦 Base64 Encoder",
        t2_subtitle: "Wraps variables into base64: prefix format.",
        t2_label: "Input Plaintext:",
        t2_ph: "Enter environment variable",
        t2_out_label: "Encoded Output:",
        t_hex_title: "🔡 Hex Encoding",
        t_hex_subtitle: "Converts sensitive values into hex: format.",
        t3_title: "🔐 Batch AES Encryptor",
        t3_subtitle: "Supports KEY=VALUE parsing. Local calculation.",
        t3_secret_label: "Root Key (Plaintext JWT_SECRET):",
        t3_secret_ph: "Enter the generated 64-bit secret...",
        t3_target_label: "Target Variables (Multi-line, KEY=VALUE supported):",
        t3_target_ph: "Example\nabc@example.com\n- OAUTH_GOOGLE_CLIENT_ID=357284972762-oogleusercontent.com",
        t3_out_label: "AES Output (aes:iv:tag:cipher):",
        ready_status: "Ready",
        btn_encrypt: "Encrypt Now",
        footer_note: "Local Computation · Zero Data Transmission",
        err_missing: "❌ Please provide JWT_SECRET and values",
        t3_license_label: "License (NODEAUTH_LICENSE - Optional):",
        t3_license_ph: "Enter your license to enable logic lock. Leave empty to use default salt.",
        status_derive: "⚡ Deriving root key (100k PBKDF2)...",
        status_encrypting: "🔨 Encrypting {n} items...",
        btn_copy_tips: "Click to copy"
    }
};

let currentLang = 'zh';

function toggleLang() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    applyLang();
}

function applyLang() {
    const dict = i18n[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-placeholder]').forEach(el => {
        const key = el.getAttribute('data-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key]) el.title = dict[key];
    });
    document.getElementById('lang-btn').textContent = dict['lang_btn'];
}

function toggleTheme() {
    const body = document.body;
    const theme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-btn');
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('nodeauth-theme', theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('nodeauth-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-btn').textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

async function encryptAES() {
    const dict = i18n[currentLang];
    const secretStr = document.getElementById('aes-secret').value.trim();
    const targetArea = document.getElementById('aes-target').value;
    const out = document.getElementById('aes-out');
    if (!secretStr || !targetArea.trim()) {
        out.textContent = dict.err_missing;
        out.style.color = 'var(--error)';
        return;
    }
    try {
        const encoder = new TextEncoder();
        const secretBuf = encoder.encode(secretStr);
        const licenseValue = document.getElementById('aes-license').value.trim();

        out.textContent = dict.status_derive;
        out.style.color = 'var(--text-dim)';

        // 逻辑锁核心：派生授权关联特征盐 (与后端逻辑对齐)
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
        out.textContent = dict.status_encrypting.replace('{n}', lines.length);
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
        out.style.color = 'var(--success)';
    } catch (e) {
        out.textContent = `❌ ${dict.ready_status}: ${e.message}`;
        out.style.color = 'var(--error)';
    }
}

function generateRandom() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
    let result = '';
    const array = new Uint32Array(64);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 64; i++) {
        result += chars[array[i] % chars.length];
    }
    document.getElementById('random-out').textContent = result;
}

function encodeBase64() {
    const input = document.getElementById('b64-in').value;
    const out = document.getElementById('b64-out');
    if (!input) {
        out.textContent = '';
        return;
    }
    const b64 = btoa(unescape(encodeURIComponent(input)));
    out.textContent = `base64:${b64}`;
    out.style.color = 'var(--success)';
}

function encodeHex() {
    const input = document.getElementById('hex-in').value;
    const out = document.getElementById('hex-out');
    if (!input) {
        out.textContent = '';
        return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
    out.textContent = `hex:${hex}`;
    out.style.color = 'var(--success)';
}

function copy(id) {
    const el = document.getElementById(id);
    const text = el.textContent;
    if (!text || text === i18n[currentLang].ready_status) return;
    navigator.clipboard.writeText(text).then(() => {
        const btn = el.closest('.output-area').querySelector('.btn-copy');
        btn.innerHTML = '<svg><use href="#icon-check"/></svg>';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
            btn.innerHTML = '<svg><use href="#icon-copy"/></svg>';
            btn.style.background = 'var(--primary)';
        }, 2000);
    });
}

initTheme();
applyLang();
generateRandom();
