# Kokonut Foundation
## Cloudflare-Native Web Platform — Product Requirements Document

**Product:** Kokonut Foundation Web Platform  
**Domain:** `kokonut.foundation`  
**Document Version:** 2.0  
**Status:** Proposed  
**Primary Infrastructure:** Cloudflare Developer Platform  
**Primary Runtime:** Cloudflare Workers  
**Frontend Framework:** Astro + TypeScript  
**Architecture:** Static-first, dynamic where valuable  
**Migration Source:** WordPress  
**Primary Objective:** Replace the existing WordPress website with a modern, high-performance, Cloudflare-native web platform capable of evolving into the public transparency, impact, project, and institutional interface for Kokonut Foundation.

---

# 1. Executive Summary

Kokonut Foundation currently presents itself as a community-governed organization focused on growing regenerative farms and connecting real-world agricultural assets, public data, governance, and public-good funding.

The existing website communicates a concise model:

**Fund → Grow → Verify → Repeat**

It presents Kokonut Foundation as the first nonprofit deploying the Kokonut Framework and highlights live farm activity at Adelphi in the Dominican Republic, community governance, public verification, and public-good funding.

The next version should not simply reproduce that WordPress website using a newer frontend framework.

The objective is to build a **Cloudflare-native Foundation Platform**.

The platform should initially function as an exceptionally fast institutional website, while its architecture allows it to progressively become a live interface for:

- regenerative agriculture projects;
- natural assets;
- Foundation programs;
- measurable impact;
- public reports;
- governance;
- treasury transparency;
- partnerships;
- grants and public-good funding;
- farm evidence;
- MRV data;
- EAS attestations;
- Kokonut Intelligence data;
- Foundation resources;
- institutional communications.

The production application should not require WordPress, PHP, MySQL, a conventional application server, or an external CMS.

The core technology stack will reside on Cloudflare infrastructure.

Cloudflare Workers will serve the application runtime while Workers Static Assets serves pre-rendered HTML, CSS, JavaScript and other static resources. Cloudflare supports deploying Worker code and static assets together as a single application distributed across its network.

The proposed architecture combines:

**Astro + TypeScript + Cloudflare Workers + D1 + R2 + KV + Queues + Workflows + Access + Turnstile + Cloudflare Analytics and Observability.**

---

# 2. Product Vision

## 2.1 Vision

Create the public digital headquarters of Kokonut Foundation.

The platform should make it possible for someone to move through five stages:

**Understand → Explore → Verify → Trust → Participate**

A first-time visitor should quickly understand what the Foundation does.

A potential partner should be able to understand how collaboration works.

A researcher should be able to inspect methodologies and evidence.

A community member should be able to understand governance.

A donor or funder should be able to understand where capital goes.

A technically sophisticated visitor should eventually be able to independently inspect the underlying data.

---

# 3. Product Definition

The target product is:

> **A Cloudflare-native public platform for explaining, demonstrating, measuring, and verifying how Kokonut Foundation uses regenerative natural assets, community governance, open data, and technology to create lasting public value.**

The platform is not simply a marketing website.

It is the public interface to the Foundation ecosystem.

---

# 4. Current Website Baseline

The current site establishes several important concepts that should remain central to the new product.

The homepage currently communicates:

- “Growing Regenerative Farms Through Community Governance”
- a community-governed Web3 cooperative model;
- real farms;
- public data;
- regenerative agriculture;
- a live farm example at Adelphi;
- community governance;
- transparent treasury;
- public-good funding;
- Fund → Grow → Verify → Repeat;
- links to Kokonut Network;
- links to live farm data;
- community participation.

The rewrite should preserve this clarity while significantly expanding discoverability, transparency, usability, and structured data.

---

# 5. Strategic Product Change

The most important architectural change is:

> **Stop treating Foundation information as WordPress pages and start treating it as structured data.**

The application should understand concepts including:

- Project
- Farm
- Natural Asset
- Metric
- Measurement
- Milestone
- Evidence
- Attestation
- Partner
- Program
- Report
- Resource
- Team Member
- Funding Event
- Public-Good Contribution
- Governance Reference

as real entities.

This is the foundation for everything that follows.

---

# 6. Objectives

## 6.1 Replace WordPress

Eliminate the public production dependency on:

- WordPress;
- PHP;
- WordPress plugins;
- WordPress themes;
- WordPress MySQL;
- WordPress admin;
- conventional origin hosting.

---

## 6.2 Adopt Cloudflare as the Core Infrastructure Platform

The production system should use Cloudflare wherever the platform provides the required capability.

Primary services:

| Requirement | Cloudflare Service |
|---|---|
| Application runtime | Workers |
| Static web delivery | Workers Static Assets |
| Relational data | D1 |
| Object/file storage | R2 |
| Edge key-value data | Workers KV |
| Background processing | Queues |
| Durable multi-step jobs | Workflows |
| Stateful coordination | Durable Objects when justified |
| Human verification | Turnstile |
| Internal application access | Cloudflare Access |
| DNS | Cloudflare DNS |
| CDN | Cloudflare Network |
| WAF | Cloudflare WAF |
| DDoS protection | Cloudflare |
| Analytics | Cloudflare Web Analytics |
| Runtime logs | Workers Logs |
| Tracing | Workers Traces |
| Secrets | Worker Secrets |
| Deployment | Wrangler / Workers Builds |
| Image optimization | Cloudflare image infrastructure |

---

# 7. Product Principles

## Static First

Content that does not need request-time rendering should be generated ahead of time.

