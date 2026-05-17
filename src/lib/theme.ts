export const DARK_MODE_KEY = "game-dark-mode";

const DARK_THEME_COLOR = "#36393f";
const LIGHT_THEME_COLOR = "#ffffff";

export function applyDarkMode(enabled: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", enabled);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", enabled ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}
