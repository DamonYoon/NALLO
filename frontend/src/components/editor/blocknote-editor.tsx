"use client";

/**
 * BlockNote Editor Component
 *
 * 드래그앤드롭, 슬래시 커맨드, @멘션이 지원되는 WYSIWYG 에디터
 */

import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Code,
  MessageSquareQuote,
  Lightbulb,
  Plus,
  FileText,
} from "lucide-react";

// Shiki bundle for syntax highlighting
import { createHighlighter } from "./shiki.bundle";

// Custom blocks
import {
  createCallout,
  calloutTypes,
  createMention,
  getMentionItems,
  createStubNode,
  createSmallCaps,
  createColorHighlight,
  createColorUnderline,
  createFontSize,
} from "./custom-blocks";

// Create custom code block with syntax highlighting
const codeBlock = createCodeBlockSpec({
  indentLineWithTab: true,
  defaultLanguage: "typescript",
  supportedLanguages: {
    typescript: { name: "TypeScript", aliases: ["ts"] },
    javascript: { name: "JavaScript", aliases: ["js"] },
    python: { name: "Python", aliases: ["py"] },
    java: { name: "Java" },
    json: { name: "JSON" },
    html: { name: "HTML" },
    css: { name: "CSS" },
    sql: { name: "SQL" },
    bash: { name: "Bash", aliases: ["sh", "shell"] },
    go: { name: "Go" },
    rust: { name: "Rust", aliases: ["rs"] },
    yaml: { name: "YAML", aliases: ["yml"] },
    markdown: { name: "Markdown", aliases: ["md"] },
  },
  createHighlighter: () =>
    createHighlighter({
      themes: ["dark-plus", "light-plus"],
      langs: [],
    }) as any,
});

// Create schema with all custom blocks, inline content, and styles
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock,
    callout: createCallout(),
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: createMention,
  },
  styleSpecs: {
    ...defaultStyleSpecs,
    smallCaps: createSmallCaps,
    colorHighlight: createColorHighlight,
    colorUnderline: createColorUnderline,
    fontSize: createFontSize,
  },
});

// Type for the editor
type CustomEditor = typeof schema.BlockNoteEditor;

// Custom slash menu items
const getCustomSlashMenuItems = (editor: CustomEditor) => {
  // Get default items and filter out the default Code Block
  const defaultItems = getDefaultReactSlashMenuItems(editor as any).filter(
    (item) => item.title !== "Code Block"
  );

  const codeBlockItem = {
    title: "Code Block",
    subtext: "코드 블록 (Syntax Highlighting)",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks(
        [{ type: "codeBlock", props: { language: "typescript" } }],
        currentBlock,
        "after"
      );
    },
    aliases: ["code", "코드", "```"],
    group: "Other",
    icon: <Code className="h-4 w-4" />,
  };

  const calloutItems = calloutTypes.slice(0, 4).map((type) => {
    const Icon = type.icon;
    return {
      title: `${type.title} Callout`,
      subtext: `${type.title} 콜아웃 블록`,
      onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks(
          [{ type: "callout", props: { type: type.value } }],
          currentBlock,
          "after"
        );
      },
      aliases: [type.value, `callout-${type.value}`],
      group: "Callouts",
      icon: <Icon className="h-4 w-4" style={{ color: type.color }} />,
    };
  });

  const genericCallout = {
    title: "Callout",
    subtext: "콜아웃 블록 추가",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks(
        [{ type: "callout", props: { type: "info" } }],
        currentBlock,
        "after"
      );
    },
    aliases: ["callout", "콜아웃", "alert"],
    group: "Other",
    icon: <MessageSquareQuote className="h-4 w-4" />,
  };

  return [...defaultItems, codeBlockItem, genericCallout, ...calloutItems];
};

// Props
interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (markdown: string) => void;
  editable?: boolean;
  className?: string;
}

