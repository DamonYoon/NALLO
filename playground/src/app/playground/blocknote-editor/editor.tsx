"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Info,
  Code,
  MessageSquareQuote,
  Lightbulb,
  Plus,
  Edit3,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";

// Bundle created from shiki-codegen
import { createHighlighter } from "./shiki.bundle";

// Custom blocks, inline content, and styles
import { createCallout, calloutTypes } from "./custom-blocks/callout";
import {
  createMention,
  getMentionItems,
  createStubNode,
} from "./custom-blocks/mention";
import {
  createSmallCaps,
  createColorHighlight,
  createColorUnderline,
  createFontSize,
} from "./custom-blocks/custom-styles";

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
  // Get default items and filter out the default Code Block (we have our own with syntax highlighting)
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

// Initial content for demo
const initialContent = [
  {
    type: "heading" as const,
    props: { level: 1 },
    content: [
      { type: "text" as const, text: "BlockNote 커스텀 에디터", styles: {} },
    ],
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "이것은 ", styles: {} },
      {
        type: "text" as const,
        text: "커스텀 블록, 인라인 콘텐츠, 스타일",
        styles: { bold: true },
      },
      {
        type: "text" as const,
        text: "이 추가된 BlockNote 에디터입니다.",
        styles: {},
      },
    ],
  },
  {
    type: "heading" as const,
    props: { level: 2 },
    content: [
      { type: "text" as const, text: "🔗 멘션 (그래프 연결)", styles: {} },
    ],
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "Concept 멘션: ", styles: {} },
      {
        type: "mention" as const,
        props: { mentionType: "concept", id: "c1", name: "AI" },
      },
      {
        type: "text" as const,
        text: " → Document-[:USES_CONCEPT]->Concept",
        styles: {},
      },
    ],
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "Document 멘션: ", styles: {} },
      {
        type: "mention" as const,
        props: { mentionType: "document", id: "d1", name: "프로젝트 개요" },
      },
      {
        type: "text" as const,
        text: " → Document-[:LINKS_TO]->Document",
        styles: {},
      },
    ],
  },
  {
    type: "callout" as const,
    props: { type: "tip" },
    content: [
      {
        type: "text" as const,
        text: "💡 @ 입력 후 검색하여 Concept 또는 Document를 멘션하세요!",
        styles: {},
      },
    ],
  },
  {
    type: "heading" as const,
    props: { level: 2 },
    content: [{ type: "text" as const, text: "📦 커스텀 블록", styles: {} }],
  },
  {
    type: "callout" as const,
    props: { type: "info" },
    content: [
      { type: "text" as const, text: "인라인 콘텐츠로 ", styles: {} },
      { type: "text" as const, text: "굵게", styles: { bold: true } },
      { type: "text" as const, text: ", ", styles: {} },
      { type: "text" as const, text: "기울임", styles: { italic: true } },
      {
        type: "text" as const,
        text: " 등 서식을 자유롭게 사용할 수 있습니다.",
        styles: {},
      },
    ],
  },
  {
    type: "heading" as const,
    props: { level: 2 },
    content: [{ type: "text" as const, text: "🎨 커스텀 스타일", styles: {} }],
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "형광펜: ", styles: {} },
      {
        type: "text" as const,
        text: "노란색",
        styles: { colorHighlight: "yellow" },
      },
      { type: "text" as const, text: " ", styles: {} },
      {
        type: "text" as const,
        text: "초록색",
        styles: { colorHighlight: "green" },
      },
      { type: "text" as const, text: " ", styles: {} },
      {
        type: "text" as const,
        text: "파란색",
        styles: { colorHighlight: "blue" },
      },
    ],
  },
  {
    type: "heading" as const,
    props: { level: 2 },
    content: [{ type: "text" as const, text: "💻 코드 블록", styles: {} }],
  },
  {
    type: "codeBlock" as const,
    props: { language: "typescript" },
    content: [
      {
        type: "text" as const,
        text: "// 멘션을 통한 그래프 연결\ninterface MentionRelation {\n  type: 'USES_CONCEPT' | 'LINKS_TO';\n  from: DocumentNode;\n  to: ConceptNode | DocumentNode;\n}",
        styles: {},
      },
    ],
  },
  {
    type: "paragraph" as const,
    content: [],
  },
];

export default function BlockNoteEditor() {
  const { resolvedTheme } = useTheme();
  const [blockCount, setBlockCount] = useState(0);
  const [isEditable, setIsEditable] = useState(true);

  // Create the editor instance with custom schema
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent as any,
  });

  useEffect(() => {
    if (editor) {
      setBlockCount(editor.document.length);
    }
  }, [editor]);

  // Handle ```lang + Enter to create code block
  useEffect(() => {
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
  }, [editor]);

  // Custom slash menu items
  const slashMenuItems = useMemo(
    () => getCustomSlashMenuItems(editor),
    [editor]
  );

  // Get mention items for @ suggestion menu
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
          group: "📚 Concepts",
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
          group: "📄 Documents",
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
          group: "➕ Create New",
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
          group: "➕ Create New",
          icon: <Plus className="h-4 w-4 text-green-500" />,
        });
      }

      return suggestionItems;
    },
    [editor]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/playground">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">BlockNote Editor</h1>
            <p className="text-muted-foreground">
              그래프 연결이 가능한 멘션 기능이 추가된 WYSIWYG 에디터
            </p>
          </div>
        </div>

        {/* Edit/View Toggle */}
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={isEditable ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsEditable(true)}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={!isEditable ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsEditable(false)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        </div>
      </div>

      {/* Tips - Only show in edit mode */}
      {isEditable && (
      <Card className="mb-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
        <CardContent className="py-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-900 dark:text-green-100 mb-2">
                🔗 그래프 연결 멘션
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-green-700 dark:text-green-300">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                    @멘션 사용법
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    <li>
                      •{" "}
                      <code className="bg-green-100 dark:bg-green-900 px-1 rounded">
                        @
                      </code>{" "}
                      입력 후 검색
                    </li>
                    <li>• Concept / Document 선택</li>
                    <li>• 없으면 새로 생성</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                    📚 Concept 멘션
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    <li>
                      • <span className="text-violet-500">보라색</span> 태그
                    </li>
                    <li>• USES_CONCEPT 관계</li>
                    <li>• 개념 노드 연결</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                    📄 Document 멘션
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    <li>
                      • <span className="text-blue-500">파란색</span> 태그
                    </li>
                    <li>• LINKS_TO 관계</li>
                    <li>• 문서 간 연결</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                    ➕ 새 노드 생성
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    <li>• 검색 결과에 없으면</li>
                    <li>• 빈 껍데기 노드 생성</li>
                    <li>• 나중에 내용 채움</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Editor / Viewer */}
      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent className="p-0 h-full overflow-auto">
          <BlockNoteView
            editor={editor}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            editable={isEditable}
            onChange={() => {
              setBlockCount(editor.document.length);
            }}
            slashMenu={false}
          >
            {/* Only show menus in edit mode */}
            {isEditable && (
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
        </CardContent>
      </Card>

      {/* Footer Stats */}
      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Info
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mode:</span>
              <code
                className={`px-2 py-0.5 rounded ${
                  isEditable
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {isEditable ? "Edit" : "View"}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Blocks:</span>
              <code className="bg-muted px-2 py-0.5 rounded">{blockCount}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Features:</span>
              <code className="bg-muted px-2 py-0.5 rounded">
                @Mention (Concept + Document)
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

