"use client";

import React, { useState, useActionState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    // Modern React 19 form state handling
    const [state, formAction, isPending] = useActionState(loginAction, null);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1] pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/20 blur-3xl" />
                <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-primary/3 blur-3xl" />
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-3">HUT IBI Pekalongan</h1>
                    <p className="text-muted-foreground text-sm font-medium tracking-wide">
                        Akses Panel Manajemen Kegiatan & Keuangan
                    </p>
                </div>

                <Card className="border-none shadow-2xl shadow-primary/10 overflow-hidden bg-white/90 backdrop-blur-md rounded-[2.5rem]">
                    <CardContent className="p-0">
                        <div className="px-10 pb-10 pt-10">
                            <form action={formAction} className="space-y-6">
                                <div className="space-y-2 group transition-all">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary">
                                        Email Pengguna
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                                            placeholder="panitia@bidan.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group transition-all">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within:text-primary">
                                        Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {state?.error && (
                                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        {state.error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4.5 rounded-[1.25rem] shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] flex items-center justify-center space-x-3 text-sm disabled:opacity-70 h-[3.5rem] mt-2"
                                >
                                    {isPending ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span>Masuk Sekarang</span>
                                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="h-[1px] w-8 bg-slate-200" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">Ikatan Bidan Indonesia</span>
                        <div className="h-[1px] w-8 bg-slate-200" />
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold tracking-wider">
                        IBI Kota Pekalongan @ 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
