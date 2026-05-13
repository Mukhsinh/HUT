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
    const [formData, setFormData] = useState({ amount: "", category: "Sponsorship", description: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.from("transactions").insert([
                {
                    type: transactionType,
                    amount: parseFloat(formData.amount),
                    category: formData.category,
                    description: formData.description,
                    status: "completed",
                },
            ]);
            if (error) throw error;
            setIsAddModalOpen(false);
            setFormData({ amount: "", category: "Sponsorship", description: "" });
            window.location.reload();
        } catch (err) {
            console.error(err);
            setIsAddModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };
    const [transactions, setTransactions] = useState<any[]>([]);
    const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0, budget: 10000000 });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
            if (error) throw error;

            const income = data?.filter(t => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            const expense = data?.filter(t => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

            setTransactions(data || []);
            setTotals({
                income,
                expense,
                balance: income - expense,
                budget: 50000000 // HUT Budget Target
            });
        } catch (err) {
            console.error(err);
            setTotals({ income: 0, expense: 0, balance: 0, budget: 50000000 });
        }
    };

    const data = {
        labels: ["Realisasi", "Sisa Pagu"],
        datasets: [
            {
                data: [totals.expense, Math.max(0, totals.budget - totals.expense)],
                backgroundColor: ["#FF69B4", "#FCE4EC"],
                borderColor: ["#FF69B4", "#ffffff"],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        cutout: "75%",
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="space-y-6">
            <section className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">Ringkasan Keuangan</h1>
                    <p className="text-muted-foreground text-sm">Update Real-time HUT IBI Ke-75</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </section>

            {/* Modal Tambah Transaksi */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative animate-in slide-in-from-bottom duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Catat Transaksi Baru</h2>
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
                                    </select>
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
                                    Simpan Transaksi
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
                        <span className="opacity-80">Terakhir update: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-primary mb-1">
                            <ArrowUpRight size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Pendapatan</span>
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
                <CardHeader>
                    <h3 className="font-semibold">Realisasi RKA</h3>
                </CardHeader>
                <CardContent className="flex items-center justify-between py-6">
                    <div className="w-32 h-32 relative">
                        <Doughnut
                            data={{
                                labels: ["Realisasi", "Sisa Pagu"],
                                datasets: [
                                    {
                                        data: [totals.expense, Math.max(0, totals.budget - totals.expense)],
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
                                {totals.budget > 0 ? Math.round((totals.expense / totals.budget) * 100) : 0}%
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
                            <span className="font-semibold text-secondary-foreground">Rp {Math.max(0, totals.budget - totals.expense).toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