## Dynamic When Valuable

Use Workers where runtime execution creates meaningful product value.

## Structured Before Visual

Foundation data should have schemas independent of presentation.

## Evidence Before Claims

Important impact claims should progressively connect to supporting evidence.

## Open by Default

Public-interest information should be easy to discover and link.

## Privacy by Default

Collect the minimum user data required.

## Accessible by Default

Accessibility should be part of component design, not a final audit step.

## Cloudflare Native

Avoid adding infrastructure vendors when equivalent functionality can reasonably live on Cloudflare.

## Progressive Complexity

Casual visitors should not need to understand Web3 infrastructure to understand the Foundation.

Technical visitors should still be able to inspect it.

---

# 8. Target Audiences

## General Public

Needs to understand:

- what Kokonut Foundation does;
- why regenerative farms matter;
- how the model works;
- what has been accomplished.

## Community Members

Needs:

- governance information;
- project activity;
- Foundation updates;
- community links;
- public data.

## NGOs and Nonprofits

Needs:

- partnership models;
- program information;
- implementation methodology;
- Foundation capabilities.

## Public-Goods Funders

Needs:

- funding outcomes;
- transparency;
- metrics;
- reports;
- evidence.

## ReFi and Web3 Ecosystems

Needs:

- governance;
- on-chain transparency;
- attestations;
- public infrastructure;
- implementation examples.

## Researchers

Needs:

- methodologies;
- datasets;
- reports;
- impact measurements;
- historical data.

## Regenerative Agriculture Organizations

Needs:

- farm implementation details;
- agricultural methodologies;
- project outcomes;
- lessons learned.

## Institutional Partners

Needs:

- organizational credibility;
- governance information;
- reports;
- compliance information;
- contact pathways.

---

# 9. Core User Journey

The preferred user journey is:

```text
LAND
 │
 ▼
UNDERSTAND
"What does Kokonut Foundation do?"
 │
 ▼
EXPLORE
"What projects exist?"
 │
 ▼
MEASURE
"What has happened?"
 │
 ▼
VERIFY
"Where is the evidence?"
 │
 ▼
TRUST
"How is this governed?"
 │
 ▼
PARTICIPATE
"How can I help?"
```

---

# 10. Information Architecture

Recommended primary navigation:

```text
Home
How It Works
Projects
Impact
Transparency
Partners
Resources
About
Support
```

Secondary navigation:

```text
Community
Governance
Reports
Technology
Contact
```

---

# 11. Route Architecture

```text
/

/how-it-works

/projects
/projects/[slug]

/impact
/impact/[metric]
/impact/methodology

/transparency
/transparency/treasury
/transparency/governance
/transparency/attestations
/transparency/reports

/partners
/partners/[slug]

/resources
/resources/[slug]

/about
/about/team
/about/foundation

/support

/contact

/admin/*
```

Future:

```text
/data
/api/v1/*
/explorer
/farms
/farms/[slug]
```

---

# 12. Homepage Requirements

The homepage should tell the entire Foundation story at a high level without becoming excessively long.

## 12.1 Hero

Primary message:

**Growing Regenerative Farms Through Community Governance**

Supporting concept:

Real farms.  
Public data.  
Community governance.  
Regenerative value.

Primary CTA:

**Explore Our Work**

Secondary CTA:

**View Live Impact**

Tertiary link:

**Support Our Mission**

---

# 13. Foundation Proof Layer

Immediately after the hero, display evidence that this is a functioning project rather than a conceptual initiative.

The existing website currently highlights live measurements such as farm area, coconut trees, hens, community size, SDGs and public-good funding.

The redesigned version should retrieve approved metrics from structured data.

Example:

```text
15,725 m²
Regenerative Farm

96
Coconut Trees

110
Free-Range Hens

5
SDGs Addressed

3,000+
Community Members
```

Each metric should be capable of containing:

```text
value
unit
label
description
source
measured_at
updated_at
verification_status
evidence_url
methodology
```

---

# 14. What Kokonut Foundation Does

Introduce three core pillars.

## Regenerative Infrastructure

Create productive ecological systems rather than short-lived interventions.

## Community Governance

Use transparent participation and governance mechanisms.

## Public Verification

Connect physical activity to public evidence and data.

This preserves the three-part logic already visible on the existing website: live farm proof, community governance and public-good orientation.

---

# 15. How It Works

Primary model:

```text
FUND
  │
  ▼
GROW
  │
  ▼
VERIFY
  │
  ▼
REPEAT
  └──────────────►
```

## Fund

Resources are directed toward regenerative productive capacity.

## Grow

Approved farms implement regenerative agriculture, infrastructure, training and management.

## Verify

Farm activity generates measurable evidence.

Sources may eventually include:

- field observations;
- satellite data;
- drone imagery;
- harvest records;
- soil readings;
- financial records;
- photographs;
- geospatial evidence;
- attestations.

## Repeat

Regenerative productive systems continue generating ecological, economic and social value.

The current website already uses this four-step model, so it should become one of the new application's central visual components.

---

# 16. Projects

Route:

`/projects`

Projects become first-class application entities.

Users should be able to:

- browse projects;
- filter projects;
- inspect project status;
- view metrics;
- see milestones;
- inspect supporting evidence;
- view related resources;
- identify partners.

Potential filters:

```text
Status
Country
Project Type
SDG
Year
Impact Area
```

---

# 17. Project Data Model

Minimum project schema:

