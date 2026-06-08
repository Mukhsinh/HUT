"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Loader2, Lock, Mail, ShieldCheck, UserPlus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulated localized auth based on user requirements
        setTimeout(() => {
            let userRole = null;
            let userName = null;
            
            if (email === "sarahsafitri33@gmail.com" && password === "Pekalongan33") {
                userRole = "super_admin";
                userName = "Sarah Safitri";
            } else if (email === "panitia@bidan.com" && password === "12345") {
                userRole = "staf";
                userName = "Panitia";
            }
            
            if (userRole) {
                // Set auth cookie with role (expiring in 7 days)
                setCookie("auth_session", JSON.stringify({ role: userRole, email, name: userName }), { maxAge: 60 * 60 * 24 * 7 });
                router.push("/");
            } else {
                setError("Email atau Password salah. Silakan coba lagi.");
                setIsLoading(false);
            }
        }, 1500);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!fullName.trim()) {
            setError("Nama lengkap harus diisi");
            setIsLoading(false);
            return;
        }

        if (!phone.trim() || phone.length < 10) {
            setError("Nomor WhatsApp harus valid (minimal 10 digit)");
            setIsLoading(false);
            return;
        }

        // Simulated registration with pending verification
        setTimeout(() => {
            try {
                // Store pending user data in localStorage for admin verification
                const pendingUsers = JSON.parse(localStorage.getItem("pending_users") || "[]");
                const existingEmail = pendingUsers.some((u: any) => u.email === email);
                
                if (existingEmail) {
                    setError("Email sudah terdaftar. Silakan coba login atau gunakan email lain.");
                    setIsLoading(false);
                    return;
                }

                const newUser = {
                    id: Date.now().toString(),
                    email,
                    fullName,
                    phone,
                    createdAt: new Date().toISOString(),
                    status: "pending"
                };

                pendingUsers.push(newUser);
                localStorage.setItem("pending_users", JSON.stringify(pendingUsers));

                setError("");
                alert("✓ Pendaftaran berhasil!\n\nAkun Anda sedang menunggu verifikasi admin.\nAnda akan menerima notifikasi via WhatsApp setelah disetujui.");
                
                // Reset form and go back to login
                setMode("login");
                setEmail("");
                setPassword("");
                setFullName("");
                setPhone("");
            } catch (err) {
                setError("Terjadi kesalahan saat pendaftaran. Silakan coba lagi.");
            } finally {
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20 mb-6">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">HUT IBI Pekalongan</h1>
                    <p className="text-muted-foreground text-sm">
                        {mode === "login" 
                            ? "Masuk untuk mengelola kegiatan & keuangan"
                            : "Daftarkan akun baru Anda"}
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border-border/40 shadow-2xl">
                    <CardContent className="p-6">
                        {mode === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-5">
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
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base"
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
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-rose-500 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center text-base"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                    ) : (
                                        "Masuk Sekarang"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Siti Rahma"
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center">
                                        <Mail size={14} className="mr-2 text-primary" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@example.com"
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Nomor WhatsApp</label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="62812345678"
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
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
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-rose-500 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center text-base"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                    ) : (
                                        <>
                                            <UserPlus size={20} className="mr-2" />
                                            Daftar Sekarang
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Mode Switch — only show back button when in register mode */}
                        {mode === "register" && (
                            <div className="mt-6 pt-6 border-t border-border/20">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode("login");
                                        setError("");
                                        setEmail("");
                                        setPassword("");
                                        setFullName("");
                                        setPhone("");
                                    }}
                                    className="w-full text-primary text-sm font-bold hover:underline flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} />
                                    Sudah punya akun? Masuk di sini
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Ikatan Bidan Indonesia © 2026
                </p>
            </div>
        </div>
    );
}
