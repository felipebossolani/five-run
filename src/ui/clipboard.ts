export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Continue with the HTTP-compatible clipboard path. */
  }
  const active =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const input = document.createElement("textarea");
  input.value = text;
  input.readOnly = true;
  input.tabIndex = -1;
  input.setAttribute("aria-hidden", "true");
  input.style.cssText =
    "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  document.body.append(input);
  let copied = false;
  try {
    input.select();
    input.setSelectionRange(0, text.length);
    copied =
      typeof document.execCommand === "function" &&
      document.execCommand("copy") === true;
  } catch {
    /* The caller exposes manual copy if browser clipboard access is denied. */
  } finally {
    input.remove();
    active?.focus({ preventScroll: true });
  }
  return copied;
}
