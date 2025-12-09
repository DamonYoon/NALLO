"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  FileIcon,
  ImageIcon,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface FileWithPreview extends File {
  preview?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface FileUploaderProps {
  /** Accepted file types (e.g., "image/*", ".pdf,.doc") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Callback when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Callback to handle upload (should return uploaded file info) */
  onUpload?: (file: File) => Promise<{ id: string; url: string }>;
  /** Current uploaded files */
  files?: UploadedFile[];
  /** Callback when file is removed */
  onRemove?: (fileId: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Show file preview */
  showPreview?: boolean;
  /** Custom drop zone content */
  dropZoneContent?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return FileIcon;
}

export function FileUploader({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  onFilesSelected,
  onUpload,
  files = [],
  onRemove,
  disabled = false,
  showPreview = true,
  dropZoneContent,
  className,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setError(null);

      const newFiles = Array.from(fileList);

      // Check max files
      if (maxFiles && files.length + newFiles.length > maxFiles) {
        setError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다`);
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        validFiles.push(file);
      }

      onFilesSelected?.(validFiles);

      // Clear input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [files.length, maxFiles, onFilesSelected, validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const { files: droppedFiles } = e.dataTransfer;
      handleFiles(droppedFiles);
    },
    [disabled, handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-muted/30",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {dropZoneContent || (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">
              파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-muted-foreground">
              {accept ? `지원 형식: ${accept}` : "모든 파일 형식 지원"} (최대{" "}
              {formatFileSize(maxSize)})
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && showPreview && (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);

            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  file.status === "error" && "border-destructive bg-destructive/5"
                )}
              >
                {/* Icon */}
                <div className="shrink-0">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {file.error && (
                      <span className="text-destructive ml-2">{file.error}</span>
                    )}
                  </p>

                  {/* Progress */}
                  {file.status === "uploading" && file.progress !== undefined && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Status/Actions */}
                <div className="shrink-0">
                  {file.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {file.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {(file.status === "pending" || file.status === "success") &&
                    onRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRemove(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

