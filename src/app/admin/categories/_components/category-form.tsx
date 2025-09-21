
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
import type { Category } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { handleCategorySave } from "@/app/actions";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: category || {
      name: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: CategoryFormValues) => {
    const result = await handleCategorySave(values, category?.id);

    if (result.success) {
      toast({
        title: "Success",
        description: `Category ${category ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/categories");
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Apparel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (category ? "Save Changes" : "Create Category")}
        </Button>
      </form>
    </Form>
  );
}
