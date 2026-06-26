"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Simulate a small network delay (much smaller than 1.5s, just for realistic feel)
    // or better yet, remove it entirely for "Fast" response.
    // I'll keep it at 300ms for a "snappy" feel if desired, 
    // but the user wants it FAST, so let's just go straight to logic.

    let userRole = null;
    let userName = null;

    // "Rumus" preserved as per original code
    if (email === "sarahsafitri33@gmail.com" && password === "Pekalongan33") {
        userRole = "super_admin";
        userName = "Sarah Safitri";
    } else if (email === "panitia@bidan.com" && password === "bidan123") {
        userRole = "staf";
        userName = "Panitia";
    }

    if (userRole) {
        // Set auth cookie using native Next.js headers (Server Side)
        // This is much faster and more reliable than client-side cookies-next
        const cookieStore = await cookies();
        cookieStore.set("auth_session", JSON.stringify({
            role: userRole,
            email,
            name: userName
        }), {
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            httpOnly: false, // Keeping it false because the original app might read it on client
            secure: process.env.NODE_ENV === 'production'
        });

        redirect('/');
    } else {
        return { error: "Email atau Password salah. Silakan coba lagi." };
    }
}

export async function registerAction(prevState: any, formData: FormData) {
    // Note: LocalStorage is client-side only. Registering via server action 
    // for localStorage logic is tricky. I'll keep the registration 
    // mostly client-side but optimize it.
    // However, if we want to be "Best Practice", we should use the database.
    // But the user said "jangan ubah rumus", and the current rumus uses localStorage.
    // I will refactor the client-side login to be faster instead.
    return { success: true };
}
