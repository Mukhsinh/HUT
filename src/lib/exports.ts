import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { IBI_LOGO_BASE64 } from "./logo";

interface ReportData {
    title: string;
    subtitle: string;
    headers: string[];
    rows: any[][];
    signatureText?: string;
}

const addBranding = (doc: jsPDF, pageNumber: number, totalPages: number) => {
    // Logo
    try {
        doc.addImage(IBI_LOGO_BASE64, "PNG", 15, 8, 20, 20);
    } catch (e) {
        console.error("Logo failed to load", e);
    }

    // Header Kop Surat
    doc.setFontSize(16);
    doc.setTextColor(173, 20, 87); // Pink/Rose color from theme
    doc.setFont("helvetica", "bold");
    doc.text("IKATAN BIDAN INDONESIA", 105, 15, { align: "center" });
    doc.text("CABANG KOTA PEKALONGAN", 105, 21, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Gedung Sekretariat IBI, Jl. WR Supratman, Kota Pekalongan, Jawa Tengah", 105, 26, { align: "center" });
    doc.line(15, 29, 195, 29); // Horizontal line

    // Footer
    const footerText = "sarah@2026.IBI Cab Kota Pekalongan";
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(footerText, 105, 287, { align: "center" });
    doc.text(`Halaman ${pageNumber} dari ${totalPages}`, 195, 287, { align: "right" });
};

export const exportToPDF = (data: ReportData) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(data.title.toUpperCase(), 105, 40, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.subtitle, 105, 46, { align: "center" });

    // Table
    autoTable(doc, {
        startY: 52,
        head: [data.headers],
        body: data.rows,
        theme: "striped",
        headStyles: { fillColor: [173, 20, 87], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [252, 228, 236] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { top: 35, bottom: 20 }
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addBranding(doc, i, totalPages);
    }

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    if (data.signatureText) {
        if (finalY > 250) doc.addPage();
        const lastPage = (doc as any).internal.getNumberOfPages();
        doc.setPage(lastPage);

        doc.setFontSize(10);
        doc.setTextColor(0);
        const signatureLines = data.signatureText.split('\n');
        let currentY = finalY + 10;
        signatureLines.forEach((line: string) => {
            doc.text(line, 150, currentY, { align: "center" });
            currentY += 6;
        });
    }

    doc.save(`${data.title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
};

export interface LPJData {
    events: any[];
    transactions: any[];
    galleries: any[];
}

export const exportFullLPJ = (data: LPJData) => {
    const doc = new jsPDF();

    // Section 1: Laporan Kegiatan
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN PERTANGGUNGJAWABAN (LPJ)", 105, 40, { align: "center" });
    doc.text("HUT IBI KE-75 KOTA PEKALONGAN", 105, 46, { align: "center" });

    doc.setFontSize(12);
    doc.text("A. Laporan Kegiatan", 15, 58);

    autoTable(doc, {
        startY: 63,
        head: [["Tanggal", "Waktu", "Kegiatan", "PIC", "Status"]],
        body: data.events.map(e => [
            new Date(e.date).toLocaleDateString("id-ID"),
            e.description?.includes("Waktu:") ? e.description.split("Waktu:")[1].trim() : "TBA",
            e.title,
            e.committees?.[0]?.name || "-",
            e.status
        ]),
        theme: "striped",
        headStyles: { fillColor: [173, 20, 87] },
        styles: { fontSize: 8 },
        margin: { top: 35 }
    });

    // Section 2: Laporan Keuangan
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 250) { doc.addPage(); finalY = 45; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("B. Laporan Keuangan", 15, finalY);

    autoTable(doc, {
        startY: finalY + 5,
        head: [["Tanggal", "Kategori", "Keterangan", "Pemasukan", "Pengeluaran", "Saldo"]],
        body: data.transactions,
        theme: "striped",
        headStyles: { fillColor: [173, 20, 87] },
        styles: { fontSize: 8 },
        margin: { top: 35 }
    });

    // Section 3: Dokumentasi Kegiatan
    finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 230) { doc.addPage(); finalY = 45; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("C. Dokumentasi Kegiatan", 15, finalY);

    let docY = finalY + 8;
    data.galleries.forEach((gal) => {
        if (docY > 240) { doc.addPage(); docY = 45; }
        try {
            if (gal.photo_url) {
                doc.addImage(gal.photo_url, "JPEG", 15, docY, 50, 35);
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text(gal.events?.title || "Kegiatan", 70, docY + 10);
                doc.setFont("helvetica", "normal");
                doc.text(gal.caption || "-", 70, docY + 16, { maxWidth: 120 });
                doc.text(new Date(gal.uploaded_at).toLocaleDateString('id-ID'), 70, docY + 30);
                docY += 42;
            }
        } catch (e) { docY += 10; }
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addBranding(doc, i, totalPages);
    }

    finalY = docY + 15;
    if (finalY > 250) doc.addPage();
    const lastPage = (doc as any).internal.getNumberOfPages();
    doc.setPage(lastPage);
    doc.setFontSize(9);
    doc.text("Mengetahui,", 60, finalY, { align: "center" });
    doc.text("Pekalongan, " + new Date().toLocaleDateString('id-ID'), 150, finalY - 5, { align: "center" });
    doc.text("Disusun oleh,", 150, finalY, { align: "center" });
    doc.text("Ketua IBI Cab. Kota Pekalongan", 60, finalY + 30, { align: "center" });
    doc.text("Ketua Panitia HUT IBI 75", 150, finalY + 30, { align: "center" });

    doc.save("LPJ_Lengkap_HUT_IBI_75.pdf");
};

export const exportDocumentationPDF = (galleries: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DOKUMENTASI KEGIATAN", 105, 40, { align: "center" });
    doc.text("HUT IBI KE-75 KOTA PEKALONGAN", 105, 46, { align: "center" });

    let docY = 55;
    galleries.forEach((gal) => {
        if (docY > 240) { doc.addPage(); docY = 45; }
        try {
            if (gal.photo_url) {
                doc.addImage(gal.photo_url, "JPEG", 15, docY, 60, 40);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text(gal.events?.title || "Kegiatan", 80, docY + 8);
                doc.setFont("helvetica", "normal");
                doc.text(gal.caption || "-", 80, docY + 15, { maxWidth: 110 });
                doc.text("Diunggah: " + new Date(gal.uploaded_at).toLocaleDateString('id-ID'), 80, docY + 35);
                docY += 50;
            }
        } catch (e) { docY += 10; }
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addBranding(doc, i, totalPages);
    }
    doc.save("Laporan_Dokumentasi_Kegiatan.pdf");
};

export const exportProofsPDF = (proofs: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DOKUMENTASI BUKTI TRANSAKSI", 105, 40, { align: "center" });
    doc.text("HUT IBI KE-75 KOTA PEKALONGAN", 105, 46, { align: "center" });

    let docY = 55;
    proofs.forEach((proof) => {
        if (docY > 240) { doc.addPage(); docY = 45; }
        try {
            if (proof.url) {
                doc.addImage(proof.url, "JPEG", 15, docY, 60, 40);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text(`${proof.type}: ${proof.category}`, 80, docY + 8);
                doc.setFont("helvetica", "normal");
                doc.text(`Nominal: Rp ${proof.amount}`, 80, docY + 15);
                doc.text(`Ket: ${proof.note || "-"}`, 80, docY + 22, { maxWidth: 110 });
                doc.text(`Tanggal: ${proof.date}`, 80, docY + 35);
                docY += 50;
            }
        } catch (e) { docY += 10; }
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addBranding(doc, i, totalPages);
    }
    doc.save("Laporan_Bukti_Transaksi.pdf");
};

export const exportToExcel = (data: ReportData) => {
    const worksheet = XLSX.utils.aoa_to_sheet([
        ["IKATAN BIDAN INDONESIA CABANG KOTA PEKALONGAN"],
        [data.title.toUpperCase()],
        [data.subtitle],
        [],
        data.headers,
        ...data.rows,
        [],
        ["dicetak secara otomatis melalui sistem HUT IBI pada " + new Date().toLocaleString()],
        ["Footer: sarah@2026.IBI Cab Kota Pekalongan"]
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `${data.title.replace(/\s+/g, "_").toLowerCase()}.xlsx`);
};

