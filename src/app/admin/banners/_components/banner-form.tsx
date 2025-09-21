
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Banner } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { handleBannerSave } from "@/app/actions";

const formSchema = z.object({
  alt: z.string().min(2, "Alt text must be at least 2 characters."),
  imageUrl: z.string().url("Please enter a valid URL."),
  link: z.string().min(1, "Please enter a link (e.g., /categories/some-category or /)."),
});

type BannerFormValues = z.infer<typeof formSchema>;

interface BannerFormProps {
  banner?: Banner;
}

export function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: banner || {
      alt: "",
      imageUrl: "https://picsum.photos/1200/400",
      link: "/",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: BannerFormValues) => {
    const result = await handleBannerSave(values, banner?.id);

    if (result.success) {
      toast({
        title: "Success",
        description: `Banner ${banner ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/banners");
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alt Text</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Summer Sale Banner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/banner.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input placeholder="/category/electronics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (banner ? "Save Changes" : "Create Banner")}
        </Button>
      </form>
    </Form>
  );
}
