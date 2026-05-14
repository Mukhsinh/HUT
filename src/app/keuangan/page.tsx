"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FinanceDashboard() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showTransactions, setShowTransactions] = useState(false);
    const [formData, setFormData] = useState({ amount: "", category: "Sponsorship", description: "", proof: "" });

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
            setFormData({ amount: "", category: "Sponsorship", description: "", proof: "" });
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
        });
        setIsAddModalOpen(true);
    };

    const [transactions, setTransactions] = useState<any[]>([]);
    const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
    const [budgetTarget, setBudgetTarget] = useState("50000000");

    useEffect(() => {
        const savedBudget = localStorage.getItem("ibi_budget");
        if (savedBudget) {
            setBudgetTarget(savedBudget);
        }
        fetchTransactions();
    }, []);

    const handleSaveBudget = () => {
        localStorage.setItem("ibi_budget", budgetTarget);
        alert("Pagu anggaran berhasil disimpan!");
    };

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

    const budgetVal = parseFloat(budgetTarget) || 0;

    const options = {
        cutout: "75%",
        plugins: {
            legend: {
                display: false,
            },
        },
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
                        setFormData({ amount: "", category: "Sponsorship", description: "", proof: "" });
                        setIsAddModalOpen(true);
                    }}
                    className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </section>

            {/* Modal Tambah/Edit Transaksi */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative animate-in slide-in-from-bottom duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">{editingId ? "Edit Transaksi" : "Catat Transaksi Baru"}</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Tipe Transaksi</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setTransactionType("income")}
                                            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${transactionType === "income"
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-transparent bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            Pemasukan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionType("expense")}
                                            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${transactionType === "expense"
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
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                    <label className="text-sm font-semibold text-rose-500">Keterangan: {editingId ? "(Bukti Transaksi lama tetap tersimpan)" : "(Opsional)"}</label>
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
                                        className="w-full p-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-muted-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Keterangan</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detail transaksi..."
                                        rows={3}
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 mt-4 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center cursor-pointer"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                    {editingId ? "Update Perubahan" : "Simpan Transaksi"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h3 className="font-semibold">Realisasi RKA</h3>
                </CardHeader>
                <CardContent className="flex items-center justify-between py-6">
                    <div className="w-32 h-32 relative">
                        <Doughnut
                            data={{
                                labels: ["Realisasi", "Sisa Pagu"],
                                datasets: [
                                    {
                                        data: [totals.expense, Math.max(0, budgetVal - totals.expense)],
                                        backgroundColor: ["#FF69B4", "#FCE4EC"],
                                        borderColor: ["#FF69B4", "#ffffff"],
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={options}
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-bold text-primary">
                                {budgetVal > 0 ? Math.round((totals.expense / budgetVal) * 100) : 0}%
                            </span>
                            <span className="text-[8px] text-muted-foreground uppercase">Terpakai</span>
                        </div>
                    </div>
                    <div className="flex-1 ml-6 space-y-3">
                        <div className="flex items-center text-sm">
                            <div className="w-3 h-3 rounded-full bg-primary mr-2" />
                            <span className="text-muted-foreground flex-1">Realisasi</span>
                            <span className="font-semibold text-primary">Rp {totals.expense.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-3 h-3 rounded-full bg-secondary mr-2" />
                            <span className="text-muted-foreground flex-1">Sisa Pagu</span>
                            <span className="font-semibold text-secondary-foreground">Rp {Math.max(0, budgetVal - totals.expense).toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </CardContent>
                <div className="px-6 pb-6 pt-2 border-t border-border mt-2">
                    <label className="text-xs font-semibold text-muted-foreground">Pagu Anggaran Kegiatan (Rp)</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <input
                            type="number"
                            value={budgetTarget}
                            onChange={(e) => setBudgetTarget(e.target.value)}
                            className="flex-1 p-3 bg-secondary/30 border border-border rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                            onClick={handleSaveBudget}
                            className="bg-primary text-white font-semibold py-3 px-4 rounded-xl text-sm hover:bg-primary/90 transition-colors"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                    <h3 className="font-bold text-lg">History Transaksi</h3>
                    <button
                        onClick={() => setShowTransactions(!showTransactions)}
                        className="text-primary text-sm font-bold bg-white px-4 py-2 rounded-full border border-primary/20 shadow-sm"
                    >
                        {showTransactions ? "Sembunyikan" : "Tampilkan Semua"}
                    </button>
                </CardHeader>
                {showTransactions && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {transactions.map((t) => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-primary/5 shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{t.category}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID")} • {t.note || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString("id-ID")}
                                    </p>
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="text-[10px] font-bold text-primary mt-1 hover:underline"
                                    >
                                        Edit
                                    </button>
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