```ts
interface Project {
  id: string;
  slug: string;
  name: string;

  summary: string;
  description: string;

  status:
    | "planned"
    | "active"
    | "completed"
    | "paused"
    | "archived";

  projectType: string;

  country: string;
  region?: string;

  latitude?: number;
  longitude?: number;

  startDate?: string;
  endDate?: string;

  heroImage?: string;

  impactAreas: string[];
  sdgs: number[];

  partners: string[];
  metrics: string[];
  milestones: string[];
  resources: string[];

  createdAt: string;
  updatedAt: string;
}
```

---

# 18. Project Detail

Route:

`/projects/[slug]`

Each project page should include:

## Overview

Plain-language explanation.

## Purpose

Why the project exists.

## Location

Map and geographical context where appropriate.

## Status

Current lifecycle state.

## Timeline

Project milestones.

## Natural Assets

Relevant productive and ecological assets.

## Impact

Measured project outcomes.

## Evidence

Supporting documentation.

## Partners

Participating entities.

## Resources

Reports, articles and documents.

## Verification

Relevant attestations or Kokonut Intelligence references.

---

# 19. Impact Platform

Route:

`/impact`

The Impact section should eventually become one of the most valuable parts of the application.

It should move the visitor from:

> “Here is what we say happened.”

toward:

> “Here is the measurement, methodology, source and evidence.”

---

# 20. Impact Categories

Recommended top-level model:

## Ecology

Potential metrics:

- regenerative area;
- trees;
- soil;
- biodiversity;
- water;
- carbon;
- habitat.

## Agriculture

- harvests;
- crop production;
- yields;
- production cycles;
- animal production.

## Community

- participants;
- farmers;
- workers;
- youth activities;
- training;
- community engagement.

## Economic

- capital deployed;
- farm revenue;
- operating expenditure;
- productive assets;
- local purchasing.

## Public Goods

- programs funded;
- public-good contributions;
- open-source outputs;
- grants;
- community infrastructure.

---

# 21. Metric Model

Each metric should support:

```ts
interface ImpactMetric {
  id: string;
  slug: string;

  name: string;
  description: string;

  category: string;

  value: number;
  unit: string;

  projectId?: string;

  observedAt?: string;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;

  methodology?: string;
  source?: string;

  confidence?: number;

  verificationStatus:
    | "reported"
    | "reviewed"
    | "verified"
    | "attested";

  evidenceIds?: string[];

  updatedAt: string;
}
```

---

# 22. Evidence System

Evidence should become its own entity.

Example sources:

```text
Photograph
Document
Invoice
Satellite Image
Drone Image
Soil Test
Harvest Record
Field Observation
Dataset
Attestation
Public Transaction
Report
```

Schema:

```ts
interface Evidence {
  id: string;
  type: string;

  title: string;
  description?: string;

  projectId?: string;
  metricId?: string;

  objectKey?: string;
  externalUrl?: string;

  capturedAt?: string;
  uploadedAt: string;

  hash?: string;

  visibility:
    | "public"
    | "restricted"
    | "private";
}
```

Public evidence files should normally live in Cloudflare R2.

Cloudflare describes R2 as its object-storage service for unstructured data and provides direct Workers bindings and S3-compatible APIs.

---

# 23. Transparency Portal

Route:

`/transparency`

The Transparency Portal should consolidate public accountability information.

Primary modules:

```text
Governance
Treasury
Reports
Funding
Attestations
Evidence
Open Source
Methodologies
```

---

# 24. Governance

Route:

`/transparency/governance`

Explain:

- Foundation governance;
- relationship with Kokonut Network;
- relevant community governance;
- decision-making processes;
- relevant public governance resources;
- governance contracts where appropriate.

Avoid requiring visitors to understand blockchain terminology before understanding the organizational model.

---

# 25. Treasury

Route:

`/transparency/treasury`

Potential future functionality:

- verified wallet addresses;
- SAFE references;
- current balances;
- treasury assets;
- transaction history;
- categorized expenditures;
- project funding;
- explorer links.

Blockchain data displayed here must distinguish between:

**raw on-chain information**

and

**Foundation interpretation/category labels.**

---

# 26. Attestations

Route:

`/transparency/attestations`

Potential future sources:

- Ethereum Attestation Service;
- Kokonut Intelligence;
- farm records;
- governance attestations;
- project milestones.

Attestations should link to their underlying public source whenever possible.

---

# 27. Reports

Reports should become structured records rather than arbitrary uploaded files.

Example schema:

```ts
interface Report {
  id: string;
  slug: string;

  title: string;
  summary?: string;

  reportType: string;

  projectId?: string;

  periodStart?: string;
  periodEnd?: string;

  publishedAt: string;

  documentKey: string;

  authors?: string[];

  visibility: "public" | "restricted";
}
```

Documents should be stored in R2.

---

# 28. Resources

Route:

`/resources`

Supported resource types:

- Reports
- Research
- Frameworks
- Articles
- Guides
- Policies
- Presentations
- Data
- Project Updates
- Videos
- Methodologies

Filters:

```text
Resource Type
Project
Topic
Year
SDG
Impact Area
```

---

# 29. Partnerships

Route:

`/partners`

Potential audiences:

- NGOs;
- nonprofit organizations;
- foundations;
- regenerative agriculture projects;
- Web3 protocols;
- public-goods communities;
- research institutions;
- universities;
- technology organizations;
- community organizations.

Primary CTA:

**Explore a Partnership**

---

# 30. Support

Route:

`/support`

Support mechanisms should be modular.

Potential options:

```text
Donate
Fund a Project
Fund Public Infrastructure
Partner
Contribute Technology
Contribute Research
Join the Community
```