export function BlockNoteEditor({
  initialContent,
  onChange,
  editable = true,
  className,
}: BlockNoteEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create the editor instance
  const editor = useCreateBlockNote({
    schema,
  });

  // Handle ```lang + Enter to create code block
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      const currentBlock = editor.getTextCursorPosition().block;
      if (!currentBlock || currentBlock.type !== "paragraph") return;

      const textContent = (currentBlock.content as any[])
        ?.filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("");

      if (!textContent) return;

      const codeBlockMatch = textContent.match(/^```(\w*)$/);
      if (!codeBlockMatch) return;

      e.preventDefault();
      e.stopPropagation();

      const language = codeBlockMatch[1] || "typescript";
      const languageMap: Record<string, string> = {
        ts: "typescript",
        js: "javascript",
        py: "python",
        sh: "bash",
        shell: "bash",
        rs: "rust",
        yml: "yaml",
        md: "markdown",
      };

      const mappedLanguage = languageMap[language] || language;

      editor.updateBlock(currentBlock.id, {
        type: "codeBlock",
        props: { language: mappedLanguage },
        content: [],
      });

      setTimeout(() => {
        editor.setTextCursorPosition(currentBlock.id, "start");
      }, 0);
    };

    const editorElement = document.querySelector(".bn-editor");
    if (editorElement) {
      editorElement.addEventListener(
        "keydown",
        handleKeyDown as EventListener,
        true
      );
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener(
          "keydown",
          handleKeyDown as EventListener,
          true
        );
      }
    };
  }, [editor, isMounted]);

  // Slash menu items
  const slashMenuItems = useMemo(
    () => getCustomSlashMenuItems(editor),
    [editor]
  );

  // Mention suggestion items
  const getMentionSuggestionItems = useCallback(
    (query: string) => {
      const items = getMentionItems(query);

      const concepts = items.filter((i) => i.type === "concept");
      const documents = items.filter((i) => i.type === "document");

      const suggestionItems: any[] = [];

      concepts.slice(0, 5).forEach((item) => {
        suggestionItems.push({
          title: item.name,
          subtext: item.description || "Concept",
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: "mention",
                props: {
                  mentionType: "concept",
                  id: item.id,
                  name: item.name,
                },
              },
              " ",
            ]);
          },
          group: "📚 용어 (Concepts)",
          icon: <Lightbulb className="h-4 w-4 text-violet-500" />,
        });
      });

      documents.slice(0, 5).forEach((item) => {
        suggestionItems.push({
          title: item.name,
          subtext: "Document",
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: "mention",
                props: {
                  mentionType: "document",
                  id: item.id,
                  name: item.name,
                },
              },
              " ",
            ]);
          },
          group: "📄 문서 (Documents)",
          icon: <FileText className="h-4 w-4 text-blue-500" />,
        });
      });

      if (query.trim()) {
        suggestionItems.push({
          title: `"${query}" 새 Concept 생성`,
          subtext: "빈 껍데기 노드 생성",
          onItemClick: () => {
            const newItem = createStubNode("concept", query);
            editor.insertInlineContent([
              {
                type: "mention",
                props: {
                  mentionType: "concept",
                  id: newItem.id,
                  name: newItem.name,
                },
              },
              " ",
            ]);
          },
          group: "➕ 새로 만들기",
          icon: <Plus className="h-4 w-4 text-green-500" />,
        });

        suggestionItems.push({
          title: `"${query}" 새 Document 생성`,
          subtext: "빈 껍데기 노드 생성",
          onItemClick: () => {
            const newItem = createStubNode("document", query);
            editor.insertInlineContent([
              {
                type: "mention",
                props: {
                  mentionType: "document",
                  id: newItem.id,
                  name: newItem.name,
                },
              },
              " ",
            ]);
          },
          group: "➕ 새로 만들기",
          icon: <Plus className="h-4 w-4 text-green-500" />,
        });
      }

      return suggestionItems;
    },
    [editor]
  );

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center h-full ${className || ""}`}>
        <div className="text-muted-foreground">에디터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={`blocknote-wrapper ${className || ""}`}>
      <BlockNoteView
        editor={editor}
        theme="light"
        editable={editable}
        onChange={() => {
          // Convert to markdown if onChange is provided
          if (onChange) {
            // BlockNote에서 마크다운 변환 (간단한 버전)
            const blocks = editor.document;
            const markdown = blocks
              .map((block: any) => {
                if (block.type === "heading") {
                  const level = block.props?.level || 1;
                  const text = block.content
                    ?.map((c: any) => c.text)
                    .join("") || "";
                  return `${"#".repeat(level)} ${text}`;
                }
                if (block.type === "paragraph") {
                  return block.content?.map((c: any) => c.text).join("") || "";
                }
                if (block.type === "bulletListItem") {
                  return `- ${block.content?.map((c: any) => c.text).join("") || ""}`;
                }
                if (block.type === "numberedListItem") {
                  return `1. ${block.content?.map((c: any) => c.text).join("") || ""}`;
                }
                return "";
              })
              .join("\n");
            onChange(markdown);
          }
        }}
        slashMenu={false}
      >
        {editable && (
          <>
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) => {
                return slashMenuItems.filter(
                  (item) =>
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.aliases?.some((alias: string) =>
                      alias.toLowerCase().includes(query.toLowerCase())
                    )
                );
              }}
            />
            <SuggestionMenuController
              triggerCharacter="@"
              getItems={async (query) => getMentionSuggestionItems(query)}
            />
          </>
        )}
      </BlockNoteView>
    </div>
  );
}

