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
    Loader2
} from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/exports";
import { supabase } from "@/lib/supabase";

export default function LaporanPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            // Fetch Transactions for Finance Report
            const { data: transactions, error } = await supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Format transactions into localized report format
            const financeRows = transactions?.map((t: any) => [
                new Date(t.created_at).toLocaleDateString("id-ID"),
                t.category,
                t.description || "-",
                t.type === "income" ? t.amount.toLocaleString("id-ID") : "0",
                t.type === "expense" ? t.amount.toLocaleString("id-ID") : "0"
            ]) || [];

            // Fetch Events for Activity Report
            const { data: events, error: eError } = await supabase
                .from("events")
                .select("*, committees(*)")
                .order("date", { ascending: true });

            if (eError) throw eError;

            const activityRows = events?.map((e: any) => [
                e.title,
                e.committees?.[0]?.name || "-",
                e.location,
                e.status
            ]) || [];

            setReports([
                {
                    id: "keuangan-live",
                    title: "Laporan Realisasi Kas Real-time",
                    type: "Finance",
                    date: new Date().toLocaleDateString("id-ID"),
                    status: "Real-time",
                    headers: ["Tanggal", "Kategori", "Keterangan", "Pemasukan", "Pengeluaran"],
                    rows: financeRows
                },
                {
                    id: "kegiatan-live",
                    title: "Status Rangkaian Kegiatan HUT",
                    type: "Activity",
                    date: "Update Terbaru",
                    status: "On Progress",
                    headers: ["Kegiatan", "PIC", "Lokasi", "Status"],
                    rows: activityRows
                }
            ]);
        } catch (err) {
            console.error("Error fetching reports:", err);
            // Fallback to static if DB not ready
            setReports([
                {
                    id: "keuangan-1",
                    title: "Laporan Realisasi Kas (Demo Mode)",
                    type: "Finance",
                    date: "DB Not Connected",
                    status: "Static",
                    headers: ["Tanggal", "Kategori", "Keterangan", "Pemasukan", "Pengeluaran"],
                    rows: [
                        ["10/05/2026", "Sponsorship", "Sponsor Bank Jateng", "15.000.000", "0"],
                        ["11/05/2026", "Konsumsi", "DP Makan Siang Rapat", "0", "2.500.000"],
                    ]
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = (report: any, format: "pdf" | "excel") => {
        const data = {
            title: report.title,
            subtitle: `Tanggal Laporan: ${report.date}`,
            headers: report.headers,
            rows: report.rows
        };

        if (format === "pdf") {
            exportToPDF(data);
        } else {
            exportToExcel(data);
        }
    };

    return (
        <div className="space-y-6">
            <section>
                <h1 className="text-2xl font-bold">Laporan & LPJ</h1>
                <p className="text-muted-foreground text-sm">Automated Digital Reporting IBI</p>
            </section>

            <div className="space-y-4">
                {reports.map((report) => (
                    <Card key={report.id} className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded-lg ${report.type === 'Finance' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                    <FileText size={18} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">{report.type} REPORT</span>
                            </div>
                            <div className="flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} className="mr-1" />
                                {report.status}
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <h3 className="font-bold text-base mb-2">{report.title}</h3>
                            <p className="text-xs text-muted-foreground flex items-center mb-6">
                                <Clock size={12} className="mr-1" />
                                {report.date}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleExport(report, "pdf")}
                                    className="flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-bold active:scale-95 transition-transform"
                                >
                                    <Download size={14} />
                                    <span>PDF Report</span>
                                </button>
                                <button
                                    onClick={() => handleExport(report, "excel")}
                                    className="flex items-center justify-center space-x-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-xs font-bold active:scale-95 transition-transform"
                                >
                                    <FileSpreadsheet size={14} />
                                    <span>Excel Sheet</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-secondary/40 border-dashed border-primary/30">
                <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Plus size={24} className="text-primary" />
                    </div>
                    <h4 className="text-sm font-bold">Generate Laporan Baru</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px] mx-auto">Sistem akan menarik data RKA dan Realisasi secara otomatis untuk LPJ.</p>
                </CardContent>
            </Card>
        </div>
    );
}
