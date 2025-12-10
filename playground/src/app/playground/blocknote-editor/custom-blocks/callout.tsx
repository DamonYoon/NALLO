"use client";

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Flame,
  Quote,
  LucideIcon,
} from "lucide-react";

import "./callout.css";

// Callout types with icons and colors
export const calloutTypes = [
  {
    title: "Tip",
    value: "tip" as const,
    icon: Lightbulb,
    color: "#10b981",
    backgroundColor: { light: "#ecfdf5", dark: "#064e3b" },
  },
  {
    title: "Info",
    value: "info" as const,
    icon: Info,
    color: "#3b82f6",
    backgroundColor: { light: "#eff6ff", dark: "#1e3a5f" },
  },
  {
    title: "Warning",
    value: "warning" as const,
    icon: AlertTriangle,
    color: "#f59e0b",
    backgroundColor: { light: "#fffbeb", dark: "#78350f" },
  },
  {
    title: "Success",
    value: "success" as const,
    icon: CheckCircle,
    color: "#22c55e",
    backgroundColor: { light: "#f0fdf4", dark: "#14532d" },
  },
  {
    title: "Error",
    value: "error" as const,
    icon: XCircle,
    color: "#ef4444",
    backgroundColor: { light: "#fef2f2", dark: "#7f1d1d" },
  },
  {
    title: "Important",
    value: "important" as const,
    icon: Flame,
    color: "#f97316",
    backgroundColor: { light: "#fff7ed", dark: "#7c2d12" },
  },
  {
    title: "Quote",
    value: "quote" as const,
    icon: Quote,
    color: "#6b7280",
    backgroundColor: { light: "#f9fafb", dark: "#374151" },
  },
] as const;

export type CalloutType = (typeof calloutTypes)[number]["value"];

// Create the Callout block - simple inline content only
export const createCallout = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "info" as CalloutType,
        values: calloutTypes.map((t) => t.value) as unknown as CalloutType[],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const calloutType = calloutTypes.find(
        (c) => c.value === props.block.props.type
      )!;
      const Icon = calloutType.icon as LucideIcon;

      return (
        <div
          className="callout-block"
          data-callout-type={props.block.props.type}
        >
          {/* Icon with dropdown menu */}
          <Menu withinPortal={false}>
            <Menu.Target>
              <div className="callout-icon-wrapper" contentEditable={false}>
                <Icon
                  className="callout-icon"
                  data-callout-icon-type={props.block.props.type}
                  size={20}
                />
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Callout Type</Menu.Label>
              <Menu.Divider />
              {calloutTypes.map((type) => {
                const ItemIcon = type.icon as LucideIcon;
                return (
                  <Menu.Item
                    key={type.value}
                    leftSection={
                      <ItemIcon
                        className="callout-icon"
                        data-callout-icon-type={type.value}
                        size={16}
                      />
                    }
                    onClick={() =>
                      props.editor.updateBlock(props.block, {
                        type: "callout",
                        props: { type: type.value },
                      })
                    }
                  >
                    {type.title}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>

          {/* Inline content area */}
          <div className="callout-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);
