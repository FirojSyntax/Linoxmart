
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
  FormDescription
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
import type { Product, Category, Review } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { handleProductSave } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const reviewSchema = z.object({
  author: z.string().min(1, "Author name is required."),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5."),
  comment: z.string().min(1, "Comment cannot be empty."),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description is too short."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  originalPrice: z.coerce.number().optional(),
  imageUrl: z.string().url("Please enter a valid URL."),
  category: z.string().min(1, "Please select a category."),
  reviews: z.array(reviewSchema).optional(),
  isHotDeal: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? { 
          ...product, 
          originalPrice: product.originalPrice || undefined,
          reviews: product.reviews || [],
          isHotDeal: product.isHotDeal || false,
        }
      : {
          name: "",
          description: "",
          price: 0,
          originalPrice: undefined,
          imageUrl: "https://picsum.photos/600/600",
          category: "",
          reviews: [],
          isHotDeal: false,
        },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reviews",
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: ProductFormValues) => {
    const productData = {
        ...values,
        reviews: values.reviews || [],
    };
    // This is a bit of a hack since the full product isn't available here.
    // The server action will fill in the blanks.
    const fullProductData = {
      ...productData,
      soldCount: product?.soldCount || 0,
      rating: product?.rating || 0
    }

    const result = await handleProductSave(fullProductData, product?.id);

    if (result.success) {
      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/products");
      router.refresh(); // Refresh the page to show the new data
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
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Classic Blue Jeans" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the product..." {...field} rows={8} />
              </FormControl>
              <FormDescription>
                You can use HTML tags like &lt;h2&gt;, &lt;a&gt;, or &lt;img&gt; for formatting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g. 590" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Original Price (Optional)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g. 750" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isHotDeal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Hot Deal
                </FormLabel>
                <FormDescription>
                  Check this to feature this product in the "Hot Deals" section on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <FormField
                  control={form.control}
                  name={`reviews.${index}.author`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Reviewer's Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name={`reviews.${index}.rating`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" placeholder="1-5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name={`reviews.${index}.comment`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Review text..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ author: "", rating: 5, comment: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Review
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (product ? "Save Changes" : "Create Product")}
        </Button>
      </form>
    </Form>
  );
}
