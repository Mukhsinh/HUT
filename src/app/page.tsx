"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [finance, setFinance] = useState({ balance: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: events, error: eError } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })
        .limit(3);

      if (eError) throw eError;

      const { data: transactions, error: tError } = await supabase
        .from("transactions")
        .select("amount, type");

      if (tError) throw tError;

      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const expense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const balance = income - expense;

      const maxBudget = 50000000;
      const percentage = Math.min(100, Math.round((expense / maxBudget) * 100));

      setUpcomingEvents(events || []);
      setFinance({ balance, percentage });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Sapaan */}
      <section>
        <h1 className="text-xl font-bold text-foreground">Selamat Siang, Ibu Bidan! 👋</h1>
        <p className="text-muted-foreground text-sm">Mari sukseskan HUT IBI Ke-75 Kota Pekalongan.</p>
      </section>

      {/* Finance Quick Widget */}
      <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-secondary/80 text-xs font-medium uppercase tracking-wider">Sisa Anggaran Terkini</p>
              <h2 className="text-2xl font-bold mt-1">Rp {finance.balance.toLocaleString("id-ID")}</h2>
            </div>
            <Link href="/keuangan" className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors">
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${finance.percentage}%` }} />
          </div>
          <p className="text-[10px] mt-2 text-secondary/90">{finance.percentage}% dari total pagu telah direalisasikan</p>
        </CardContent>
      </Card>

      {/* Event Timeline Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Agenda Terdekat</h3>
          <Link href="/kegiatan" className="text-primary text-xs font-semibold">Lihat Semua</Link>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:border-primary/30 transition-colors border-border/40">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${event.status === 'On Progress' ? "bg-blue-100 text-blue-600" :
                      event.status === 'Completed' ? "bg-primary/10 text-primary" :
                        "bg-amber-100 text-amber-600"
                      }`}>
                      {event.status}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(event.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-base leading-tight mb-3">{event.title}</h4>

                  <div className="flex items-center text-muted-foreground text-xs space-x-4">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 text-primary/70" />
                      {event.location}
                    </div>
                    {event.pic_name && (
                      <div className="flex items-center">
                        <Circle size={8} className="mr-1 fill-muted-foreground/30 border-none" />
                        PIC: {event.pic_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8">Belum ada agenda agenda terdekat.</p>
          )}
        </div>
      </section>

      {/* Floating Action Button (Quick Actions) */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end space-y-4">
        <Link
          href="/keuangan"
          className="bg-white text-primary p-3 rounded-xl shadow-lg border border-primary/20 flex items-center space-x-2 animate-in slide-in-from-right-10 duration-300"
        >
          <span className="text-xs font-bold whitespace-nowrap">Catat Keuangan</span>
          <Plus size={20} />
        </Link>
        <Link
          href="/kegiatan"
          className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-transform flex items-center space-x-2"
        >
          <span className="text-sm font-bold">Tambah Kagiatan</span>
          <Plus size={24} />
        </Link>
      </div>
    </div>
  );
}
