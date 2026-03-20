const THEME_ICON_SVG = {
    light_mode: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
    dark_mode: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>'
};

function setThemeIconElement(el, iconName) {
    if (!el) return;
    el.innerHTML = THEME_ICON_SVG[iconName];
}

window.toggleTheme = function () {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
};

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    const mobileIcon = document.getElementById('mobile-theme-icon');

    if (theme === 'light') {
        setThemeIconElement(icon, 'dark_mode');
        setThemeIconElement(mobileIcon, 'dark_mode');
    } else {
        setThemeIconElement(icon, 'light_mode');
        setThemeIconElement(mobileIcon, 'light_mode');
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    let theme = saved || (systemLight ? 'light' : 'dark');
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon(theme);
}
initTheme();

let pollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tg-login-btn').addEventListener('click', async () => {
        const btn = document.getElementById('tg-login-btn');
        const status = document.getElementById('status-msg');

        const popup = window.open('', '_blank');
        if (popup) {
            popup.document.write('Please wait...');
        }

        btn.disabled = true;
        status.innerText = 'Подключение...';
        status.style.color = 'var(--text-secondary)';

        try {
            const res = await fetch('/api/v1/auth/link', { method: 'POST' });
            if (!res.ok) throw new Error('API Error');

            const data = await res.json();

            if (popup) {
                popup.location.href = data.link;
            } else {
                window.location.href = data.link;
            }

            status.innerText = 'Ожидание в Telegram...';

            const token = data.token;
            pollInterval = setInterval(async () => {
                const check = await fetch(`/api/v1/auth/link/${token}`);
                if (check.ok) {
                    const d = await check.json();
                    if (d.status === 'confirmed') {
                        clearInterval(pollInterval);
                        status.innerText = 'Успешно!';
                        status.style.color = 'var(--primary)';

                        if (popup && !popup.closed) popup.close();

                        if (d.role === 'admin') window.location.href = '/admin';
                        else window.location.href = '/client';
                    }
                }
            }, 2000);

            setTimeout(() => {
                if (pollInterval) clearInterval(pollInterval);
                if (status.innerText !== 'Успешно!') {
                    btn.disabled = false;
                    status.innerText = 'Время истекло';
                    if (popup && !popup.closed) popup.close();
                }
            }, 60000);

        } catch (e) {
            console.error(e);
            status.innerText = 'Ошибка cоединения';
            btn.disabled = false;
            if (popup && !popup.closed) popup.close();
        }
    });
});
