import ForgotPasswordForm from "./ForgotPasswordForm"
import { cookies } from "next/headers"

export default async function ForgotPasswordPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams
    const errorMsg = typeof searchParams?.error === 'string' ? searchParams.error : null

    return <ForgotPasswordForm errorMsg={errorMsg} />
}