External financial providers may be used when appropriate, but no external provider should become a structural dependency of the application.

---

# 31. About

Routes:

```text
/about
/about/team
/about/foundation
```

The Foundation section should clearly distinguish between:

**Kokonut Foundation**

and

**Kokonut Network**

while explaining their relationship in plain language.

---

# 32. Internal Administration Platform

The application should include a private administrative interface.

Recommended route:

`admin.kokonut.foundation`

or:

`kokonut.foundation/admin`

This replaces the content-management function of WordPress.

---

# 33. Admin Authentication

The admin application should be protected by **Cloudflare Access**.

Cloudflare Access can protect Workers before requests reach application code, and current Workers integration supports applying Access directly to individual Workers and their preview/production routes.

This eliminates the need to build password authentication merely to protect the internal CMS.

---

# 34. Admin Capabilities

Authorized staff should eventually be able to manage:

```text
Projects
Farms
Metrics
Measurements
Milestones
Evidence
Partners
Team
Reports
Resources
Homepage Metrics
Calls to Action
Impact Content
Attestations
SEO Metadata
Redirects
Media
```

---

# 35. Publishing Workflow

Recommended states:

```text
DRAFT
  │
  ▼
REVIEW
  │
  ▼
APPROVED
  │
  ▼
PUBLISHED
  │
  ▼
ARCHIVED
```

Data requiring stronger governance can use approval controls before public publication.

---

# 36. Core Technical Architecture

```text
                        USERS
                          │
                          ▼
                CLOUDFLARE NETWORK
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
        DNS             WAF              CDN
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │ CLOUDFLARE WORKERS  │
              │                     │
              │ kokonut.foundation  │
              └──────────┬──────────┘
                         │
       ┌─────────────────┼───────────────────────┐
       │                 │                       │
       ▼                 ▼                       ▼
 Static Assets       Astro Runtime            API
 HTML/CSS/JS         Dynamic Routes          /api/*
       │                 │                       │
       └─────────────────┼───────────────────────┘
                         │
           ┌─────────────┼──────────────┐
           │             │              │
           ▼             ▼              ▼
          D1             R2             KV
      Structured      Evidence       Config /
         Data          & Files       Fast Reads
           │             │              │
           └─────────────┼──────────────┘
                         │
                 ┌───────┴───────┐
                 ▼               ▼
              QUEUES         WORKFLOWS
                 │               │
                 └───────┬───────┘
                         ▼
                 Background Tasks
```

Workers Static Assets allows static content and Worker logic to be deployed together, while Astro is directly supported on Workers for both pre-rendered pages and request-time rendering.

---

# 37. Frontend Framework

## Astro

Astro is recommended because this application is primarily:

- content-heavy;
- SEO-dependent;
- performance-sensitive;
- progressively interactive.

Astro defaults toward minimal client-side JavaScript and supports both build-time rendering and request-time rendering through Cloudflare Workers.

---

# 38. Programming Language

Use:

**TypeScript**

Configuration:

```text
strict: true
```

Application code should avoid unnecessary `any` usage.

---

# 39. Rendering Strategy

Use three modes.

## Pre-rendered

Default.

Examples:

```text
/about
/how-it-works
/resources
/methodology
```

## Dynamic Worker Rendering

Use when request-time data materially improves the experience.

Examples:

```text
/impact
/transparency
/projects/[slug]
```

## Client-Side Islands

Use for:

- charts;
- maps;
- filtering;
- interactive diagrams;
- data explorers;
- live blockchain widgets.

Do not globally hydrate the entire application.

---

# 40. Static Assets

Static HTML, CSS, JavaScript and application resources should be delivered using **Workers Static Assets**.

Static asset requests can be served directly without invoking application Worker logic when configured appropriately.

This allows the platform to retain static-site economics and performance while still having a full programmable backend.

---

# 41. D1 Database

Use **Cloudflare D1** as the primary application relational database.

D1 is Cloudflare's native serverless SQL database and is directly available from Workers through bindings.

Primary D1 entities:

```text
projects
farms
metrics
measurements
milestones
partners
team_members
resources
reports
evidence
attestations
funding_events
content_blocks
redirects
audit_events
```

---

# 42. Database ORM

Recommended:

**Drizzle ORM**

Reasons:

- TypeScript-first;
- SQL visibility;
- schema migrations;
- lightweight;
- suitable for D1.

Avoid excessive ORM abstraction.

---

# 43. R2 Storage

Use **Cloudflare R2** for:

- reports;
- evidence;
- photographs;
- exported datasets;
- videos when appropriate;
- downloadable files;
- large media;
- archival assets.

R2 is S3-compatible and designed for storing unstructured application data.

---

# 44. Workers KV

KV should not replace D1.

Use KV only where its globally distributed, read-heavy model makes sense.

Cloudflare describes Workers KV as a global low-latency key-value data store optimized for high read volumes.

Good KV candidates:

```text
feature_flags
site_configuration
cached_navigation
cached_public_metrics
external_api_cache
rate_limit_metadata
```

Do not store transactional Foundation data in KV.

---

# 45. Queues

Use **Cloudflare Queues** for asynchronous operations that should not block a visitor request.

Cloudflare Queues supports delivery guarantees, retries, delays, batching and Workers-to-Workers processing.

Examples:

```text
Evidence processing
Metric refresh
External API synchronization
Analytics aggregation
Webhook processing
Cache invalidation
Search indexing
Notification events
```

---

# 46. Workflows

