// Данные модов (downloadUrl указывает на файлы в папке mods)
const modsData = [
    { 
        id: 1, 
        icon: "⚔️", 
        title: "Epic Combat Overhaul", 
        desc: "Полная переработка боевой системы — удары, блоки, спецэффекты.", 
        game: "Skyrim", 
        downloads: "12.4k",
        downloadUrl: "mods/epic-combat.zip",  // ← файл в папке mods
        fileName: "epic-combat.zip",
        fileSize: "45.2 MB"
    },
    { 
        id: 2, 
        icon: "🚗", 
        title: "Realistic Vehicle Pack", 
        desc: "Физика и модели авто как в реальной жизни. 30+ машин.", 
        game: "GTA V", 
        downloads: "8.2k",
        downloadUrl: "mods/realistic-vehicles.zip",  // ← файл в папке mods
        fileName: "realistic-vehicles.zip",
        fileSize: "128.7 MB"
    },
    { 
        id: 3, 
        icon: "🌿", 
        title: "Verdant World", 
        desc: "Ультра реалистичная трава, деревья и тени.", 
        game: "Minecraft", 
        downloads: "21k",
        downloadUrl: "mods/verdant-world.zip",  // ← файл в папке mods
        fileName: "verdant-world.zip",
        fileSize: "89.3 MB"
    },
    { 
        id: 4, 
        icon: "🧙", 
        title: "Magic Expansion", 
        desc: "Новые заклинания и магические школы.", 
        game: "Skyrim", 
        downloads: "5.7k",
        downloadUrl: "mods/magic-expansion.zip",  // ← файл в папке mods
        fileName: "magic-expansion.zip",
        fileSize: "34.1 MB"
    },
];

// Новостная лента
const newsData = [
    { id: 1, date: "2 апреля 2026", title: "Выход Skywind Remastered", excerpt: "Мод, который переносит Morrowind на новый движок, получил бета-версию." },
    { id: 2, date: "30 марта 2026", title: "Cyberpunk 2077 — MegaPatch 2.0", excerpt: "Исправлено более 200 багов, добавлена новая графика и ИИ." },
    { id: 3, date: "28 марта 2026", title: "Stardew Valley: Expanded 1.6", excerpt: "Огромное дополнение с новыми NPC, локациями и событиями." },
    { id: 4, date: "25 марта 2026", title: "Minecraft: Create 6.0", excerpt: "Новые механизмы, паровые двигатели и автоматизация." },
    { id: 5, date: "22 марта 2026", title: "The Witcher 3 — HD Reworked", excerpt: "Полная переработка текстур и освещения для следующего поколения." },
    { id: 6, date: "20 марта 2026", title: "Fallout: London выходит в мае", excerpt: "Огромный мод с новым сюжетом, озвучкой и локациями." },
];

// 🔽 ФУНКЦИЯ СКАЧИВАНИЯ ИЗ ПАПКИ MODS 🔽
function downloadMod(mod) {
    // Формируем полный URL для скачивания
    let downloadUrl = mod.downloadUrl;
    
    // Если ссылка относительная, добавляем текущий путь
    if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://') && !downloadUrl.startsWith('/')) {
        // Получаем текущий путь (для случая если сайт в подпапке)
        const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        downloadUrl = currentPath + mod.downloadUrl;
    }
    
    // Проверяем существование файла через fetch (опционально)
    checkFileExists(downloadUrl).then(exists => {
        if (exists) {
            // Файл существует — запускаем скачивание
            startDownload(downloadUrl, mod);
        } else {
            // Файл не найден — показываем ошибку
            showNotification(
                `❌ Файл не найден: ${mod.fileName}\n\nЗагрузите файл в папку /mods/ на сервере.`,
                'error'
            );
        }
    }).catch(() => {
        // Если проверка не удалась (CORS и т.д.), всё равно пробуем скачать
        startDownload(downloadUrl, mod);
    });
}

// Проверка существования файла на сервере
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.warn('Не удалось проверить файл:', error);
        return true; // Возвращаем true, чтобы не блокировать скачивание
    }
}

