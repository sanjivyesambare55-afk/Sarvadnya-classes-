/**
 * Navigation utility for smooth scrolling with sticky navbar offset.
 * Aligns sections at block: 'start' taking into account header height.
 */
export function scrollToSection(target: string) {
  if (!target) return;
  const id = target.startsWith('#') ? target.slice(1) : target;
  
  if (id === 'hero' || id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // If element is not found immediately, try querySelector as fallback
    try {
      const queried = document.querySelector(target.startsWith('#') ? target : `#${target}`);
      if (queried) {
        queried.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      // ignore selector parse error
    }
  }
}
