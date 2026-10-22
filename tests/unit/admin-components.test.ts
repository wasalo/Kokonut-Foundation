import { describe, it, expect } from "vitest";
import { render, adminLocals } from "../support/render";
import Can from "@components/admin/Can.astro";
import DeleteButton from "@components/admin/DeleteButton.astro";
import StatusSelect from "@components/admin/StatusSelect.astro";
import EntityForm from "@components/admin/EntityForm.astro";

describe("Can", () => {
  it("renders its children when the role holds the capability", async () => {
    const html = await render(Can, {
      props: { capability: "projects.create" },
      slots: { default: "Create" },
      locals: adminLocals("manager"),
    });
    expect(html).toContain("Create");
  });

  it("renders nothing when the role lacks the capability", async () => {
    const html = await render(Can, {
      props: { capability: "projects.create" },
      slots: { default: "Create" },
      locals: adminLocals("analyst"),
    });
    expect(html).not.toContain("Create");
  });

  it("renders nothing when there is no signed-in role", async () => {
    const html = await render(Can, {
      props: { capability: "projects.create" },
      slots: { default: "Create" },
      locals: adminLocals(null),
    });
    expect(html).not.toContain("Create");
  });
});

describe("DeleteButton", () => {
  it("renders for a role that may delete", async () => {
    const html = await render(DeleteButton, {
      props: { endpoint: "/api/admin/projects", id: "p1", capability: "projects.delete" },
      locals: adminLocals("administrator"),
    });
    expect(html).toContain("Delete");
    expect(html).toContain('data-id="p1"');
    expect(html).toContain('data-endpoint="/api/admin/projects"');
  });

  it("renders nothing for a role that may not delete", async () => {
    const html = await render(DeleteButton, {
      props: { endpoint: "/api/admin/projects", id: "p1", capability: "projects.delete" },
      locals: adminLocals("manager"),
    });
    expect(html).not.toContain("Delete");
  });

  it("renders nothing when there is no signed-in role", async () => {
    const html = await render(DeleteButton, {
      props: { endpoint: "/api/admin/projects", id: "p1", capability: "projects.delete" },
      locals: adminLocals(null),
    });
    expect(html).not.toContain("Delete");
  });
});

describe("StatusSelect", () => {
  it("offers the publish states to a role that may publish", async () => {
    const html = await render(StatusSelect, {
      props: { entity: "project", id: "p1", capability: "projects.update", publishCapability: "projects.publish" },
      locals: adminLocals("manager"),
    });
    expect(html).toContain("published");
    expect(html).toContain("verified");
    expect(html).toContain("archived");
  });

  it("offers only the review states to a role that may not publish", async () => {
    const html = await render(StatusSelect, {
      props: { entity: "evidence", id: "e1", capability: "evidence.update", publishCapability: "evidence.publish" },
      locals: adminLocals("field_worker"),
    });
    expect(html).toContain("submitted");
    expect(html).not.toContain("published");
    expect(html).not.toContain("verified");
  });

  it("renders nothing for a role that may not change the status at all", async () => {
    const html = await render(StatusSelect, {
      props: { entity: "project", id: "p1", capability: "projects.update", publishCapability: "projects.publish" },
      locals: adminLocals("analyst"),
    });
    expect(html).not.toContain("<select");
  });
});

describe("EntityForm", () => {
  const fields = [
    { name: "name", label: "Name", required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "status", label: "Status", type: "select" as const, options: [{ value: "draft", label: "draft" }] },
  ];

  it("renders a labelled control for every field", async () => {
    const html = await render(EntityForm, {
      props: { endpoint: "/api/admin/projects", fields },
      locals: adminLocals("manager"),
    });
    expect(html).toContain('for="f-name"');
    expect(html).toContain("Name");
    expect(html).toContain("<textarea");
    expect(html).toContain("<select");
  });

  it("marks required fields", async () => {
    const html = await render(EntityForm, {
      props: { endpoint: "/api/admin/projects", fields },
      locals: adminLocals("manager"),
    });
    expect(html).toContain("required");
  });

  it("prefills the controls from the record", async () => {
    const html = await render(EntityForm, {
      props: {
        endpoint: "/api/admin/projects",
        fields,
        record: { name: "Adelphi", description: "A farm", status: "draft" },
      },
      locals: adminLocals("manager"),
    });
    expect(html).toContain('value="Adelphi"');
    expect(html).toContain("A farm");
  });

  it("passes the record id and endpoint to the form", async () => {
    const html = await render(EntityForm, {
      props: { endpoint: "/api/admin/projects", id: "p1", fields, method: "PUT" },
      locals: adminLocals("manager"),
    });
    expect(html).toContain('data-endpoint="/api/admin/projects"');
    expect(html).toContain('data-id="p1"');
    expect(html).toContain('data-method="PUT"');
  });

  it("renders help text when a field has it", async () => {
    const html = await render(EntityForm, {
      props: {
        endpoint: "/api/admin/content",
        fields: [{ name: "key", label: "Key", help: "Unique identifier" }],
      },
      locals: adminLocals("manager"),
    });
    expect(html).toContain("Unique identifier");
  });
});
