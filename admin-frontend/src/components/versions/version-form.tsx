"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

// Version form schema matching backend API
const versionFormSchema = z.object({
  version: z
    .string()
    .min(1, "버전 식별자를 입력해주세요")
    .regex(
      /^v\d+\.\d+\.\d+$/,
      "시맨틱 버전 형식이어야 합니다 (예: v1.0.0)"
    ),
  name: z
    .string()
    .min(1, "버전 이름을 입력해주세요")
    .max(255, "255자 이내로 입력해주세요"),
  description: z
    .string()
    .max(1000, "1000자 이내로 입력해주세요")
    .optional(),
  is_public: z.boolean(),
  is_main: z.boolean(),
});

export type VersionFormValues = z.infer<typeof versionFormSchema>;

interface VersionFormProps {
  /** Initial values for edit mode */
  defaultValues?: Partial<VersionFormValues>;
  /** Form submission handler */
  onSubmit: (data: VersionFormValues) => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Form mode */
  mode?: "create" | "edit";
}

export function VersionForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
}: VersionFormProps) {
  const form = useForm<VersionFormValues>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      version: "",
      name: "",
      description: "",
      is_public: false,
      is_main: false,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Version Identifier */}
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>버전 식별자 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="v1.0.0"
                      {...field}
                      disabled={mode === "edit"}
                    />
                  </FormControl>
                  <FormDescription>
                    시맨틱 버전 형식 (예: v1.0.0, v2.1.3)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>버전 이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="2025년 1분기 릴리스" {...field} />
                  </FormControl>
                  <FormDescription>
                    사용자에게 표시되는 버전의 이름입니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="이 버전에 대한 설명을 입력하세요..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    버전의 주요 변경사항이나 특이사항을 기록합니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Toggle Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Is Public */}
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">공개 버전</FormLabel>
                      <FormDescription>
                        일반 사용자에게 공개할지 여부
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Is Main */}
              <FormField
                control={form.control}
                name="is_main"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">메인 버전</FormLabel>
                      <FormDescription>
                        기본으로 표시되는 버전으로 설정
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "저장 중..."
              : mode === "create"
                ? "버전 생성"
                : "변경사항 저장"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

