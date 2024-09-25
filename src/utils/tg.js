export function initTg() {
    if (window.Telegram?.WebApp) {
        window.Telegram?.WebApp.expand();
        window.Telegram?.WebApp.disableVerticalSwipes();
        window.Telegram?.WebApp.setHeaderColor('#000000');
        window.Telegram?.WebApp.setBackgroundColor('#000000');
        window.Telegram?.WebApp.MainButton?.hide();
        window.Telegram?.WebApp.ready();
    }
}