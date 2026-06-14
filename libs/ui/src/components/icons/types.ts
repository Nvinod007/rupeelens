import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  /** Apply hover motion preset. Parent should use `group` for hover effects. */
  animated?: boolean;
};
