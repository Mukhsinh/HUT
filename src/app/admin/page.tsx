"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Check, X, Clock, Loader2, MessageCircle } from "lucide-react";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useRouter } from "next/navigation";

interface PendingUser {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

export default function AdminPage() {
    const { role, isLoading: permissionsLoading } = useUserPermissions();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    useEffect(() => {
        if (!permissionsLoading && role !== "super_admin") {
            router.push("/");
        }
    }, [permissionsLoading, role, router]);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = () => {
        try {
            const users = JSON.parse(localStorage.getItem("pending_users") || "[]");
            setPendingUsers(users);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const approveUser = (userId: string, phone: string, fullName: string) => {
        setApproving(userId);
        setTimeout(() => {
            const users = pendingUsers.map(u =>
                u.id === userId ? { ...u, status: "approved" as const } : u
            );
            setPendingUsers(users);
            localStorage.setItem("pending_users", JSON.stringify(users));
            setApproving(null);
            
            // Simulate sending WhatsApp notification
            alert(`✓ Pengguna ${fullName} telah disetujui!\n\nNotifikasi WhatsApp akan dikirim ke: ${phone}`);
        }, 1000);
    };

    const rejectUser = (userId: string) => {
        const users = pendingUsers.filter(u => u.id !== userId);
        setPendingUsers(users);
        localStorage.setItem("pending_users", JSON.stringify(users));
    };

    const pendingCount = pendingUsers.filter(u => u.status === "pending").length;
    const approvedCount = pendingUsers.filter(u => u.status === "approved").length;

    if (permissionsLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin mr-2" size={24} />
                <span>Memuat...</span>
            </div>
        );
    }

    if (role !== "super_admin") {
        return (
            <div className="space-y-6 pb-20">
                <section>
                    <h1 className="text-2xl font-bold">Akses Ditolak</h1>
                    <p className="text-muted-foreground text-sm">Anda tidak memiliki izin untuk mengakses halaman ini</p>
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <section>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground text-sm">Kelola Verifikasi Pengguna Baru</p>
            </section>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Menunggu</p>
                                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                            </div>
                            <Clock className="text-amber-500 opacity-30" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Disetujui</p>
                                <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                            </div>
                            <Check className="text-emerald-500 opacity-30" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-primary">{pendingUsers.length}</p>
                            </div>
                            <Clock className="text-primary opacity-30" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Users */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold">Pengguna Baru Menunggu Verifikasi</h2>
                
                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 flex items-center justify-center">
                            <Loader2 className="animate-spin mr-2" size={20} />
                            <span>Memuat data...</span>
                        </CardContent>
                    </Card>
                ) : pendingCount === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p>Tidak ada pengguna menunggu verifikasi</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {pendingUsers
                            .filter(u => u.status === "pending")
                            .map(user => (
                                <Card key={user.id} className="border-amber-200 bg-amber-50/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <p className="font-bold text-base">{user.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                                <div className="flex items-center text-xs text-muted-foreground space-x-3">
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle size={14} />
                                                        {user.phone}
                                                    </span>
                                                    <span>
                                                        Daftar: {new Date(user.createdAt).toLocaleDateString("id-ID")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => approveUser(user.id, user.phone, user.fullName)}
                                                    disabled={approving === user.id}
                                                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                >
                                                    {approving === user.id ? (
                                                        <Loader2 className="animate-spin" size={18} />
                                                    ) : (
                                                        <Check size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => rejectUser(user.id)}
                                                    className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>

            {/* Approved Users */}
            {approvedCount > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">Pengguna Terverifikasi</h2>
                    <div className="space-y-2">
                        {pendingUsers
                            .filter(u => u.status === "approved")
                            .map(user => (
                                <Card key={user.id} className="border-emerald-200 bg-emerald-50/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-sm">{user.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Check className="text-emerald-600" size={20} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
