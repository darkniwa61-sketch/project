"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { login } from "./actions"

import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm({ errorMsg, successMsg }: { errorMsg: string | null, successMsg?: string | null }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <AuthLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Welcome back
                    </h1>
                    <p className="text-sm text-slate-400">
                        Authenticate to access your ST. Joseph Amity Prime Development Corp. dashboard
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 border border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}
                
                {successMsg && (
                    <div className="bg-emerald-500/10 text-emerald-400 text-sm p-3 rounded-xl flex items-center gap-2 border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                        <p>{successMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={login}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@rj-management.com" required maxLength={100} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-slate-300 uppercase text-[10px] font-bold tracking-widest">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-[10px] uppercase font-bold tracking-widest text-[#06b6d4] hover:text-white transition-colors"
                            >
                                Forgot?
                            </Link>
                        </div>
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
                        Sign in &rarr;
                    </Button>

                </form>

                <div className="text-center text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-[#06b6d4] hover:text-white transition-colors underline underline-offset-4 decoration-[#06b6d4]/30">
                        Create account
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
