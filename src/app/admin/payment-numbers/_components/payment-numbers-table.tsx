
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaymentNumber } from "@/lib/products";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deletePaymentNumber } from "@/app/actions";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface PaymentNumbersTableProps {
  data: PaymentNumber[];
}

export function PaymentNumbersTable({ data }: PaymentNumbersTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deletePaymentNumber(id);
    if (result.success) {
      toast({ title: "Success", description: "Payment number deleted successfully." });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete payment number.",
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Account Type</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.number}</TableCell>
            <TableCell>
                 <Badge variant={item.type === 'bkash' ? 'destructive' : 'default'} className="capitalize">
                    {item.type}
                 </Badge>
            </TableCell>
            <TableCell>{item.accountType}</TableCell>
            <TableCell>
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/payment-numbers/${item.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                     <AlertDialogTrigger asChild>
                       <DropdownMenuItem className="flex items-center gap-2 text-red-500 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this payment number from checkout.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        onClick={() => onDelete(item.id)}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                        >
                        {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>

              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
