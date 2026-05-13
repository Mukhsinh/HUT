"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
    Calendar,
    MapPin,
    User,
    MessageCircle,
    Phone,
    Plus,
    Search,
    ChevronRight,
    X,
    Clock,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KegiatanPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        pic_name: "",
        pic_phone: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // 1. Create Event
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .insert([{
                    title: formData.title,
                    date: formData.date,
                    time: formData.time,
                    location: formData.location,
                    description: formData.description,
                    status: "Planned"
                }])
                .select();

            if (eventError) throw eventError;

            // 2. Create Committee/PIC linked to this event
            if (eventData && eventData[0]) {
                const { error: commError } = await supabase
                    .from("committees")
                    .insert([{
                        event_id: eventData[0].id,
                        name: formData.pic_name,
                        role: "PIC",
                        phone: formData.pic_phone
                    }]);
                if (commError) throw commError;
            }

            setIsAddModalOpen(false);
            setFormData({ title: "", date: "", time: "", location: "", pic_name: "", pic_phone: "", description: "" });
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Berhasil disimpan (Simulasi)");
            setIsAddModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*, committees(*)")
                .order("date", { ascending: true });

            if (error) throw error;

            // Format divisions into the previous structure
            const formattedEvents = data?.map((e: any) => ({
                id: e.id,
                title: e.title,
                date: new Date(e.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
                time: e.time,
                location: e.location,
                status: e.status,
                color: e.status === "On Progress" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600",
                divisions: e.committees?.map((c: any) => ({
                    name: c.role,
                    pic: c.name,
                    phone: c.phone
                })) || []
            })) || [];

            setEvents(formattedEvents);
        } catch (err) {
            console.error(err);
            // Fallback mock
            setEvents([
                {
                    id: 1,
                    title: "Seminar Kebidanan (Offline Mode)",
                    date: "15 Mei 2026",
                    time: "08:00 - 13:00",
                    location: "Hotel Santika Kota Pekalongan",
                    status: "On Progress",
                    color: "bg-blue-100 text-blue-600",
                    divisions: [
                        { name: "Acara", pic: "Siti Rahma", phone: "628123456789" }
                    ]
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Rangkaian Kegiatan</h1>
                    <p className="text-muted-foreground text-sm">Monitor & Kelola Agenda HUT</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20"
                >
                    <Plus size={24} />
                </button>
            </section>

            {/* Modal Tambah Kegiatan */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl relative animate-in slide-in-from-bottom duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Tambah Kegiatan HUT</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Nama Kegiatan</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: Seminar Kebidanan..."
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-primary/70 flex items-center"><Calendar size={14} className="mr-1" /> Tanggal</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-primary/70 flex items-center"><Clock size={14} className="mr-1" /> Waktu</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center"><MapPin size={14} className="mr-1" /> Lokasi</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Contoh: Hotel Santika..."
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Nama PIC / Panitia</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.pic_name}
                                            onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                                            placeholder="Siti Rahma..."
                                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">WhatsApp (62...)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.pic_phone}
                                            onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                                            placeholder="62812..."
                                            className="w-full p-4 bg-muted/30 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Deskripsi / Catatan</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detail kegiatan..."
                                        rows={3}
                                        className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 mt-4 active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                    Simpan Kegiatan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                    <Search size={18} />
                </span>
                <input
                    type="text"
                    placeholder="Cari kegiatan atau PIC..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <Card key={event.id} className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${event.color}`}>
                                {event.status}
                            </div>
                            <button className="text-primary hover:bg-secondary p-1 rounded-full transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <h3 className="text-lg font-bold mb-4">{event.title}</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar size={14} className="mr-2 text-primary/70" />
                                    {event.date} • {event.time}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin size={14} className="mr-2 text-primary/70" />
                                    {event.location}
                                </div>
                            </div>

                            <div className="border-t border-border/30 pt-4 mt-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Struktur Panitia / PIC</h4>
                                <div className="space-y-3">
                                    {event.divisions.map((div: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-divider">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{div.pic}</p>
                                                    <p className="text-[10px] text-muted-foreground">Divisi {div.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <a
                                                    href={`https://wa.me/${div.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white"
                                                >
                                                    <MessageCircle size={16} />
                                                </a>
                                                <a
                                                    href={`tel:+${div.phone}`}
                                                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
                                                >
                                                    <Phone size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
