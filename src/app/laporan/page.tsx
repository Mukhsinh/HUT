"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
    FileText,
    Download,
    FileSpreadsheet,
    ChevronRight,
    Clock,
    CheckCircle2,
    Plus,
    Loader2,
    FileArchive,
    Camera
} from "lucide-react";
import { exportToPDF, exportToExcel, exportFullLPJ, exportDocumentationPDF, exportProofsPDF } from "@/lib/exports";
import { supabase } from "@/lib/supabase";

export default function LaporanPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ transactions: [] as any[], events: [] as any[], galleries: [] as any[] });

    const fetchReports = async () => {
        try {
            // Fetch Transactions
            const { data: transactions, error } = await supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;

            // Sort transactions: by date first, then by type (income before expense) if on the same date
            const sortedTransactions = (transactions || []).sort((a: any, b: any) => {
                const dateA = new Date(a.created_at).setHours(0, 0, 0, 0);
                const dateB = new Date(b.created_at).setHours(0, 0, 0, 0);

                if (dateA !== dateB) return dateA - dateB;

                // Same date: income before expense
                if (a.type === 'income' && b.type === 'expense') return -1;
                if (a.type === 'expense' && b.type === 'income') return 1;
                return 0;
            });

            // Fetch Events
            const { data: events, error: eError } = await supabase
                .from("events")
                .select("*, committees(*)")
                .order("date", { ascending: true });
            if (eError) throw eError;

            // Fetch Galleries
            const { data: galleries, error: gError } = await supabase
                .from("galleries")
                .select("*, events(title)")
                .order("uploaded_at", { ascending: true });
            if (gError) throw gError;

            setStats({ transactions: sortedTransactions, events: events || [], galleries: galleries || [] });

            let runningBalance = 0;
            const financeRows = sortedTransactions.map((t: any) => {
                const inc = t.type === "income" ? parseFloat(t.amount) : 0;
                const exp = t.type === "expense" ? parseFloat(t.amount) : 0;
                runningBalance = runningBalance + inc - exp;
                return [
                    new Date(t.created_at).toLocaleDateString("id-ID"),
                    t.category,
                    t.note || "-",
                    inc > 0 ? inc.toLocaleString("id-ID") : "0",
                    exp > 0 ? exp.toLocaleString("id-ID") : "0",
                    runningBalance.toLocaleString("id-ID")
                ];
            });

            const activityRows = events?.map((e: any) => {
                return [
                    e.title,
                    e.committees?.[0]?.name || "-",
                    e.location,
                    e.description?.includes("Waktu:") ? e.description.split("Waktu:")[1].trim() : "TBA",
                    e.status
                ];
            }) || [];

            setReports([
                {
                    id: "keuangan-live",
                    title: "Laporan Realisasi Kas",
                    type: "Financial",
                    date: new Date().toLocaleDateString("id-ID"),
                    status: "Siap Cetak",
                    headers: ["Tanggal", "Kategori", "Keterangan", "Pemasukan", "Pengeluaran", "Saldo"],
                    rows: financeRows,
                    isFinance: true
                },
                {
                    id: "kegiatan-live",
                    title: "Laporan Realisasi Kegiatan",
                    type: "Activity",
                    date: new Date().toLocaleDateString("id-ID"),
                    status: "On-Going",
                    headers: ["Kegiatan", "PIC", "Lokasi", "Waktu", "Status"],
                    rows: activityRows
                },
                {
                    id: "dokumentasi-kegiatan",
                    title: "Laporan Dokumentasi Kegiatan",
                    type: "Gallery",
                    date: new Date().toLocaleDateString("id-ID"),
                    status: galleries?.length ? `Ada ${galleries.length} Foto` : "Kosong",
                    isGallery: true
                }
            ]);
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleExport = (report: any, format: "pdf" | "excel") => {
        if (report.isGallery) {
            exportDocumentationPDF(stats.galleries);
            return;
        }

        const data = {
            title: report.title,
            subtitle: `Sistem HUT IBI Ke-75 | Laporan per tanggal: ${report.date}`,
            headers: report.headers,
            rows: report.rows,
            signatureText: report.isFinance
                ? "\n\nDisusun oleh,\n\n\n\nBendahara"
                : "\n\nDisusun oleh,\n\n\n\nKetua Panitia"
        };

        if (format === "pdf") {
            exportToPDF(data);
        } else {
            exportToExcel(data);
        }
    };

    const handleExportProofs = () => {
        const proofs = stats.transactions.filter((t: any) => t.proof_url).map((t: any) => ({
            date: new Date(t.created_at).toLocaleDateString("id-ID"),
            category: t.category,
            note: t.note || "-",
            amount: t.amount.toLocaleString("id-ID"),
            type: t.type === "income" ? "Pemasukan" : "Pengeluaran",
            url: t.proof_url
        }));

        if (proofs.length === 0) {
            alert("Belum ada bukti transaksi yang diunggah.");
            return;
        }

        exportProofsPDF(proofs);
    };

    const handleGenerateFullLPJ = () => {
        if (!stats.events.length) {
            alert("Data belum siap.");
            return;
        }

        let runningBalance = 0;
        const financeRows = stats.transactions.map((t: any) => {
            const inc = t.type === "income" ? parseFloat(t.amount) : 0;
            const exp = t.type === "expense" ? parseFloat(t.amount) : 0;
            runningBalance = runningBalance + inc - exp;
            return [
                new Date(t.created_at).toLocaleDateString("id-ID"),
                t.category,
                t.note || "-",
                inc > 0 ? inc.toLocaleString("id-ID") : "0",
                exp > 0 ? exp.toLocaleString("id-ID") : "0",
                runningBalance.toLocaleString("id-ID")
            ];
        });

        exportFullLPJ({
            events: stats.events,
            transactions: financeRows,
            galleries: stats.galleries
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="animate-spin text-primary mb-2" size={32} />
                <p className="text-sm text-muted-foreground font-medium">Menyiapkan laporan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold">Laporan & LPJ</h1>
                <p className="text-muted-foreground text-sm">Automated Digital Reporting IBI</p>

                <div className="pt-4">
                    <button
                        onClick={handleGenerateFullLPJ}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg flex flex-col items-center justify-center space-y-1"
                    >
                        <div className="flex items-center space-x-2">
                            <FileArchive size={20} />
                            <span>Generate LPJ Lengkap (Formal)</span>
                        </div>
                        <span className="text-[10px] font-normal opacity-90 italic">Otomatisasi Kegiatan + Keuangan + Dokumentasi</span>
                    </button>

                    <button
                        onClick={handleExportProofs}
                        className="w-full mt-3 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-semibold py-3 rounded-xl transition-all flex items-center justify-center text-sm shadow-sm"
                    >
                        <FileText size={16} className="mr-2" /> Lampiran Dokumentasi Bukti Transaksi
                    </button>
                </div>
            </section>

            <div className="space-y-4">
                {reports.map((report) => (
                    <Card key={report.id} className="border-border/40 overflow-hidden shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/20">
                            <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded-lg ${report.isFinance ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                    {report.isGallery ? <Camera size={18} /> : <FileText size={18} />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{report.type}</span>
                            </div>
                            <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-white border border-emerald-100 px-2.5 py-1 rounded-full">
                                <CheckCircle2 size={10} className="mr-1.5" />
                                {report.status}
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <h3 className="font-bold text-base mb-1">{report.title}</h3>
                            <p className="text-[10px] text-muted-foreground flex items-center mb-6">
                                <Clock size={12} className="mr-1" />
                                Terakhir Update: {report.date}
                            </p>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleExport(report, 'pdf')}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center text-sm shadow-md shadow-rose-200"
                                >
                                    <Download size={16} className="mr-2" /> PDF
                                </button>
                                {!report.isGallery && (
                                    <button
                                        onClick={() => handleExport(report, 'excel')}
                                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center text-sm border border-emerald-100"
                                    >
                                        <FileSpreadsheet size={16} className="mr-2" /> Excel
                                    </button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
