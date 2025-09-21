

import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc, updateDoc, writeBatch, query, where, limit, Timestamp, orderBy } from 'firebase/firestore';
import type { CartItem } from '@/hooks/use-cart';

export interface Review {
    author: string;
    rating: number;
    comment: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string; 
  rating: number;
  soldCount: number;
  reviews?: Review[];
  isHotDeal?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Banner {
  id: string;
  alt: string;
  imageUrl: string;
  link: string;
}


export interface Order {
    id: string; // Firestore document ID
    orderId: string; // User-facing numeric ID
    userId: string | null;
    customerInfo: {
        name: string;
        phoneNumber: string;
        address: string;
        paymentOption: 'cod_with_advance' | 'full_advance';
        paymentMethod: 'bkash' | 'nagad';
        transactionId: string;
        senderNumber: string;
    };
    items: CartItem[];
    total: number;
    status: string;
    createdAt: string; // Changed from Timestamp to string for serialization
}

export interface PaymentNumber {
    id: string;
    type: 'bkash' | 'nagad';
    number: string;
    accountType: 'Personal' | 'Agent';
}


function generateSlug(name: string) {
    return name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

// This is a simplified seeding mechanism. In a real app, you'd use a dedicated script.
async function seedDatabase() {
    try {
        const productsCollection = collection(db, 'products');
        
        // Check if seeding is already done by querying for a single document.
        const q = query(productsCollection, limit(1));
        const productsSnapshot = await getDocs(q);

        if (productsSnapshot.empty) {
            console.log("Seeding database...");
            const batch = writeBatch(db);

            staticCategories.forEach(category => {
                const categoryRef = doc(db, "categories", category.slug);
                batch.set(categoryRef, { name: category.name, slug: category.slug });
            });

            staticProducts.forEach(product => {
                const productSlug = generateSlug(product.name);
                // Let Firestore auto-generate the ID
                const productRef = doc(collection(db, "products"));
                const fullProduct = {
                     ...product,
                    slug: productSlug,
                    rating: parseFloat(((Math.random() * 1.5) + 3.5).toFixed(1)),
                };
                batch.set(productRef, fullProduct);
            });

            // Seed payment numbers
            const paymentNumbersRef = collection(db, "paymentNumbers");
            batch.set(doc(paymentNumbersRef), { type: 'bkash', number: '01750016536', accountType: 'Personal' });
            batch.set(doc(paymentNumbersRef), { type: 'nagad', number: '01865870357', accountType: 'Personal' });
            
            // Seed banners
            const bannersRef = collection(db, "banners");
            batch.set(doc(bannersRef), { alt: 'Promotional Banner 1', imageUrl: 'https://picsum.photos/1200/400?random=10', link: '/category/apparel' });
            batch.set(doc(bannersRef), { alt: 'Promotional Banner 2', imageUrl: 'https://picsum.photos/1200/400?random=11', link: '/category/electronics' });
            batch.set(doc(bannersRef), { alt: 'Promotional Banner 3', imageUrl: 'https://picsum.photos/1200/400?random=12', link: '/' });


            await batch.commit();
            console.log("Seeding complete.");
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

// Call seeding on server start
seedDatabase();


export async function getProducts(options: { hotDealsOnly?: boolean } = {}): Promise<Product[]> {
  try {
    const productsCollection = collection(db, 'products');
    let q = query(productsCollection);

    if (options.hotDealsOnly) {
        q = query(q, where("isHotDeal", "==", true));
    }

    const productsSnapshot = await getDocs(q);
    if (productsSnapshot.empty) {
      console.log("No products found for the given query.");
      return [];
    }
    return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
      console.error("Error fetching products: ", error);
      return []; // Return an empty array on error to prevent crashes
  }
}

export async function searchProducts(queryTerm: string): Promise<Product[]> {
    const allProducts = await getProducts();
    if (!queryTerm) {
        return [];
    }

    const lowercasedQuery = queryTerm.toLowerCase();

    return allProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(lowercasedQuery);
        const descriptionMatch = product.description.toLowerCase().includes(lowercasedQuery);
        // Add more fields to search here if needed, e.g., category
        // const categoryMatch = product.category.toLowerCase().includes(lowercasedQuery);
        return nameMatch || descriptionMatch;
    });
}


export async function getProductById(id: string): Promise<Product | undefined> {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return undefined;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return undefined;
  }
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Product;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const allProducts = await getProducts();
  const categoryName = (await getCategoryBySlug(categorySlug))?.name;
  if (!categoryName) return [];
  return allProducts.filter(p => p.category === categoryName);
}

export async function getCategories(): Promise<Category[]> {
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    if (categoriesSnapshot.empty) return [];
    return categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), slug: doc.id } as Category));
}


