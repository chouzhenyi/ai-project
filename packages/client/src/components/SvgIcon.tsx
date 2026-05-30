import React, { type CSSProperties } from "react";

interface SvgIconProps {
  name: string;
  prefix?: string;
  color?: string;
  size?: string | number;
  style?: CSSProperties;
}

const SvgIcon: React.FC<SvgIconProps> = ({
  name,
  prefix = "icon",
  color = "currentColor",
  size = "1em",
  style,
}) => {
  const symbolId = `#${prefix}-${name}`;
  return (
    <svg
      aria-hidden="true"
      style={{ width: size, height: size, fill: color, ...style }}
    >
      <use href={symbolId} />
    </svg>
  );
};

export default SvgIcon;