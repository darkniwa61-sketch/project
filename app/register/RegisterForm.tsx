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
                    <h1 className="text-2xl font-semibold tracking-tight text-[#2d2621]">
                        Create your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Get started and take control of your inventory
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form className="space-y-4" action={signup}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" name="first-name" placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" name="last-name" placeholder="Doe" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location name</Label>
                        <Input id="location" name="location" placeholder="e.g. Warehouse A, Manila Branch" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
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

                    <Button type="submit" className="w-full bg-[#2a2421] text-white hover:bg-[#2a2421]/90 h-11 text-base">
                        Create account &rarr;
                    </Button>
                </form>
            </div>
        </AuthLayout>
    )
}