Use **Cloudflare Workflows** when an operation involves multiple durable steps.

Workflows can persist state, automatically retry steps and run long-lived processes.

Potential examples:

```text
Publish Report
    ↓
Validate Metadata
    ↓
Store File
    ↓
Create Report Record
    ↓
Generate Preview
    ↓
Publish
    ↓
Invalidate Cache
```

or:

```text
Synchronize Project
       ↓
Fetch KI Data
       ↓
Validate
       ↓
Transform
       ↓
Write D1
       ↓
Store Evidence
       ↓
Update Metrics
       ↓
Publish
```

---

# 47. Durable Objects

Durable Objects should not be introduced without a concrete need.

Possible future use:

- real-time collaborative admin;
- coordinated state;
- live rooms;
- strongly consistent counters;
- stateful synchronization.

D1 should remain the default structured-data layer.

---

# 48. Forms

Forms include:

```text
Contact
Partnership Inquiry
Support Inquiry
Media Inquiry
Volunteer Interest
```

Architecture:

```text
Browser
   │
   ▼
Turnstile
   │
   ▼
Worker Endpoint
   │
   ├── Validate
   ├── Sanitize
   ├── Rate Limit
   └── Store
          │
          ▼
          D1
```

Turnstile tokens must always be verified server-side; Cloudflare explicitly requires Siteverify validation rather than trusting the browser widget alone.

---

# 49. Kokonut Intelligence Integration

Kokonut Intelligence should be treated as a first-class future data source.

Architecture:

```text
                KOKONUT INTELLIGENCE
                         │
                         │ API
                         ▼
               FOUNDATION INGEST WORKER
                         │
                  Validate / Map
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
            D1          R2         Queue
             │           │           │
             └───────────┼───────────┘
                         ▼
                Foundation Platform
```

Potential imported information:

```text
Farm entities
MRV measurements
Harvest data
Impact metrics
Evidence references
Claims
Relationships
EAS attestations
SDG mapping
Project milestones
Confidence metadata
Verification status
```

The Foundation platform should not duplicate Kokonut Intelligence.

The responsibilities should be:

```text
Kokonut Intelligence
= evidence, intelligence, data, verification

Kokonut Foundation Platform
= public presentation, storytelling, participation, institutional interface
```

---

# 50. Public API

Introduce a versioned public API architecture.

Base:

```text
/api/v1/
```

Potential endpoints:

```text
GET /api/v1/projects
GET /api/v1/projects/:slug

GET /api/v1/impact
GET /api/v1/metrics

GET /api/v1/resources
GET /api/v1/reports

GET /api/v1/partners

GET /api/v1/attestations
```

Not every endpoint must launch in V1.

The architecture should support them.

---

# 51. API Principles

Public APIs should provide:

- predictable JSON;
- versioning;
- pagination;
- structured errors;
- caching;
- rate limiting;
- schema validation;
- clear provenance metadata.

Example:

```json
{
  "data": {
    "metric": "trees_planted",
    "value": 96,
    "unit": "trees",
    "verification_status": "verified",
    "observed_at": "2026-09-30"
  },
  "meta": {
    "source": "kokonut-intelligence",
    "updated_at": "2026-10-03T18:00:00Z"
  }
}
```

---

# 52. Machine-Readable Foundation

The application should expose:

```text
/robots.txt
/sitemap.xml
/llms.txt
```

Future:

```text
/api
/openapi.json
/api-docs
```

This makes Foundation information accessible not only to browsers but also search engines, research tools and AI systems.

---

# 53. Internationalization

Architecture should support:

```text
/en/
/es/
```

even if English launches first.

Content entities requiring translation should separate:

```text
data
```

from:

```text
localized presentation
```

Avoid duplicating entire projects merely for translation.

---

# 54. Design Direction

The site should feel like the intersection of:

**Regenerative Agriculture**

+

**Institutional Public Goods**

+

**Open Technology**

+

**Community Governance**

Avoid:

- generic NGO templates;
- excessive Web3 aesthetics;
- cryptocurrency visual clichés;
- overuse of gradients;
- corporate stock photography;
- decorative dashboards without meaningful data.

---

# 55. Visual System

Existing Kokonut visual identity should be retained and refined.

Core palette:

```text
Primary Green
#009F4D

Secondary Yellow
#FFCD00

Strong
#171717

Light
#FFFFFF
```

Design tokens should extend this into:

```text
background
surface
surface-muted
foreground
muted
border
positive
warning
critical
data-series
```

---

# 56. Design System Components

Required primitives:

```text
Button
Link
Input
Textarea
Select
Checkbox
Badge
Card
Metric
Navigation
Footer
Breadcrumb
Modal
Drawer
Tabs
Table
Pagination
Tooltip
Alert
Skeleton
Toast
```

Domain components:

```text
ProjectCard
ImpactMetric
EvidenceCard
AttestationCard
MilestoneTimeline
PartnerCard
ReportCard
FundingFlow
GovernanceDiagram
FarmSummary
VerificationBadge
SDGBadge
```

---

# 57. Mobile Experience

The product must be designed mobile-first.

Minimum supported width:

**320px**

Primary content must remain fully usable without horizontal scrolling.

Complex tables should transform into mobile-friendly cards or horizontally scrollable regions with accessible labeling.

---

# 58. Accessibility

Target:

**WCAG 2.2 AA**

Requirements include:

- semantic HTML;
- keyboard accessibility;
- visible focus;
- skip links;
- sufficient contrast;
- reduced-motion handling;
- logical heading hierarchy;
- meaningful alt text;
- accessible charts;
- form labeling;
- accessible errors;
- ARIA only when semantic HTML is insufficient.

