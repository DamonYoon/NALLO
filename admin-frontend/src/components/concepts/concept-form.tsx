"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Language options
const languages = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
] as const;

// Zod schema for form validation
const conceptFormSchema = z.object({
  term: z
    .string()
    .min(1, "용어를 입력해주세요")
    .max(100, "용어는 100자 이내로 입력해주세요"),
  description: z
    .string()
    .min(1, "설명을 입력해주세요")
    .max(2000, "설명은 2000자 이내로 입력해주세요"),
  lang: z.enum(["ko", "en", "ja"], {
    required_error: "언어를 선택해주세요",
  }),
});

export type ConceptFormValues = z.infer<typeof conceptFormSchema>;

interface ConceptFormProps {
  defaultValues?: Partial<ConceptFormValues>;
  onSubmit: (values: ConceptFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit";
}

export function ConceptForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel,
  mode = "create",
}: ConceptFormProps) {
  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptFormSchema),
    defaultValues: {
      term: "",
      description: "",
      lang: "ko",
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (values: ConceptFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Term */}
        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>용어 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="용어를 입력하세요"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                정의할 용어를 입력합니다. 최대 100자까지 입력 가능합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Language */}
        <FormField
          control={form.control}
          name="lang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>언어 *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="언어 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>용어의 언어를 선택합니다.</FormDescription>
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
              <FormLabel>설명 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="용어에 대한 설명을 입력하세요"
                  className="resize-none"
                  rows={5}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                용어의 정의와 설명을 입력합니다. 최대 2000자까지 입력 가능합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel || (mode === "create" ? "용어 생성" : "저장")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

