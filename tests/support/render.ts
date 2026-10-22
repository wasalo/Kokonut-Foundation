import { experimental_AstroContainer as AstroContainer } from "astro/container";

/**
 * Renders an Astro component to HTML for the component tests.
 *
 * `locals` becomes `Astro.locals`, which is how the admin components learn
 * the signed-in role.
 */
export async function render(
  Component: any,
  options: { props?: Record<string, unknown>; slots?: Record<string, string>; locals?: Record<string, unknown> } = {},
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Component, {
    props: options.props ?? {},
    slots: options.slots ?? {},
    locals: options.locals ?? {},
  });
}

/** A locals object shaped like a signed-in admin. */
export function adminLocals(role: string | null, email = "staff@kokonut.foundation") {
  return {
    admin: role ? { email, role, capabilities: [], bootstrapped: false } : null,
  };
}