---

# 59. Performance

Primary objective:

The public site should feel instantaneous.

Targets:

```text
Lighthouse Performance    ≥95
Lighthouse Accessibility  ≥95
Lighthouse SEO            ≥95
Lighthouse Best Practices ≥95
```

Core Web Vitals targets:

```text
LCP < 2.5s
INP < 200ms
CLS < 0.10
```

at the 75th percentile when sufficient production data is available.

---

# 60. JavaScript Budget

JavaScript should be treated as a budget.

Rules:

- avoid global hydration;
- no React runtime unless a component requires it;
- dynamically import visualization libraries;
- render navigation and standard content without JS dependency;
- avoid large animation frameworks when CSS suffices.

---

# 61. SEO

Every public page must support:

```text
Title
Description
Canonical URL
Open Graph
Social image
Robots directives
Structured headings
Breadcrumbs
JSON-LD
```

Generate automatically:

```text
sitemap.xml
robots.txt
```

---

# 62. Structured Data

Potential Schema.org entities:

```text
Organization
NonprofitOrganization
Person
Article
Dataset
Event
BreadcrumbList
FAQPage
```

Only use structured data that accurately describes page content.

---

# 63. Analytics

Default analytics:

**Cloudflare Web Analytics**

Cloudflare describes Web Analytics as privacy-first real-user analytics and states that it does not collect or use visitors' personal data.

Track product events separately when required.

Primary KPIs:

```text
Project exploration
Impact exploration
Report downloads
Evidence views
Support clicks
Partnership inquiries
Community referrals
Transparency usage
Returning visitors
```

---

# 64. Application Observability

Enable Cloudflare Workers observability.

Use:

```text
Workers Logs
Workers Metrics
Workers Traces
```

Cloudflare Workers Logs can collect invocation logs, application logs, errors and exceptions, while Workers Traces provides request-level visibility across Workers and connected services.

---

# 65. Security Architecture

Cloudflare should provide the primary security perimeter.

Architecture:

```text
Internet
   │
   ▼
Cloudflare DNS
   │
   ▼
DDoS Protection
   │
   ▼
WAF
   │
   ▼
Rate Limiting
   │
   ▼
Workers
```

Additional requirements:

- strict input validation;
- output escaping;
- CSP;
- HSTS;
- secure cookies;
- no secrets in frontend bundles;
- Worker Secrets for credentials;
- least-privilege bindings;
- dependency scanning;
- audit trail for admin mutations;
- Turnstile for public submissions;
- Access for admin applications.

---

# 66. Privacy

Principles:

- minimum necessary collection;
- no unnecessary tracking cookies;
- no sale of data;
- no unnecessary fingerprinting;
- public evidence reviewed for sensitive information;
- administrative data separated from public data.

---

# 67. Content Security

Each piece of content should have an explicit visibility status:

```text
PUBLIC
RESTRICTED
PRIVATE
```

R2 object access must respect this distinction.

Never assume an unlinked R2 object is private merely because its URL has not been published.

---

# 68. WordPress Migration

The migration should occur without disrupting the existing site.

## Stage 1 — Crawl

Inventory:

- URLs;
- pages;
- metadata;
- images;
- downloadable files;
- outbound links.

## Stage 2 — Classify

Classify existing information as:

```text
Page Content
Project Data
Impact Data
Resource
Partner
Team
External Link
Archive
```

## Stage 3 — Extract

Migrate useful content and media.

## Stage 4 — Normalize

Convert WordPress content into structured schemas.

## Stage 5 — Redesign

Do not reproduce WordPress layouts.

Recompose the information using the new design system.

## Stage 6 — Redirect

Create permanent redirects from historical URLs.

## Stage 7 — Validate

Verify:

- links;
- SEO metadata;
- sitemap;
- social cards;
- forms;
- analytics;
- mobile UI;
- accessibility.

## Stage 8 — Cutover

Point `kokonut.foundation` to the Worker application.

## Stage 9 — Archive

Retain a complete backup of:

- WordPress files;
- database;
- media;
- configuration.

## Stage 10 — Decommission

Remove the public WordPress runtime.

---

# 69. Repository Architecture

Recommended:

```text
kokonut-foundation/
│
├── apps/
│   ├── web/
│   └── admin/
│
├── packages/
│   ├── database/
│   ├── schemas/
│   ├── ui/
│   ├── config/
│   └── foundation-data/
│
├── workers/
│   ├── api/
│   ├── ingest/
│   └── queue-consumer/
│
├── migrations/
│
├── scripts/
│
├── tests/
│
├── wrangler.jsonc
│
├── package.json
│
└── README.md
```

A simpler repository may be used initially, but boundaries should remain conceptually similar.

---

# 70. Environment Strategy

Required environments:

```text
LOCAL
PREVIEW
PRODUCTION
```

Each should have separate:

- D1 databases where appropriate;
- R2 buckets;
- KV namespaces;
- environment variables;
- secrets.

Production data must not automatically appear in preview environments.

---

# 71. CI/CD

Preferred lifecycle:

```text
Feature Branch
      │
      ▼
Automated Tests
      │
      ▼
Preview Deployment
      │
      ▼
Review
      │
      ▼
Merge
      │
      ▼
Production Deployment
      │
      ▼
Health Verification
```

Deployment should use Wrangler and Cloudflare's Worker deployment model.

---

# 72. Testing

Required categories:

## Unit

- validators;
- transformations;
- utility logic.

