// Mapping helpers for Kokonut Intelligence -> Foundation entities.
// KI payloads are loosely typed; we extract common fields defensively.

export function mapProject(p: any) {
  return {
    id: `ki_${p.id ?? p.slug ?? Math.random().toString(36).slice(2)}`,
    slug: (p.slug ?? p.name ?? p.id ?? "project").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: p.name ?? p.title ?? "Untitled Project",
    summary: p.summary ?? p.description ?? "",
    description: p.description ?? p.summary ?? "",
    status: p.status ?? "active",
    projectType: p.projectType ?? p.type ?? "Project",
    country: p.country ?? p.location?.country ?? "Unknown",
    region: p.region ?? p.location?.region ?? null,
    latitude: p.latitude ?? p.location?.latitude ?? null,
    longitude: p.longitude ?? p.location?.longitude ?? null,
    impactAreas: JSON.stringify(p.impactAreas ?? []),
    sdgs: JSON.stringify(p.sdgs ?? []),
  };
}

export function mapMetric(m: any, projectId?: string) {
  return {
    id: `ki_${m.id ?? m.slug ?? Math.random().toString(36).slice(2)}`,
    slug: (m.slug ?? m.name ?? m.id ?? "metric").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: m.name ?? m.title ?? "Metric",
    description: m.description ?? "",
    category: m.category ?? "General",
    value: Number(m.value ?? 0),
    unit: m.unit ?? "",
    projectId: projectId ?? m.projectId ?? null,
    observedAt: m.observedAt ?? m.measuredAt ?? null,
    source: "Kokonut Intelligence",
    verificationStatus: m.verificationStatus ?? "reported",
  };
}

export function mapMeasurement(m: any, metricId: string, projectId?: string) {
  return {
    id: `ki_${m.id ?? Math.random().toString(36).slice(2)}`,
    metricId,
    projectId: projectId ?? m.projectId ?? null,
    value: Number(m.value ?? 0),
    observedAt: m.observedAt ?? m.measuredAt ?? new Date().toISOString(),
    source: "Kokonut Intelligence",
    verificationStatus: m.verificationStatus ?? "reported",
  };
}
