"use client"

import { useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { resetPassword } from "./actions"

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
            {pending ? "Updating..." : "Update password \u2192"}
        </Button>
    )
}

export default function ResetPasswordForm({ errorMsg }: { errorMsg: string | null }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <AuthLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Update your password
                    </h1>
                    <p className="text-sm text-slate-400">
                        Enter your new password below.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 border border-destructive/20">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={resetPassword}>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300 ml-1 uppercase text-[10px] font-bold tracking-widest">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                required
                                minLength={6}
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
                                <span className="sr-only">Toggle password visibility</span>
                            </button>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-[#06b6d4] text-[#0a0b12] hover:bg-[#0891b2] h-12 text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all"
                    >
                        Update password &rarr;
                    </Button>
                </form>
            </div>
        </AuthLayout>
    )
}