// Запуск скачивания
function startDownload(url, mod) {
    try {
        // Создаём временную ссылку
        const link = document.createElement('a');
        link.href = url;
        link.download = mod.fileName || `${mod.title.toLowerCase().replace(/ /g, '-')}.zip`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Показываем уведомление
        showNotification(
            `✅ Начато скачивание: ${mod.title}\n📦 Размер: ${mod.fileSize || 'неизвестен'}\n💾 Сохранится в папку "Загрузки"`,
            'success'
        );
        
        // Увеличиваем счётчик
        increaseDownloadCount(mod.id);
        
    } catch (error) {
        console.error('Ошибка скачивания:', error);
        // Альтернативный способ: открыть в новой вкладке
        window.open(url, '_blank');
        showNotification(`📥 Скачивание ${mod.title} начато в новой вкладке`, 'success');
    }
}

// 📊 Счётчик скачиваний
function increaseDownloadCount(modId) {
    const mod = modsData.find(m => m.id === modId);
    if (mod) {
        const currentDownloads = parseInt(mod.downloads.replace('k', '')) * 1000;
        const newDownloads = currentDownloads + 1;
        if (newDownloads >= 1000) {
            mod.downloads = (newDownloads / 1000).toFixed(1) + 'k';
        } else {
            mod.downloads = newDownloads.toString();
        }
        renderMods();
    }
}

// 🔔 Уведомления
function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.download-notification');
    if (oldNotification) oldNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `download-notification download-notification--${type}`;
    
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || '📦'}</span>
        <span class="notification-text">${message.replace(/\n/g, '<br>')}</span>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Рендер модов
function renderMods() {
    const grid = document.getElementById('modsGrid');
    if (!grid) return;
    
    grid.innerHTML = modsData.map(mod => `
        <div class="mod-card" data-mod-id="${mod.id}">
            <div class="mod-icon">${mod.icon}</div>
            <h3 class="mod-title">${mod.title}</h3>
            <p class="mod-desc">${mod.desc}</p>
            <div class="mod-meta">
                <span>🎮 ${mod.game}</span>
                <span>⬇️ ${mod.downloads}</span>
            </div>
            <button class="mod-download-btn" data-id="${mod.id}">
                📥 Скачать мод
                ${mod.fileSize ? `<span class="download-size">${mod.fileSize}</span>` : ''}
            </button>
        </div>
    `).join('');
    
    // Обработчики на кнопки
    document.querySelectorAll('.mod-download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modId = parseInt(btn.dataset.id);
            const mod = modsData.find(m => m.id === modId);
            if (mod) downloadMod(mod);
        });
    });
    
    // Клик по карточке
    document.querySelectorAll('.mod-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('mod-download-btn') && 
                !e.target.classList.contains('download-size')) {
                const modId = parseInt(card.dataset.modId);
                const mod = modsData.find(m => m.id === modId);
                if (mod) downloadMod(mod);
            }
        });
    });
}

// Рендер новостей
function renderNews() {
    const newsContainer = document.getElementById('newsGrid');
    if (!newsContainer) return;
    
    newsContainer.style.opacity = '0';
    
    setTimeout(() => {
        newsContainer.innerHTML = newsData.map((article) => `
            <article class="news-card" data-id="${article.id}">
                <span class="news-date">${article.date}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.excerpt}</p>
            </article>
        `).join('');
        
        newsContainer.style.opacity = '1';
    }, 100);
}

// Навигация (остаётся без изменений)
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(`${pageId}-page`);
    if (activePage) activePage.classList.add('active');
    
    document.querySelectorAll('.nav__link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) link.classList.add('active');
    });
    
    history.pushState({ page: pageId }, '', `#${pageId}`);
}

function initNavigation() {
    document.querySelectorAll('[data-page]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(trigger.dataset.page);
        });
    });
    
    const hash = window.location.hash.slice(1);
    navigateTo(hash === 'news' ? 'news' : 'home');
    
    window.addEventListener('popstate', (e) => {
        navigateTo(e.state?.page || 'home');
    });
}

// Тёмная тема
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        toggle.textContent = '☀️';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggle.textContent = isDark ? '☀️' : '🌙';
    });
}

// Мобильное меню
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    if (btn && nav) {
        btn.addEventListener('click', () => nav.classList.toggle('open'));
        nav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => nav.classList.remove('open'));
        });
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    renderMods();
    renderNews();
    initNavigation();
    initTheme();
    initMobileMenu();
    console.log('✨ Сайт готов — моды скачиваются из папки /mods/');
});