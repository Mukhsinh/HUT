"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { FullscreenFormModal } from "@/components/FullscreenFormModal";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCookie } from "cookies-next";
import { getRoleFromCookie } from "@/lib/permissions";


const toLocalDateString = (dateObj: Date) => {
    const tzOffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 10);
    return localDate;
};

export default function FinanceDashboard() {
    const [role, setRole] = useState<"super_admin" | "staf" | null>(null);
    const canAddTransactions = role === "super_admin";
    const canEditTransactions = role === "super_admin";

    const getInitialFormData = () => ({
        amount: "",
        category: "Sponsorship",
        description: "",
        proof: "",
        transaction_date: toLocalDateString(new Date()),
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showTransactions, setShowTransactions] = useState(true);
    const [formData, setFormData] = useState(getInitialFormData());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const transactionData = {
                type: transactionType,
                amount: parseFloat(formData.amount),
                category: formData.category,
                note: formData.description,
                proof_url: formData.proof,
                created_at: (() => {
                    const [year, month, day] = formData.transaction_date.split('-').map(Number);
                    return new Date(year, month - 1, day, 12, 0, 0).toISOString();
                })(),
            };

            if (editingId) {
                const { error } = await supabase
                    .from("transactions")
                    .update(transactionData)
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("transactions").insert([transactionData]);
                if (error) throw error;
            }

            setIsAddModalOpen(false);
            setEditingId(null);
            setFormData(getInitialFormData());
            fetchTransactions();
        } catch (err: any) {
            alert("Gagal menyimpan data: " + err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (t: any) => {
        setEditingId(t.id);
        setTransactionType(t.type);
        setFormData({
            amount: t.amount.toString(),
            category: t.category,
            description: t.note || "",
            proof: t.proof_url || "",
            transaction_date: t.created_at ? toLocalDateString(new Date(t.created_at)) : toLocalDateString(new Date()),
        });
        setIsAddModalOpen(true);
    };

    const [transactions, setTransactions] = useState<any[]>([]);
    const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

    useEffect(() => {
        const authSession = getCookie("auth_session");
        if (authSession) {
            const userRole = getRoleFromCookie(String(authSession));
            setRole(userRole);
        }


        fetchTransactions();
    }, []);



    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
            if (error) throw error;

            const sortedData = (data || []).sort((a: any, b: any) => {
                const dateA = new Date(a.created_at).setHours(0, 0, 0, 0);
                const dateB = new Date(b.created_at).setHours(0, 0, 0, 0);
                if (dateA !== dateB) return dateB - dateA; // Latest date first
                if (a.type === 'income' && b.type === 'expense') return -1;
                if (a.type === 'expense' && b.type === 'income') return 1;
                return 0;
            });

            const income = sortedData.filter(t => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            const expense = sortedData.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

            setTransactions(sortedData);
            setTotals({
                income,
                expense,
                balance: income - expense
            });
        } catch (err) {
            console.error(err);
            setTotals({ income: 0, expense: 0, balance: 0 });
        }
    };



    return (
        <div className="space-y-6 pb-20">
            <section className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">Ringkasan Keuangan</h1>
                    <p className="text-muted-foreground text-sm">Update Real-time HUT IBI Ke-75</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData(getInitialFormData());
                        setIsAddModalOpen(true);
                    }}
                    disabled={!canAddTransactions}
                    title={!canAddTransactions ? "Anda tidak memiliki akses untuk menambah transaksi" : ""}
                    className={`${canAddTransactions
                        ? "bg-primary text-white hover:scale-105 active:scale-95 cursor-pointer"
                        : "bg-gray-400 text-white cursor-not-allowed opacity-60"
                        } px-4 py-2.5 rounded-2xl shadow-lg shadow-primary/20 transition-transform flex items-center gap-2`}
                >
                    {canAddTransactions ? (
                        <>
                            <Plus size={20} />
                            <span className="text-sm font-bold hidden sm:inline">Catat Transaksi</span>
                        </>
                    ) : (
                        <>
                            <Lock size={20} />
                            <span className="text-sm font-bold hidden sm:inline">Akses Terbatas</span>
                        </>
                    )}
                </button>
            </section>

            {/* Modal Tambah/Edit Transaksi */}
            <FullscreenFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingId ? "Edit Transaksi" : "Catat Transaksi Baru"}
                subtitle="Catat semua pemasukan dan pengeluaran dengan detail lengkap"
                isLoading={isLoading}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Tipe Transaksi</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setTransactionType("income")}
                                className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${transactionType === "income"
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-transparent bg-muted text-muted-foreground"
                                    }`}
                            >
                                Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => setTransactionType("expense")}
                                className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${transactionType === "expense"
                                    ? "border-rose-500 bg-rose-50 text-rose-500"
                                    : "border-transparent bg-muted text-muted-foreground"
                                    }`}
                            >
                                Pengeluaran
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Nominal (Rp)</label>
                        <input
                            type="number"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="Contoh: 1000000"
                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Tanggal Transaksi</label>
                        <input
                            type="date"
                            required
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Kategori</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option>Sponsorship</option>
                            <option>Registrasi Peserta</option>
                            <option>Hibah/Donasi</option>
                            <option>Konsumsi</option>
                            <option>Perlengkapan</option>
                            <option>Iuran</option>
                            <option>Lainnya</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Keterangan: {editingId ? "(Bukti Transaksi lama tetap tersimpan)" : "(Opsional)"}</label>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setFormData({ ...formData, proof: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="w-full p-3 bg-muted/30 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 text-muted-foreground"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Deskripsi/Catatan</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detail transaksi..."
                            rows={4}
                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center cursor-pointer sticky bottom-6"
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {editingId ? "Update Perubahan" : "Simpan Transaksi"}
                    </button>
                </form>
            </FullscreenFormModal>

            <Card className="relative overflow-hidden bg-primary text-white border-none shadow-xl shadow-primary/10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={120} />
                </div>
                <CardContent className="p-8">
                    <p className="text-primary-foreground/80 text-sm font-medium">Total Sisa Kas</p>
                    <h2 className="text-3xl font-bold mt-1">Rp {totals.balance.toLocaleString("id-ID")}</h2>
                    <div className="flex items-center mt-4 space-x-2 text-xs bg-white/10 w-fit px-2 py-1 rounded-full">
                        <span className="opacity-80" suppressHydrationWarning>Terakhir update: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-primary mb-1">
                                <ArrowUpRight size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Pendapatan</span>
                            </div>
                        </div>
                        <p className="text-lg font-bold">Rp {totals.income.toLocaleString("id-ID")}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-rose-500 mb-1">
                            <ArrowDownRight size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Pengeluaran</span>
                        </div>
                        <p className="text-lg font-bold">Rp {totals.expense.toLocaleString("id-ID")}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between">
                    <h3 className="font-bold text-lg">History Transaksi</h3>
                    <button
                        onClick={() => setShowTransactions(!showTransactions)}
                        className="text-primary text-sm font-bold bg-white px-4 py-2 rounded-full border border-primary/20 shadow-sm cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                        {showTransactions ? "Sembunyikan" : "Tampilkan Semua"}
                    </button>
                </CardHeader>
                {showTransactions && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 px-5 pb-5 max-h-[calc(100vh-380px)] overflow-y-auto">
                        {transactions.map((t) => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-primary/5 shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{t.category}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })} • {t.note || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString("id-ID")}
                                    </p>
                                    {canEditTransactions && (
                                        <button
                                            onClick={() => handleEdit(t)}
                                            className="text-[10px] font-bold text-primary mt-1 hover:underline cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <p className="text-center py-10 text-muted-foreground text-sm italic">Belum ada transaksi</p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