export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const docRef = doc(db, 'categories', slug);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data(), slug: docSnap.id } as Category;
  }
  return undefined;
}

// Admin panel functions

// Product Management
export async function createOrUpdateProduct(productData: Omit<Product, 'id' | 'slug'>, productId?: string) {
    const productSlug = generateSlug(productData.name);
    
    const dataToSave = {
        ...productData,
        slug: productSlug,
        isHotDeal: productData.isHotDeal || false,
        reviews: productData.reviews || [], // Ensure reviews are always included
    };
    
    if (productId) {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, dataToSave);
        return productId;
    } else {
        const newProduct = {
            ...dataToSave,
            rating: parseFloat(((Math.random() * 1.5) + 3.5).toFixed(1)), // 3.5 to 5.0
            soldCount: Math.floor(Math.random() * 200) + 10, // 10 to 209
        }
        const docRef = await addDoc(collection(db, 'products'), newProduct);
        return docRef.id;
    }
}


export async function deleteProduct(productId: string) {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
}

// Category Management
export async function createOrUpdateCategory(categoryData: Omit<Category, 'id' | 'slug'>, categoryId?: string) {
    const slug = generateSlug(categoryData.name);
    
    if (categoryId) {
        // If the name changes, the slug should change. 
        // This can be complex if products are linked by slug.
        // For simplicity, we prevent slug changes on edit.
        const categoryRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryRef, { name: categoryData.name });
        return categoryId;
    } else {
        // For new categories, we create a doc with the generated slug as its ID.
        const categoryRef = doc(db, 'categories', slug);
        await setDoc(categoryRef, { name: categoryData.name, slug: slug });
        return slug;
    }
}

export async function deleteCategory(categoryId: string) {
    // Note: This doesn't handle products that might be associated with this category.
    // In a real app, you might want to re-categorize them or handle this case.
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
}

// Order Management
export async function getOrders(): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            return {
                id: doc.id,
                ...data,
                createdAt,
            } as Order;
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            return {
                id: doc.id,
                ...data,
                createdAt: createdAt,
            } as Order;
        });
    } catch (error) {
        console.error(`Error fetching orders for user ${userId}:`, error);
        return [];
    }
}

export async function getOrderBySearchTerm(searchTerm: string): Promise<Order | undefined> {
    try {
        const ordersRef = collection(db, 'orders');
        
        // Try searching by orderId first
        let q = query(ordersRef, where('orderId', '==', searchTerm), limit(1));
        let querySnapshot = await getDocs(q);

        // If not found, try by phone number
        if (querySnapshot.empty) {
            q = query(ordersRef, where('customerInfo.phoneNumber', '==', searchTerm), orderBy('createdAt', 'desc'), limit(1));
            querySnapshot = await getDocs(q);
        }
        
        if (querySnapshot.empty) {
            return undefined;
        }

        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return {
            id: docSnap.id,
            ...data,
            createdAt: createdAt,
        } as Order;

    } catch (error) {
        console.error(`Error fetching order with term ${searchTerm}:`, error);
        return undefined;
    }
}


