/**
 * Randomly reorders an element's children in place (Fisher-Yates).
 *
 * Runs in the browser after the static HTML has loaded, moving whole nodes so
 * a link's text and href can never get out of sync (see the
 * "to-hunt-a-killer-bug" post for why that matters).
 */
export function shuffleChildren(container: HTMLElement): void {
  const children = Array.from(container.children)
  for (let i = children.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[children[i], children[j]] = [children[j], children[i]]
  }
  container.append(...children)
}
