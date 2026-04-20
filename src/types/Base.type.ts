import { type AriaRole, type AriaAttributes } from 'react';

export type Orientation = 'horizontal' | 'vertical';

/**
 * Shared base props inherited by every component in the library.
 *
 * @remarks
 * Provides a consistent system for consumers to add accessibility attributes
 * and custom classNames across all components.
 */
export type BaseComponentProps = {
  /**
   * Additional CSS class names merged onto the root element.
   */
  className?: string;

  /**
   * ARIA and accessibility attributes forwarded to the root element.
   *
   * @remarks
   * Accepts any valid ARIA attribute (role, aria-*, tabIndex, etc.).
   * This lets consumers compose accessible patterns (e.g. tab lists)
   * without the component needing to know about them.
   *
   * @example
   * ```tsx
   * <Tab a11y={{ role: 'tab', tabIndex: 0, 'aria-selected': isActive }} />
   * ```
   */
  a11y?: AriaAttributes & {
    role?: AriaRole;
    tabIndex?: number;
  };
};
