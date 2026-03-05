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
                    <h1 className="text-2xl font-semibold tracking-tight text-[#2d2621]">
                        Reset your password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={resetPasswordForEmail}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                    </div>

                    <SubmitButton />

                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/login" className="font-semibold text-[#2d2621] hover:underline">
                        Back to login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