## Component

- design-system components;
- domain components.

## Integration

- D1;
- R2;
- Workers routes;
- APIs.

## End-to-End

Playwright.

Critical flows:

```text
Homepage
Navigation
Project discovery
Project detail
Impact
Reports
Contact
Partnership submission
Admin authentication
Admin publishing
404
Redirects
```

## Accessibility

Automated testing plus manual verification.

---

# 73. Initial D1 Schema

Conceptual model:

```text
projects
    │
    ├──── project_metrics
    │         │
    │         └──── metrics
    │
    ├──── milestones
    │
    ├──── evidence
    │
    ├──── project_partners
    │         │
    │         └──── partners
    │
    ├──── reports
    │
    └──── attestations
```

Additional tables:

```text
team_members
resources
funding_events
content_blocks
inquiries
redirects
audit_log
sync_jobs
```

---

# 74. Auditability

Administrative mutations should produce audit records.

Example:

```text
actor
action
entity_type
entity_id
before
after
timestamp
```

This is particularly important for:

- impact metrics;
- funding information;
- verification status;
- published reports.

---

# 75. Search

V1 can use a lightweight static or D1-backed search.

Future:

```text
Search
  │
  ├── Projects
  ├── Reports
  ├── Resources
  ├── Partners
  └── Impact
```

Only introduce a dedicated search service when scale requires it.

---

# 76. Maps

Maps may eventually be used for project discovery.

Potential UX:

```text
          WORLD
            │
      ┌─────┴─────┐
      ▼           ▼
Dominican       Future
Republic        Regions
      │
      ▼
   Adelphi
      │
      ▼
Project Data
```

Map integrations should not become essential to basic navigation.

---

# 77. Progressive Web App

The site should be PWA-ready but should not prioritize PWA functionality over product value.

Possible future capabilities:

- installable manifest;
- offline project summaries;
- cached reports;
- offline farm resources.

---

# 78. AI-Ready Architecture

The platform should be designed so public Foundation knowledge can eventually be queried through AI systems.

Potential architecture:

```text
Foundation Platform
       │
       ├── Structured API
       ├── llms.txt
       ├── OpenAPI
       └── Public Resources
                │
                ▼
            AI Agents
```

Cloudflare AI capabilities may be evaluated later when specific use cases justify them.

---

# 79. Data Provenance

Every significant metric should eventually answer:

```text
Who produced this data?

When?

How?

Using what methodology?

For which project?

What evidence supports it?

Has it been reviewed?

Has it been independently verified?

Is there an on-chain attestation?
```

This principle should influence the database schema from V1 even when full verification features launch later.

---

# 80. Delivery Phases

## Phase 0 — Discovery & Migration Audit

Deliverables:

- WordPress crawl;
- content inventory;
- URL inventory;
- media inventory;
- technical audit;
- redirect plan.

---

## Phase 1 — Foundation Architecture

Build:

- repository;
- Astro;
- TypeScript;
- Workers;
- Workers Static Assets;
- environment setup;
- D1;
- R2;
- KV;
- CI/CD;
- observability.

---

## Phase 2 — Design System

Build:

- tokens;
- typography;
- responsive grid;
- primitives;
- domain components;
- navigation;
- footer.

---

## Phase 3 — Core Public Experience

Build:

```text
Home
How It Works
About
Partners
Support
Contact
```

---

## Phase 4 — Projects

Build:

```text
Project index
Project model
Project detail
Milestones
Partners
Resources
```

---

## Phase 5 — Impact

Build:

```text
Impact dashboard
Metrics
Methodologies
Evidence
Project impact
```

---

## Phase 6 — Transparency

Build:

```text
Governance
Reports
Treasury references
Funding
Attestations
Open Source
```

---

## Phase 7 — Admin Platform

Build:

```text
Cloudflare Access
Admin UI
Content CRUD
Projects
Metrics
Evidence
Resources
Publishing workflow
Audit logging
```

---

## Phase 8 — Kokonut Intelligence

Implement:

```text
Foundation Ingest Worker
KI API integration
Data mapping
Queues
Synchronization
Verification state
```

---

## Phase 9 — WordPress Cutover

Perform:

- final migration;
- redirects;
- SEO validation;
- production deployment;
- DNS cutover;
- monitoring.

---

# 81. V1 Scope

The initial production release should include:

```text
Cloudflare Workers application
Workers Static Assets
Astro frontend
Responsive design system

Home
How It Works
Projects
Project Detail
Impact
Partners
Resources
About
Support
Contact
Transparency

D1 structured content
R2 media/documents
Turnstile forms
Cloudflare Access admin
SEO
Sitemap
Analytics
Observability
WordPress redirects
```

---

# 82. V1.1

After launch:

```text
Expanded admin
Impact methodology
Evidence viewer
Report management
Better search
Spanish localization
Live project metrics
Kokonut Intelligence sync
```

---

# 83. V2

Potential capabilities:

```text
Live Impact Explorer
Farm Explorer
Geospatial View
Treasury Explorer
Attestation Explorer
Historical Metrics
Public API
OpenAPI
Data Downloads
Advanced KI Integration
Automated Reports
```

---

# 84. V3 Vision

The Foundation website ultimately becomes a public evidence graph.

```text
                     PROJECT
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
        FARM          PARTNER       FUNDING
          │
          ▼
      NATURAL ASSET
          │
          ▼
       ACTIVITY
          │
          ▼
       METRIC
          │
          ▼
       EVIDENCE
          │
          ▼
      ATTESTATION
          │
          ▼
        IMPACT
```

