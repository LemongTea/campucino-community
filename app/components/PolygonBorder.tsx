import type { CSSProperties, ReactNode } from "react";
import styles from "./PolygonBorder.module.css";

type PolygonBorderProps = {
  children: ReactNode;
  className?: string;
  corner?: string;
  thickness?: string;
  as?: "div" | "a";
  href?: string;
};

export function PolygonBorder({
  children,
  className = "",
  corner = "10px",
  thickness = "1px",
  as = "div",
  href,
}: PolygonBorderProps) {
  const style = {
    "--polygon-corner": corner,
    "--polygon-thickness": thickness,
  } as CSSProperties;
  const Component = as;

  return <Component className={`${styles.polygonBorder} ${className}`} style={style} href={href}>{children}</Component>;
}
