import { describe, it, expect } from "vitest";
import { render } from "../support/render";
import Button from "@components/primitives/Button.astro";
import Card from "@components/primitives/Card.astro";
import Badge from "@components/primitives/Badge.astro";
import Link from "@components/primitives/Link.astro";
import Metric from "@components/primitives/Metric.astro";
import ImpactMetric from "@components/domain/ImpactMetric.astro";
import EvidenceCard from "@components/domain/EvidenceCard.astro";
import AttestationCard from "@components/domain/AttestationCard.astro";
import SDGBadge from "@components/domain/SDGBadge.astro";

describe("Button", () => {
  it("renders an anchor when given an href", async () => {
    const html = await render(Button, { props: { href: "/projects" }, slots: { default: "Explore" } });
    expect(html).toContain('<a href="/projects"');
    expect(html).toContain("Explore");
    expect(html).not.toContain("<button");
  });

  it("renders a button when no href is given", async () => {
    const html = await render(Button, { props: {}, slots: { default: "Go" } });
    expect(html).toContain('<button type="button"');
    expect(html).not.toContain("<a ");
  });

  it("honours the button type", async () => {
    const html = await render(Button, { props: { type: "submit" }, slots: { default: "Save" } });
    expect(html).toContain('type="submit"');
  });

  it("applies the variant classes", async () => {
    const primary = await render(Button, { props: { variant: "primary" }, slots: { default: "x" } });
    expect(primary).toContain("bg-primary");
    const ghost = await render(Button, { props: { variant: "ghost" }, slots: { default: "x" } });
    expect(ghost).toContain("text-primary");
    expect(ghost).not.toContain("bg-primary text-on-primary");
  });
});

describe("Card", () => {
  it("renders its children and accepts an extra class", async () => {
    const html = await render(Card, { props: { class: "extra-class" }, slots: { default: "Inner" } });
    expect(html).toContain("Inner");
    expect(html).toContain("extra-class");
    expect(html).toContain("rounded-lg");
  });
});

describe("Badge", () => {
  it("renders the slot and the default tone", async () => {
    const html = await render(Badge, { slots: { default: "Published" } });
    expect(html).toContain("Published");
    expect(html).toContain("bg-surface-muted");
  });

  it("applies the requested tone", async () => {
    const html = await render(Badge, { props: { tone: "warn" }, slots: { default: "Draft" } });
    expect(html).toContain("bg-secondary/20");
  });
});

describe("Link", () => {
  it("renders an internal link without target", async () => {
    const html = await render(Link, { props: { href: "/about" }, slots: { default: "About" } });
    expect(html).toContain('href="/about"');
    expect(html).toContain("About");
    expect(html).not.toContain("target=");
  });

  it("opens external links safely", async () => {
    const html = await render(Link, { props: { href: "https://example.org", external: true }, slots: { default: "Out" } });
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
  });
});

describe("Metric", () => {
  it("renders the value, unit and label", async () => {
    const html = await render(Metric, { props: { value: 96, unit: "trees", label: "Coconut trees" } });
    expect(html).toContain("96");
    expect(html).toContain("trees");
    expect(html).toContain("Coconut trees");
  });

  it("omits the unit when there is none", async () => {
    const html = await render(Metric, { props: { value: 12, label: "Hectares" } });
    expect(html).toContain("12");
    expect(html).not.toContain("<span class=\"text-xl ml-1\">");
  });
});

describe("ImpactMetric", () => {
  it("renders the value, label, verification status and source", async () => {
    const html = await render(ImpactMetric, {
      props: { value: 96, unit: "trees", label: "Coconut trees", verificationStatus: "verified", source: "Field count" },
    });
    expect(html).toContain("96");
    expect(html).toContain("trees");
    expect(html).toContain("Coconut trees");
    expect(html).toContain("verified");
    expect(html).toContain("Field count");
  });

  it("omits the verification badge and source when they are not given", async () => {
    const html = await render(ImpactMetric, { props: { value: 1, label: "Simple" } });
    expect(html).not.toContain("bg-surface-muted text-muted");
    expect(html).not.toContain("Source:");
  });
});

describe("EvidenceCard", () => {
  it("renders the title and the evidence metadata", async () => {
    const html = await render(EvidenceCard, {
      props: { title: "Soil survey", type: "Field note", evidenceClass: "measurement", maturity: "reviewed", visibility: "public" },
    });
    expect(html).toContain("Soil survey");
    expect(html).toContain("Field note");
    expect(html).toContain("measurement");
    expect(html).toContain("reviewed");
    expect(html).toContain("public");
  });

  it("renders a link only when an href is given", async () => {
    const withLink = await render(EvidenceCard, { props: { title: "T", href: "/explorer/evidence" } });
    expect(withLink).toContain('href="/explorer/evidence"');
    const without = await render(EvidenceCard, { props: { title: "T" } });
    expect(without).not.toContain("View →");
  });
});

describe("AttestationCard", () => {
  it("renders the title, source and status", async () => {
    const html = await render(AttestationCard, { props: { title: "Baseline", source: "EAS", status: "attested" } });
    expect(html).toContain("Baseline");
    expect(html).toContain("EAS");
    expect(html).toContain("attested");
  });

  it("renders the uid when present", async () => {
    const html = await render(AttestationCard, { props: { title: "T", uid: "0xabc123" } });
    expect(html).toContain("0xabc123");
  });
});

describe("SDGBadge", () => {
  it("renders the SDG number", async () => {
    const html = await render(SDGBadge, { props: { sdg: 15 } });
    expect(html).toContain("SDG 15");
  });
});
