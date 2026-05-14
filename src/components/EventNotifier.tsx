"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, X, Calendar as CalendarIcon } from "lucide-react";

export default function EventNotifier() {
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        checkUpcomingEvents();
    }, []);

    const checkUpcomingEvents = async () => {
        try {
            const todayStr = new Date().toLocaleDateString("id-ID");
            const hasSeenToday = localStorage.getItem(`h3_notified_${todayStr}`);

            if (hasSeenToday) {
                return; // Already seen today
            }

            // Get events from today up to 3 days ahead
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(today.getDate() + 3);

            const { data: events, error } = await supabase
                .from("events")
                .select("*")
                .gte("date", today.toISOString())
                .lte("date", threeDaysFromNow.toISOString())
                .order("date", { ascending: true });

            if (error) throw error;

            if (events && events.length > 0) {
                setUpcomingEvents(events);
                setIsVisible(true);
            }
        } catch (error) {
            console.error("Error fetching upcoming events:", error);
        }
    };

    const handleClose = () => {
        const todayStr = new Date().toLocaleDateString("id-ID");
        localStorage.setItem(`h3_notified_${todayStr}`, "true");
        setIsVisible(false);
    };

    if (!isVisible || upcomingEvents.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="bg-primary p-4 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-2">
                        <Bell size={20} className="animate-bounce" />
                        <h3 className="font-bold">Pengingat Kegiatan</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
                    <p className="text-sm text-muted-foreground mb-2">
                        Ada {upcomingEvents.length} kegiatan yang akan segera dilaksanakan:
                    </p>

                    {upcomingEvents.map(event => {
                        const eventDate = new Date(event.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        eventDate.setHours(0, 0, 0, 0);

                        const diffTime = Math.abs(eventDate.getTime() - today.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let dayText = "";
                        if (diffDays === 0) dayText = "Hari ini!";
                        else if (diffDays === 1) dayText = "Besok";
                        else dayText = `H-${diffDays}`;

                        return (
                            <div key={event.id} className="bg-secondary/50 p-3 rounded-xl border border-primary/10">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-bold text-sm text-primary">{event.title}</h4>
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                        {dayText}
                                    </span>
                                </div>
                                <div className="flex items-center text-[11px] text-muted-foreground mt-2 space-x-1">
                                    <CalendarIcon size={12} />
                                    <span>{new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-border bg-gray-50/50">
                    <button
                        onClick={handleClose}
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors"
                    >
                        Tutup & Jangan Tampilkan Lagi Hari Ini
                    </button>
                </div>
            </div>
        </div>
    );
}
