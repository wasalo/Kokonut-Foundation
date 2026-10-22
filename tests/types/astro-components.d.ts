// `tsc` does not understand `.astro` files, so the component tests import them
// through ambient declarations. Astro's own type checking of components is
// done by `astro check`; these declarations only need to let the test files
// type check.
declare module "@components/primitives/*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}

declare module "@components/domain/*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}

declare module "@components/admin/*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}

declare module "@components/layout/*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}
