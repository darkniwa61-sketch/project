"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, Building2, KeyRound } from "lucide-react"
import { signup } from "./actions"

import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterForm({ errorMsg }: { errorMsg: string | null }) {
    const [showPassword, setShowPassword] = useState(false)
    const [mode, setMode] = useState<"create" | "join">("create")

    return (
        <AuthLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Join R&J
                    </h1>
                    <p className="text-sm text-slate-400">
                        {mode === "create" ? "Register your location to begin professional inventory oversight" : "Enter your invite code to join your team"}
                    </p>
                </div>

                <div className="flex bg-white/5 rounded-xl p-1 mb-2 border border-white/10">
                    <button
                        type="button"
                        onClick={() => setMode("create")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${mode === "create" ? "bg-[#06b6d4] text-[#0a0b12] shadow-md" : "text-slate-400 hover:text-white"}`}
                    >
                        <Building2 className="h-4 w-4" />
                        Create Org
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("join")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${mode === "join" ? "bg-[#06b6d4] text-[#0a0b12] shadow-md" : "text-slate-400 hover:text-white"}`}
                    >
                        <KeyRound className="h-4 w-4" />
                        Join Org
                    </button>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 border border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={signup}>
                    <input type="hidden" name="mode" value={mode} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">First name</Label>
                            <Input id="first-name" name="first-name" placeholder="John" required maxLength={50} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Last name</Label>
                            <Input id="last-name" name="last-name" placeholder="Doe" required maxLength={50} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                        </div>
                    </div>

                    {mode === "create" ? (
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Facility / Office Name</Label>
                            <Input id="location" name="location" placeholder="e.g. Main HQ, Manila Hub" required maxLength={100} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="invite-code" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Invite Code</Label>
                            <Input id="invite-code" name="invite-code" placeholder="e.g. X7K9P2" required maxLength={10} className="bg-white/5 border-white/10 text-white rounded-xl h-11 font-mono uppercase tracking-widest" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@rj-management.com" required maxLength={100} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Access Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                maxLength={100}
                                className="pr-10 bg-white/5 border-white/10 text-white rounded-xl h-11"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#06b6d4] text-[#0a0b12] hover:bg-[#0891b2] h-12 text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all">
                        Create account &rarr;
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-[#06b6d4] hover:text-white transition-colors underline underline-offset-4 decoration-[#06b6d4]/30">
                        Sign in
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}