export async function getOrderById(orderId: string): Promise<Order | undefined> {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(orderRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            return {
                id: docSnap.id,
                ...data,
                createdAt: createdAt,
            } as Order;
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        return undefined;
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
}


// Payment Number Management
export async function getPaymentNumbers(): Promise<PaymentNumber[]> {
    try {
        const paymentNumbersRef = collection(db, 'paymentNumbers');
        const q = query(paymentNumbersRef, orderBy('type'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentNumber));
    } catch (error) {
        console.error("Error fetching payment numbers:", error);
        return [];
    }
}

export async function getPaymentNumberById(id: string): Promise<PaymentNumber | undefined> {
  const docRef = doc(db, 'paymentNumbers', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PaymentNumber;
  }
  return undefined;
}


export async function handlePaymentNumberSave(data: Omit<PaymentNumber, 'id'>, id?: string) {
    if (id) {
        const paymentNumberRef = doc(db, 'paymentNumbers', id);
        await updateDoc(paymentNumberRef, data);
        return id;
    } else {
        const docRef = await addDoc(collection(db, 'paymentNumbers'), data);
        return docRef.id;
    }
}

export async function handlePaymentNumberDelete(id: string) {
    const paymentNumberRef = doc(db, 'paymentNumbers', id);
    await deleteDoc(paymentNumberRef);
}

// Banner Management
export async function getBanners(): Promise<Banner[]> {
    try {
        const bannersCollection = collection(db, 'banners');
        const bannersSnapshot = await getDocs(bannersCollection);
        if (bannersSnapshot.empty) return [];
        return bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
    } catch (error) {
        console.error("Error fetching banners: ", error);
        return [];
    }
}

export async function getBannerById(id: string): Promise<Banner | undefined> {
    const docRef = doc(db, 'banners', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Banner;
    }
    return undefined;
}

export async function createOrUpdateBanner(bannerData: Omit<Banner, 'id'>, bannerId?: string) {
    if (bannerId) {
        const bannerRef = doc(db, 'banners', bannerId);
        await updateDoc(bannerRef, bannerData);
        return bannerId;
    } else {
        const docRef = await addDoc(collection(db, 'banners'), bannerData);
        return docRef.id;
    }
}

export async function deleteBanner(bannerId: string) {
    const bannerRef = doc(db, 'banners', bannerId);
    await deleteDoc(bannerRef);
}


// NOTE: The following data is for one-time seeding of your Firestore database.
// You would typically run a script to populate your database.
// For this environment, we're including it here to show what the data looks like.
// In a real application, the functions below would directly fetch from Firestore
// without needing this static data.

const staticProducts: Omit<Product, 'id' | 'slug' | 'rating'>[] = [
  {
    name: 'Classic Blue Jeans',
    description: 'Timeless and durable, these classic blue jeans are a wardrobe staple. Made from 100% premium cotton for maximum comfort and longevity.',
    price: 590,
    originalPrice: 750,
    imageUrl: 'https://picsum.photos/600/600?random=1',
    category: 'Apparel',
    isHotDeal: true,
    soldCount: 120,
    reviews: [
      { author: 'Mehedi H.', rating: 5, comment: 'Excellent fit and very comfortable. Highly recommended!' },
      { author: 'Sadia A.', rating: 4, comment: 'Good quality denim, but the color is slightly darker than the picture.' },
    ],
  },
  {
    name: 'Smart Home Hub',
    description: 'Control your entire smart home with this central hub. Compatible with thousands of devices from various brands. Voice control enabled.',
    price: 1290,
    imageUrl: 'https://picsum.photos/600/600?random=2',
    category: 'Electronics',
    isHotDeal: false,
    soldCount: 45,
    reviews: [],
  },
  {
    name: 'Organic Green Tea',
    description: 'A soothing and healthy blend of organic green tea leaves, sourced from the finest gardens. Rich in antioxidants.',
    price: 155,
    imageUrl: 'https://picsum.photos/600/600?random=3',
    category: 'Groceries',
    isHotDeal: false,
    soldCount: 88,
    reviews: [],
  },
  {
    name: 'Leather Messenger Bag',
    description: 'A stylish and functional messenger bag crafted from genuine leather. Perfect for work, with multiple compartments including a padded laptop sleeve.',
    price: 990,
    originalPrice: 1200,
    imageUrl: 'https://picsum.photos/600/600?random=4',
    category: 'Accessories',
    isHotDeal: true,
    soldCount: 64,
    reviews: [],
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in music with these top-tier noise-cancelling headphones. Features 30-hour battery life and crystal-clear audio quality.',
    price: 2499,
    imageUrl: 'https://picsum.photos/600/600?random=5',
    category: 'Electronics',
    isHotDeal: true,
    soldCount: 150,
    reviews: [],
  },
  {
    name: 'Modern Graphic T-Shirt',
    description: 'Express yourself with this soft cotton t-shirt featuring a unique modern graphic design. Available in various sizes and colors.',
    price: 249,
    originalPrice: 350,
    imageUrl: 'https://picsum.photos/600/600?random=6',
    category: 'Apparel',
    isHotDeal: true,
    soldCount: 95,
    reviews: [],
  },
  {
    name: 'Yoga Mat',
    description: 'High-density, non-slip yoga mat for a comfortable and stable practice. Eco-friendly and easy to clean.',
    price: 350,
    imageUrl: 'https://picsum.photos/600/600?random=7',
    category: 'Sports & Outdoors',
    isHotDeal: false,
    soldCount: 30,
    reviews: [],
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Stay hydrated with this double-walled, vacuum-insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 225,
    imageUrl: 'https://picsum.photos/600/600?random=8',
    category: 'Accessories',
    isHotDeal: false,
    soldCount: 110,
    reviews: [],
  },
  {
    name: 'Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons.',
    price: 490,
    originalPrice: 600,
    imageUrl: 'https://picsum.photos/600/600?random=9',
    category: 'Electronics',
    isHotDeal: true,
    soldCount: 78,
    reviews: [],
  },
  {
    name: 'Summer T-Shirt',
    description: 'Lightweight and breathable t-shirt, perfect for hot summer days.',
    price: 190,
    imageUrl: 'https://picsum.photos/600/600?random=10',
    category: 'Apparel',
    isHotDeal: false,
    soldCount: 200,
    reviews: [],
  },
  {
    name: 'Espresso Machine',
    description: 'Barista-grade espresso machine for your home kitchen.',
    price: 4990,
    originalPrice: 5500,
    imageUrl: 'https://picsum.photos/600/600?random=11',
    category: 'Home & Kitchen',
    isHotDeal: false,
    soldCount: 25,
    reviews: [],
  },
  {
    name: 'Vitamin C Serum',
    description: 'Brightening and anti-aging serum with 20% Vitamin C.',
    price: 350,
    imageUrl: 'https://picsum.photos/600/600?random=12',
    category: 'Beauty & Personal Care',
    isHotDeal: false,
    soldCount: 90,
    reviews: [],
  },
  {
    name: 'The Alchemist',
    description: 'A classic novel by Paulo Coelho.',
    price: 180,
    imageUrl: 'https://picsum.photos/600/600?random=13',
    category: 'Books',
    isHotDeal: false,
    soldCount: 300,
    reviews: [],
  },
  {
    name: 'Building Blocks Set',
    description: 'A 500-piece building block set for endless creativity.',
    price: 550,
    imageUrl: 'https://picsum.photos/600/600?random=14',
    category: 'Toys & Games',
    isHotDeal: false,
    soldCount: 15,
    reviews: [],
  },
  {
    name: 'Car Phone Mount',
    description: 'Universal car phone mount with a strong suction cup.',
    price: 250,
    imageUrl: 'https://picsum.photos/600/600?random=15',
    category: 'Automotive',
    isHotDeal: false,
    soldCount: 180,
    reviews: [],
  },
];

const staticCategories = [...new Set(staticProducts.map(p => p.category))].map((name) => ({
    name: name,
    slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, ''),
}));




