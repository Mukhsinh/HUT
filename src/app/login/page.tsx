"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulated localized auth based on user requirements
        setTimeout(() => {
            if (email === "sarahsafitri33@gmail.com" && password === "Pekalongan33") {
                // Set a simple auth cookie (expiring in 7 days)
                setCookie("auth_session", "true", { maxAge: 60 * 60 * 24 * 7 });
                router.push("/");
            } else {
                setError("Email atau Password salah. Silakan coba lagi.");
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 mb-6">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">HUT IBI Pekalongan</h1>
                    <p className="text-muted-foreground text-sm">Masuk untuk mengelola kegiatan & keuangan</p>
                </div>

                <Card className="border-border/40 shadow-2xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center">
                                    <Mail size={14} className="mr-2 text-primary" />
                                    Email Pengguna
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="sarahsafitri33@gmail.com"
                                    className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center">
                                    <Lock size={14} className="mr-2 text-primary" />
                                    Kata Sandi
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-rose-500 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                ) : (
                                    "Masuk Sekarang"
                                )}
                            </button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Ikatan Bidan Indonesia © 2026
                </p>
            </div>
        </div>
    );
}
