
'use server';

import { getPersonalizedRecommendations, type PersonalizedRecommendationsInput } from '@/ai/flows/personalized-recommendations';
import { getProductById, type Product, createOrUpdateProduct, deleteProduct, createOrUpdateCategory, type Category, deleteCategory, getOrders, getOrderById, updateOrderStatus, getOrdersByUserId, type PaymentNumber, getPaymentNumbers, handlePaymentNumberSave, handlePaymentNumberDelete, getOrderBySearchTerm, Order, getBanners, type Banner, createOrUpdateBanner, deleteBanner, getBannerById, searchProducts as searchProductsFromDb } from '@/lib/products';
import { revalidatePath } from 'next/cache';

export async function fetchRecommendations(input: PersonalizedRecommendationsInput) {
  try {
    const { recommendedProductIds } = await getPersonalizedRecommendations(input);
    
    const recommendedProducts = await Promise.all(
        recommendedProductIds.map(id => getProductById(id))
    );

    return recommendedProducts.filter((p): p is NonNullable<typeof p> => p !== undefined);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

// Client-side search action
export async function searchProducts(query: string): Promise<Product[]> {
    if (!query) return [];
    const products = await searchProductsFromDb(query);
    // Return a limited number of products for live search for performance
    return products.slice(0, 10);
}


// Admin Actions for Products
export async function handleProductSave(productData: Omit<Product, 'id' | 'slug'>, productId?: string) {
    try {
        await createOrUpdateProduct(productData, productId);
        revalidatePath('/admin/products');
        revalidatePath('/');
        revalidatePath(`/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to save product:", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function handleProductDelete(productId: string) {
    try {
        await deleteProduct(productId);
        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete product:", error);
        return { success: false, message: (error as Error).message };
    }
}


// Admin Actions for Categories
export async function handleCategorySave(categoryData: Omit<Category, 'id' | 'slug'>, categoryId?: string) {
     try {
        await createOrUpdateCategory(categoryData, categoryId);
        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to save category:", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function handleCategoryDelete(categoryId: string) {
    try {
        await deleteCategory(categoryId);
        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, message: (error as Error).message };
    }
}

// Admin Actions for Orders
export async function fetchOrders() {
    return await getOrders();
}

export async function fetchOrderById(orderId: string) {
    return await getOrderById(orderId);
}

export async function handleUpdateOrderStatus(orderId: string, status: string) {
    try {
        await updateOrderStatus(orderId, status);
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/account');
        return { success: true };
    } catch (error) {
        console.error("Failed to update order status:", error);
        return { success: false, message: (error as Error).message };
    }
}

// Client-side fetching
export async function fetchUserOrders(userId: string) {
    const orders = await getOrdersByUserId(userId);
    revalidatePath('/account');
    return orders;
}

export async function findOrder(searchTerm: string): Promise<Order | undefined> {
    return await getOrderBySearchTerm(searchTerm);
}

// Admin Actions for Payment Numbers
export async function fetchPaymentNumbers() {
    return await getPaymentNumbers();
}

export async function savePaymentNumber(data: Omit<PaymentNumber, 'id'>, id?: string) {
    try {
        await handlePaymentNumberSave(data, id);
        revalidatePath('/admin/payment-numbers');
        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error("Failed to save payment number:", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deletePaymentNumber(id: string) {
    try {
        await handlePaymentNumberDelete(id);
        revalidatePath('/admin/payment-numbers');
        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete payment number:", error);
        return { success: false, message: (error as Error).message };
    }
}

// Admin Actions for Banners
export async function fetchBanners() {
    return await getBanners();
}

export async function fetchBannerById(id: string) {
    return await getBannerById(id);
}

export async function handleBannerSave(bannerData: Omit<Banner, 'id'>, bannerId?: string) {
    try {
        await createOrUpdateBanner(bannerData, bannerId);
        revalidatePath('/admin/banners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to save banner:", error);
        return { success: false, message: (error as Error).message };
    }
}

export async function handleBannerDelete(bannerId: string) {
    try {
        await deleteBanner(bannerId);
        revalidatePath('/admin/banners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete banner:", error);
        return { success: false, message: (error as Error).message };
    }
}



