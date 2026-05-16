"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { signup } from "./actions"

import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterForm({ errorMsg }: { errorMsg: string | null }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <AuthLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Create Account
                    </h1>
                    <p className="text-sm text-slate-400">
                        Enter your details to get started. You'll set up your workspace next.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 border border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={signup}>
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

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@rj-management.com" required maxLength={100} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Password</Label>
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
