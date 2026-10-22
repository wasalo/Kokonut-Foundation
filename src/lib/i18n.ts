/**
 * Minimal locale layer.
 *
 * Astro's i18n routing already serves every route under /es/ (prefixDefaultLocale:
 * false), so pages are written once and read their strings from here. This keeps
 * "data" separate from "localized presentation" as the PRD requires, and means
 * adding a page never requires duplicating it per locale.
 */

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function normalizeLocale(value?: string | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? "") ? (value as Locale) : DEFAULT_LOCALE;
}

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.how": "How It Works",
  "nav.projects": "Projects",
  "nav.impact": "Impact",
  "nav.transparency": "Transparency",
  "nav.partners": "Partners",
  "nav.resources": "Resources",
  "nav.about": "About",
  "nav.support": "Support",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "nav.explorer": "Explorer",
  "nav.data": "Data",
  "nav.search": "Search",
  "nav.treasury": "Treasury",
  "nav.governance": "Governance",
  "nav.attestations": "Attestations",
  "nav.reports": "Reports",
  "nav.funding": "Funding",
  "nav.methodologies": "Methodologies",
  "nav.openSource": "Open Source",
  "nav.evidence": "Evidence",
  "nav.graph": "Graph",
  "nav.impactMethodology": "Methodology",
  "footer.rights": "Open by default.",
  "footer.transparency": "Transparency",
  "theme.toggle": "Toggle dark mode",
  "theme.light": "Switch to light mode",
  "theme.dark": "Switch to dark mode",
  "common.explore": "Explore",
  "common.learnMore": "Learn more",
  "common.viewAll": "View all",
  "common.download": "Download",
  "common.readMore": "Read more",
  "common.verified": "verified",
  "common.reported": "reported",
  "common.source": "Source",
  "a11y.skip": "Skip to content",
};

const es: Dict = {
  "nav.home": "Inicio",
  "nav.how": "Cómo Funciona",
  "nav.projects": "Proyectos",
  "nav.impact": "Impacto",
  "nav.transparency": "Transparencia",
  "nav.partners": "Socios",
  "nav.resources": "Recursos",
  "nav.about": "Acerca de",
  "nav.support": "Apoyo",
  "nav.contact": "Contacto",
  "nav.menu": "Menú",
  "nav.explorer": "Explorador",
  "nav.data": "Datos",
  "nav.search": "Buscar",
  "nav.treasury": "Tesorería",
  "nav.governance": "Gobernanza",
  "nav.attestations": "Atestaciones",
  "nav.reports": "Reportes",
  "nav.funding": "Financiamiento",
  "nav.methodologies": "Metodologías",
  "nav.openSource": "Código Abierto",
  "nav.evidence": "Evidencia",
  "nav.graph": "Grafo",
  "nav.impactMethodology": "Metodología",
  "footer.rights": "Abierto por defecto.",
  "footer.transparency": "Transparencia",
  "theme.toggle": "Alternar modo oscuro",
  "theme.light": "Cambiar a modo claro",
  "theme.dark": "Cambiar a modo oscuro",
  "common.explore": "Explorar",
  "common.learnMore": "Más información",
  "common.viewAll": "Ver todo",
  "common.download": "Descargar",
  "common.readMore": "Leer más",
  "common.verified": "verificado",
  "common.reported": "reportado",
  "common.source": "Fuente",
  "a11y.skip": "Saltar al contenido",
};

const dictionaries: Record<Locale, Dict> = { en, es };

export function getTranslator(locale?: string | null) {
  const loc = normalizeLocale(locale);
  const dict = dictionaries[loc];
  const fallback = dictionaries[DEFAULT_LOCALE];
  return (key: string) => dict[key] ?? fallback[key] ?? key;
}

/** Localized path helper — keeps the locale prefix consistent. */
export function localePath(locale: string | null | undefined, path: string): string {
  const loc = normalizeLocale(locale);
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (loc === DEFAULT_LOCALE) return clean;
  return `/${loc}${clean}`;
}

/**
 * Resolves the active locale for a page. The middleware sets `locals.locale`
 * when it handles a locale-prefixed request; Astro's own `currentLocale` is the
 * fallback for statically prerendered routes.
 */
export function resolveLocale(astro: {
  currentLocale?: string;
  locals?: Record<string, unknown>;
  request?: { headers?: { get(name: string): string | null } };
}): Locale {
  // The locale header is set by the middleware when it rewrites a
  // locale-prefixed request; it is the authoritative signal.
  const fromHeader = astro.request?.headers?.get("x-kokonut-locale");
  if (fromHeader && (LOCALES as readonly string[]).includes(fromHeader)) {
    return fromHeader as Locale;
  }
  const fromLocals = astro.locals?.locale;
  if (typeof fromLocals === "string" && (LOCALES as readonly string[]).includes(fromLocals)) {
    return fromLocals as Locale;
  }
  return normalizeLocale(astro.currentLocale);
}