The visitor should eventually be able to move from:

> “96 coconut trees”

to:

**Metric**

↓

**Farm**

↓

**Measurement**

↓

**Evidence**

↓

**Methodology**

↓

**Attestation**

↓

**Source**

That is significantly more meaningful than a conventional nonprofit impact dashboard.

---

# 85. Non-Goals

The Foundation application will not initially become:

- a cryptocurrency exchange;
- a custodial wallet;
- a complete DAO governance frontend;
- an ERP;
- a general-purpose CRM;
- an accounting system;
- Kokonut Intelligence itself;
- an investment marketplace.

Integrations with those functions may exist without absorbing their responsibilities.

---

# 86. Technical Acceptance Criteria

V1 is technically complete when:

1. `kokonut.foundation` is served through Cloudflare Workers.
2. Static content uses Workers Static Assets.
3. WordPress is not required for production.
4. PHP is not required.
5. MySQL is not required.
6. Structured application data uses D1.
7. Foundation files use R2 where appropriate.
8. KV is limited to appropriate high-read use cases.
9. Forms are processed through Workers.
10. Public forms are protected with Turnstile.
11. Admin interfaces are protected by Cloudflare Access.
12. Worker Secrets contain application credentials.
13. Preview and production environments are separated.
14. Workers Logs are operational.
15. Production analytics are operational.
16. Redirects preserve important historical URLs.
17. Sitemap generation works.
18. Custom 404 handling works.
19. Core Web Vitals targets are met or exceptions documented.
20. WCAG 2.2 AA critical issues are resolved.
21. Automated tests cover critical journeys.
22. Production deployment is reproducible.

---

# 87. Product Acceptance Criteria

A first-time visitor should be able to answer:

**What does Kokonut Foundation do?**

within approximately 30–60 seconds.

A visitor should be able to understand:

**Fund → Grow → Verify → Repeat**

without knowledge of Web3.

A visitor should be able to discover a real Foundation project within two interactions from the homepage.

A visitor should be able to locate Foundation impact information within one primary navigation interaction.

A visitor should be able to understand where important metrics came from when supporting evidence exists.

A partner should have a clear path to contact the Foundation.

A donor/supporter should have a clear path to contribute.

A technical visitor should be able to discover deeper data and transparency resources without overwhelming ordinary visitors.

---

# 88. Success Metrics

## Technical

```text
≥95 Lighthouse Performance
≥95 Accessibility
≥95 SEO
≥95 Best Practices

LCP <2.5s
CLS <0.10
INP <200ms
```

## Product

Monitor:

```text
Project detail engagement
Impact dashboard engagement
Evidence views
Report downloads
Partner inquiries
Support conversions
Community referrals
Transparency engagement
Return visitors
```

## Operational

Track:

```text
Deployment frequency
Failed deployments
Worker error rate
API latency
D1 errors
Queue failures
Workflow failures
Broken links
404 frequency
```

---

# 89. Infrastructure Philosophy

The Foundation platform should not assemble ten SaaS products where the Cloudflare platform already provides the necessary infrastructure.

The preferred infrastructure model is:

```text
                    CLOUDFLARE
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
      EDGE              DATA             SECURITY
       │                 │                  │
 Workers              D1 / R2              WAF
 Assets                  KV                Access
 Cache                  Queues            Turnstile
 DNS                  Workflows            DDoS
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                    OBSERVABILITY
                         │
                    Logs / Traces
                    Analytics
```

External services should be integrations, not foundational infrastructure.

Examples include:

- blockchains;
- Giveth;
- Git hosting;
- Kokonut Intelligence;
- public data APIs.

The application must continue operating even when a nonessential third-party integration becomes unavailable.

---

# 90. Final Architecture Decision

Kokonut Foundation will be rebuilt as a **Cloudflare-native full-stack application**.

The public experience will use Astro and TypeScript.

Cloudflare Workers will provide the primary runtime.

Workers Static Assets will serve pre-rendered application resources.

Cloudflare D1 will store structured relational data.

Cloudflare R2 will store reports, media and supporting evidence.

Workers KV will support appropriate globally distributed read-heavy data.

Cloudflare Queues will process asynchronous jobs.

Cloudflare Workflows will coordinate durable multi-step operations.

Cloudflare Turnstile will protect public forms.

Cloudflare Access will protect Foundation administration.

Cloudflare's network, DNS, WAF and DDoS protections will form the public security perimeter.

Cloudflare Web Analytics and Workers Observability will provide application telemetry.

The application will be designed from its first release to integrate with Kokonut Intelligence and progressively expose project data, impact measurements, evidence and public attestations.

No WordPress runtime, PHP application server, conventional CMS, conventional application host, or independently managed relational database will be required to operate the production platform.

---

# 91. North-Star Product Vision

The WordPress site currently **tells people what Kokonut Foundation is doing**.

The new application should evolve through four stages:

```text
V1
TELL
│
│ Explain the Foundation
▼

V1.5
SHOW
│
│ Show projects and impact
▼

V2
VERIFY
│
│ Connect claims to evidence
▼

V3
PROVE
│
│ Public, machine-readable,
│ verifiable impact infrastructure
▼
```

The objective is therefore not:

> **Build a nicer Foundation website.**

It is:

> **Build the public digital infrastructure through which Kokonut Foundation can explain its mission, expose its work, demonstrate its impact, connect claims to evidence, and allow people and machines to independently explore what the Foundation is accomplishing.**

That should be the standard against which every design and engineering decision in this project is evaluated.