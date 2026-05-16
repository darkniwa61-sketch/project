"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { resetPasswordForEmail } from "./actions"

import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button 
            type="submit" 
            className="w-full bg-[#2a2421] text-white hover:bg-[#2a2421]/90 h-11 text-base"
            disabled={pending}
        >
            {pending ? "Sending..." : "Send reset link \u2192"}
        </Button>
    )
}

export default function ForgotPasswordForm({ errorMsg }: { errorMsg: string | null }) {
    return (
        <AuthLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Reset your password
                    </h1>
                    <p className="text-sm text-slate-400">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 border border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={resetPasswordForEmail}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@rj-management.com" required maxLength={100} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-[#06b6d4] text-[#0a0b12] hover:bg-[#0891b2] h-12 text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all"
                    >
                        Send reset link &rarr;
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-400">
                    Remember your password?{" "}
                    <Link href="/login" className="font-bold text-[#06b6d4] hover:text-white transition-colors underline underline-offset-4 decoration-[#06b6d4]/30">
                        Back to login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
