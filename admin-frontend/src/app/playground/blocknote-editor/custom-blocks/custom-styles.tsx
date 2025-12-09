"use client";

import { createReactStyleSpec } from "@blocknote/react";

import "./custom-styles.css";

// Font style - Small caps
export const createSmallCaps = createReactStyleSpec(
  {
    type: "smallCaps",
    propSchema: "boolean",
  },
  {
    render: (props) => (
      <span className="style-small-caps" style={{ fontVariant: "small-caps" }}>
        {props.children}
      </span>
    ),
  }
);

// Highlight colors
export const highlightColors = [
  { value: "yellow", label: "Yellow", color: "#fef08a", darkColor: "#854d0e" },
  { value: "green", label: "Green", color: "#bbf7d0", darkColor: "#166534" },
  { value: "blue", label: "Blue", color: "#bfdbfe", darkColor: "#1e40af" },
  { value: "pink", label: "Pink", color: "#fbcfe8", darkColor: "#9d174d" },
  { value: "orange", label: "Orange", color: "#fed7aa", darkColor: "#9a3412" },
  { value: "purple", label: "Purple", color: "#ddd6fe", darkColor: "#5b21b6" },
] as const;

// Custom highlight style with color options
export const createColorHighlight = createReactStyleSpec(
  {
    type: "colorHighlight",
    propSchema: "string",
  },
  {
    render: (props) => {
      const colorValue = props.value || "yellow";
      return (
        <span className="style-highlight" data-highlight-color={colorValue}>
          {props.children}
        </span>
      );
    },
  }
);

// Underline with color
export const createColorUnderline = createReactStyleSpec(
  {
    type: "colorUnderline",
    propSchema: "string",
  },
  {
    render: (props) => {
      const colorValue = props.value || "blue";
      return (
        <span className="style-underline" data-underline-color={colorValue}>
          {props.children}
        </span>
      );
    },
  }
);

// Font size style
export const createFontSize = createReactStyleSpec(
  {
    type: "fontSize",
    propSchema: "string",
  },
  {
    render: (props) => {
      const size = props.value || "16px";
      return <span style={{ fontSize: size }}>{props.children}</span>;
    },
  }
);

