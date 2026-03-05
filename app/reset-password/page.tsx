import ResetPasswordForm from "./ResetPasswordForm"
import { cookies } from "next/headers"

export default async function ResetPasswordPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams
    const errorMsg = typeof searchParams?.error === 'string' ? searchParams.error : null

    return <ResetPasswordForm errorMsg={errorMsg} />
}
