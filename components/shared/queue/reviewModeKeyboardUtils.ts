/**
 * Utility functions for Review Mode keyboard navigation.
 * Ensures arrow keys don't interfere with text editing.
 */

/**
 * Known rich text editor root selectors used in the app.
 * Add more as needed when new editors are introduced.
 */
const RICH_TEXT_EDITOR_SELECTORS = [
  '[data-rich-text-editor]',
  '[data-draft-editor]',
  '[data-email-editor]',
  '.ProseMirror', // TipTap/ProseMirror
  '.ql-editor', // Quill
  '.tox-edit-area', // TinyMCE
  '[contenteditable="true"]',
];

/**
 * Known overlay/control containers that should block arrow key navigation.
 */
const OVERLAY_SELECTORS = [
  '[role="dialog"]',
  '[role="menu"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[data-radix-popper-content-wrapper]', // Radix UI
  '[data-radix-select-content]',
  '[data-radix-dropdown-menu-content]',
  '[data-radix-popover-content]',
  '[data-radix-dialog-content]',
  '.dropdown-menu',
  '.popover',
  '.modal',
  '.datepicker',
];

/**
 * Checks if the target element is in a text interaction context.
 * Returns true if arrow keys should NOT navigate items (i.e., should move cursor instead).
 */
export function isTextInteractionTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const element = target as HTMLElement;

  // Check if target is an input, textarea, or select
  const tagName = element.tagName.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tagName)) {
    // Exception: number/range inputs might be okay, but let's be safe
    if (tagName === 'input') {
      const inputType = (element as HTMLInputElement).type;
      if (['text', 'email', 'password', 'search', 'tel', 'url'].includes(inputType)) {
        return true;
      }
      // For other input types, check if it's in a form context
      if (element.closest('form')) {
        return true;
      }
    } else {
      return true;
    }
  }

  // Check if target or any parent has contenteditable="true"
  let current: HTMLElement | null = element;
  while (current) {
    if (current.contentEditable === 'true') {
      return true;
    }
    current = current.parentElement;
  }

  // Check if target is inside a known rich text editor
  for (const selector of RICH_TEXT_EDITOR_SELECTORS) {
    if (element.closest(selector)) {
      return true;
    }
  }

  // Check if target is inside an open overlay/modal/dropdown
  for (const selector of OVERLAY_SELECTORS) {
    const overlay = element.closest(selector);
    if (overlay) {
      // Check if overlay is visible (not hidden)
      const style = window.getComputedStyle(overlay);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        return true;
      }
    }
  }

  // Check if user has a text selection
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      // There's an active text selection
      // Check if selection is in an editable context
      const container = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        const parent = container.parentElement;
        if (parent) {
          if (parent.contentEditable === 'true') {
            return true;
          }
          // Check if parent is in a rich text editor
          for (const selector of RICH_TEXT_EDITOR_SELECTORS) {
            if (parent.closest(selector)) {
              return true;
            }
          }
        }
      } else if (container.nodeType === Node.ELEMENT_NODE) {
        const containerElement = container as HTMLElement;
        if (containerElement.contentEditable === 'true') {
          return true;
        }
        for (const selector of RICH_TEXT_EDITOR_SELECTORS) {
          if (containerElement.closest(selector)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}




