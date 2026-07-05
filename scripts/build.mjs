import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "config.json"), "utf8"));
const template = readFileSync(join(root, "src", "template.html"), "utf8");

function translateUrl(langCode, formUrl) {
  const params = new URLSearchParams({
    sl: "auto",
    tl: langCode,
    u: formUrl,
  });
  return `https://translate.google.com/translate?${params}`;
}

function formShortUrl(formUrl) {
  try {
    const { hostname, pathname } = new URL(formUrl);
    const path = pathname.replace(/^\//, "");
    return path ? `${hostname}/${path}` : hostname;
  } catch {
    return formUrl;
  }
}

const languageLinks = config.languages
  .map(
    ({ code, native, action }) => `
      <a class="lang" href="${translateUrl(code, config.formUrl)}">
        <span><span class="native">${native}</span><br><span class="action">${action}</span></span>
        <span class="arrow">→</span>
      </a>`
  )
  .join("\n");

const html = template
  .replaceAll("{{TITLE}}", config.title)
  .replaceAll("{{EYEBROW}}", config.eyebrow)
  .replaceAll("{{HEADING}}", config.heading)
  .replaceAll("{{SUBHEADING}}", config.subheading)
  .replaceAll("{{LANGUAGE_LINKS}}", languageLinks)
  .replaceAll("{{FOOTER_NOTE}}", config.footerNote)
  .replaceAll("{{FORM_SHORT_URL}}", formShortUrl(config.formUrl));

const outDir = join(root, "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html.trim() + "\n", "utf8");

console.log(`Built dist/index.html (${config.languages.length} languages)`);
