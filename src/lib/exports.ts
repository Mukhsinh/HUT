import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportData {
    title: string;
    subtitle: string;
    headers: string[];
    rows: any[][];
}

export const exportToPDF = (data: ReportData) => {
    const doc = new jsPDF();

    // Header Kop Surat
    doc.setFontSize(16);
    doc.setTextColor(173, 20, 87); // Pink/Rose color from theme
    doc.text("IKATAN BIDAN INDONESIA CAB PEKALONGAN", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Gedung Sekretariat IBI, Kota Pekalongan, Jawa Tengah", 105, 20, { align: "center" });
    doc.line(15, 23, 195, 23); // Horizontal line

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(data.title.toUpperCase(), 105, 32, { align: "center" });

    doc.setFontSize(10);
    doc.text(data.subtitle, 105, 38, { align: "center" });

    // Table
    autoTable(doc, {
        startY: 45,
        head: [data.headers],
        body: data.rows,
        theme: "striped",
        headStyles: { fillColor: [255, 105, 180] }, // Primary Pink
        alternateRowStyles: { fillColor: [252, 228, 236] }, // Secondary Pink
        styles: { fontSize: 9 }
    });

    doc.save(`${data.title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
};

export const exportToExcel = (data: ReportData) => {
    const worksheet = XLSX.utils.aoa_to_sheet([
        ["IKATAN BIDAN INDONESIA CAB PEKALONGAN"],
        [data.title],
        [data.subtitle],
        [], // Empty row
        data.headers,
        ...data.rows
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `${data.title.replace(/\s+/g, "_").toLowerCase()}.xlsx`);
};
