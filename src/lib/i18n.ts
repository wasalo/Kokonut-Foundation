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
  "home.title": "Growing Regenerative Farms Through Community Governance",
  "home.lede": "Real farms. Public data. Community governance. Regenerative value.",
  "home.cta.work": "Explore Our Work",
  "home.cta.impact": "View Live Impact",
  "home.cta.support": "Support Our Mission",
  "home.proof": "Foundation Proof",
  "home.pillars": "What Kokonut Foundation Does",
  "home.pillar1": "Regenerative Infrastructure",
  "home.pillar1d": "Create productive ecological systems rather than short-lived interventions.",
  "home.pillar2": "Community Governance",
  "home.pillar2d": "Use transparent participation and governance mechanisms.",
  "home.pillar3": "Public Verification",
  "home.pillar3d": "Connect physical activity to public evidence and data.",
  "how.title": "How It Works",
  "how.lede": "A regenerative value loop: capital funds farms, farms grow living assets, farm events become public data, and the model repeats.",
  "how.evidence": "Where the evidence comes from",
  "how.evidenceLede": "No single instrument can describe a whole farm. The evidence stack combines methods, and each one carries its own limits.",
  "how.boundaries": "Why the boundaries matter",
  "how.boundariesLede": "A sensor reading, a reviewed database record, an on-chain attestation, and an impact conclusion are four different things. The Foundation keeps them separate so a reader can tell evidence from interpretation.",
  "about.title": "About Kokonut Foundation",
  "about.lede": "Kokonut Foundation is the first nonprofit deploying the Kokonut Framework. It grows regenerative farms through community governance, public data and regenerative value.",
  "about.body": "The Foundation exists to make regenerative production legible and accountable: what was planned, what actually happened, what evidence supports it, and what remains uncertain. It is a public-interest institution, not a marketing surface for a token.",
  "about.solve": "What we are trying to solve",
  "about.solve1t": "Capital that reaches the land",
  "about.solve1d": "Funding for regenerative agriculture rarely arrives with the infrastructure, training, and patient structure that a farm actually needs.",
  "about.solve2t": "Evidence that survives scrutiny",
  "about.solve2d": "Claims about soil, harvests, revenue, and community benefit are easy to make and hard to check. We publish records with their method, source, reviewer, and limitations attached.",
  "about.solve3t": "Value that stays local",
  "about.solve3d": "Operators must retain authority over their land and their methods. Shared methodology and shared capital should support local execution, not replace it.",
  "about.commitments": "Our commitments",
  "about.c1": "Evidence before claims. We distinguish documented state, measurement, derived indicator, forecast, and interpretation — and we say which one we are using.",
  "about.c2": "Forecast and actual stay separate. Plans are not erased when reality arrives; both are visible so the next plan can improve.",
  "about.c3": "Open by default. Public information is easy to discover, link, and verify. Sensitive evidence stays private with consent, not hidden by default.",
  "about.c4": "Local authority. Farm operators decide how their land is worked. Shared standards exist to make farms comparable, not identical.",
  "about.c5": "Public-good framing. We describe allocations and contributions as public-good commitments, not as investor returns.",
  "support.title": "Support",
  "support.lede": "Multiple ways to contribute to regenerative production and public evidence.",
  "contact.title": "Contact",
  "contact.lede": "Get in touch with the Foundation — partnerships, media, research, or volunteering.",
  "impact.title": "Impact",
  "impact.lede": "From \"here is what we say happened\" to \"here is the measurement, methodology, source and evidence\".",
  "transparency.title": "Transparency",
  "transparency.lede": "Public accountability information, consolidated.",
  "partners.title": "Partners",
  "partners.lede": "Organizations collaborating with the Foundation.",
  "resources.title": "Resources",
  "resources.lede": "Reports, research, frameworks, guides, and methodologies.",
  "projects.title": "Projects",
  "projects.lede": "Real projects, real farms, real impact.",
  "farms.title": "Farms",
  "farms.lede": "Regenerative farms implementing the Kokonut Framework.",
  "explorer.title": "Explorer",
  "explorer.lede": "Explore Foundation data, impact, evidence, and transparency.",
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
  "home.title": "Cultivando Fincas Regenerativas a Través de Gobernanza Comunitaria",
  "home.lede": "Fincas reales. Datos públicos. Gobernanza comunitaria. Valor regenerativo.",
  "home.cta.work": "Explorar Nuestro Trabajo",
  "home.cta.impact": "Ver Impacto en Vivo",
  "home.cta.support": "Apoya Nuestra Misión",
  "home.proof": "Prueba de la Fundación",
  "home.pillars": "Qué Hace Kokonut Foundation",
  "home.pillar1": "Infraestructura Regenerativa",
  "home.pillar1d": "Crear sistemas ecológicos productivos en lugar de intervenciones breves.",
  "home.pillar2": "Gobernanza Comunitaria",
  "home.pillar2d": "Usar mecanismos transparentes de participación y gobernanza.",
  "home.pillar3": "Verificación Pública",
  "home.pillar3d": "Conectar la actividad física con evidencia y datos públicos.",
  "how.title": "Cómo Funciona",
  "how.lede": "Un ciclo de valor regenerativo: el capital financia fincas, las fincas cultivan activos vivos, la actividad se convierte en datos públicos, y el modelo se repite.",
  "how.evidence": "De dónde viene la evidencia",
  "how.evidenceLede": "Ningún instrumento describe por sí solo una finca completa. La pila de evidencia combina métodos, y cada uno tiene sus límites.",
  "how.boundaries": "Por qué importan los límites",
  "how.boundariesLede": "Una lectura de sensor, un registro revisado, una atestación on-chain y una conclusión de impacto son cuatro cosas distintas. La Fundación las mantiene separadas para que el lector pueda distinguir evidencia de interpretación.",
  "about.title": "Acerca de Kokonut Foundation",
  "about.lede": "Kokonut Foundation es la primera organización sin fines de lucro que implementa el Kokonut Framework. Cultiva fincas regenerativas a través de gobernanza comunitaria, datos públicos y valor regenerativo.",
  "about.body": "La Fundación existe para hacer la producción regenerativa legible y auditable: qué se planeó, qué ocurrió realmente, qué evidencia lo respalda y qué sigue siendo incierto. Es una institución de interés público, no una superficie de marketing para un token.",
  "about.solve": "Lo que intentamos resolver",
  "about.solve1t": "Capital que llega a la tierra",
  "about.solve1d": "El financiamiento de la agricultura regenerativa rara vez llega con la infraestructura, la capacitación y la estructura paciente que una finca realmente necesita.",
  "about.solve2t": "Evidencia que resiste el escrutinio",
  "about.solve2d": "Las afirmaciones sobre suelo, cosechas, ingresos y beneficio comunitario son fáciles de hacer y difíciles de verificar. Publicamos registros con su método, fuente, revisor y limitaciones.",
  "about.solve3t": "Valor que se queda local",
  "about.solve3d": "Los operadores deben conservar la autoridad sobre su tierra y sus métodos. Los estándares compartidos existen para hacer comparables las fincas, no idénticas.",
  "about.commitments": "Nuestros compromisos",
  "about.c1": "Evidencia antes que afirmaciones. Distinguimos estado documentado, medición, indicador derivado, pronóstico e interpretación — y decimos cuál estamos usando.",
  "about.c2": "Pronóstico y real permanecen separados. Los planes no se borran cuando llega la realidad; ambos son visibles para que el siguiente plan mejore.",
  "about.c3": "Abierto por defecto. La información pública es fácil de descubrir, enlazar y verificar. La evidencia sensible permanece privada con consentimiento, no oculta por defecto.",
  "about.c4": "Autoridad local. Los operadores de la finca deciden cómo se trabaja su tierra. Los estándares compartidos existen para hacer comparables las fincas, no idénticas.",
  "about.c5": "Encuadre de bien público. Describimos asignaciones y contribuciones como compromisos de bien público, no como retornos de inversión.",
  "support.title": "Apoyo",
  "support.lede": "Múltiples formas de contribuir a la producción regenerativa y a la evidencia pública.",
  "contact.title": "Contacto",
  "contact.lede": "Comunica con la Fundación — alianzas, medios, investigación o voluntariado.",
  "impact.title": "Impacto",
  "impact.lede": "De «esto es lo que decimos que ocurrió» a «aquí está la medición, la metodología, la fuente y la evidencia».",
  "transparency.title": "Transparencia",
  "transparency.lede": "Información de rendición de cuentas pública, consolidada.",
  "partners.title": "Socios",
  "partners.lede": "Organizaciones que colaboran con la Fundación.",
  "resources.title": "Recursos",
  "resources.lede": "Reportes, investigación, frameworks, guías y metodologías.",
  "projects.title": "Proyectos",
  "projects.lede": "Proyectos reales, fincas reales, impacto real.",
  "farms.title": "Fincas",
  "farms.lede": "Fincas regenerativas que implementan el Kokonut Framework.",
  "explorer.title": "Explorador",
  "explorer.lede": "Explora datos, impacto, evidencia y transparencia de la Fundación.",
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
