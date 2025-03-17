/**
 * @template {React.ComponentType} Component
 * @param {Promise<{ default: Component }>} module
 */
export async function getDefaultComponent(module) {
  return {
    Component: (await module).default,
  };
}
