"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Upload, X, Save, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function Galeri() {
    const [events, setEvents] = useState<any[]>([]);
    const [galleries, setGalleries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [eventId, setEventId] = useState("");
    const [caption, setCaption] = useState("");
    const [photoData, setPhotoData] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch events for dropdown
            const { data: eventsData, error: eventsError } = await supabase
                .from("events")
                .select("id, title")
                .order("date", { ascending: true });

            if (eventsError) throw eventsError;
            setEvents(eventsData || []);

            // Fetch galleries
            const { data: galleryData, error: galleryError } = await supabase
                .from("galleries")
                .select("*, events(title)")
                .order("uploaded_at", { ascending: false });

            if (galleryError) throw galleryError;
            setGalleries(galleryData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file maksimal adalah 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoData(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!eventId) {
            alert("Silakan pilih kegiatan terlebih dahulu!");
            return;
        }

        if (!photoData) {
            alert("Silakan pilih atau ambil foto dokumentasi!");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("galleries")
                .insert([{
                    event_id: eventId,
                    photo_url: photoData,
                    caption: caption,
                    uploaded_at: new Date().toISOString()
                }]);

            if (error) throw error;

            alert("Dokumentasi berhasil disimpan!");
            setEventId("");
            setCaption("");
            setPhotoData(null);
            fetchData();
        } catch (error) {
            console.error("Error saving documentation:", error);
            alert("Gagal menyimpan dokumentasi");
        } finally {
            setIsSaving(false);
        }
    };

    const triggerFileInput = (capture: boolean) => {
        if (fileInputRef.current) {
            if (capture) {
                fileInputRef.current.setAttribute("capture", "environment");
            } else {
                fileInputRef.current.removeAttribute("capture");
            }
            fileInputRef.current.click();
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6">
            <section>
                <div>
                    <h1 className="text-2xl font-bold">Galeri Kegiatan</h1>
                    <p className="text-muted-foreground text-sm">Dokumentasi HUT IBI ke-75</p>
                </div>

                <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm border border-border">
                    <h2 className="text-sm font-bold mb-4">Upload Dokumentasi Baru</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">Pilih Kegiatan</label>
                            <select
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                className="w-full mt-1 p-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            >
                                <option value="">-- Pilih Kegiatan --</option>
                                {events.map((evt) => (
                                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">Keterangan / Caption</label>
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Tulis keterangan foto..."
                                className="w-full mt-1 p-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Foto Dokumentasi</label>
                            {photoData ? (
                                <div className="relative mt-2 rounded-xl overflow-hidden border border-border bg-black aspect-video flex items-center justify-center">
                                    <Image
                                        src={photoData}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPhotoData(null)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => triggerFileInput(true)}
                                        className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition-colors text-primary"
                                    >
                                        <Camera size={24} className="mb-2" />
                                        <span className="text-xs font-medium">Buka Kamera</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => triggerFileInput(false)}
                                        className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-muted rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground"
                                    >
                                        <ImageIcon size={24} className="mb-2" />
                                        <span className="text-xs font-medium">Pilih dari Galeri</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving || !photoData || !eventId}
                            className="w-full flex items-center justify-center space-x-2 bg-primary text-white font-semibold p-3.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Simpan Dokumentasi</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-lg font-bold mb-4">Galeri Tersimpan</h2>

                {galleries.length === 0 ? (
                    <div className="text-center p-8 bg-secondary/30 rounded-2xl border border-border text-muted-foreground">
                        <ImageIcon size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Belum ada dokumentasi tersimpan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {galleries.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-border">
                                <div className="relative aspect-square w-full">
                                    <Image
                                        src={item.photo_url}
                                        alt={item.caption}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-bold text-primary truncate" title={item.events?.title}>
                                        {item.events?.title || "Kegiatan Tanpa Nama"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                        {item.caption}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/60 mt-1.5 flex justify-between items-center">
                                        <span>{new Date(item.uploaded_at).toLocaleDateString('id-ID')}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
