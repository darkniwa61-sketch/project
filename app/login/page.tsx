import { cookies } from "next/headers"
import LoginForm from "./LoginForm"

export default async function LoginPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const errorMsg = typeof searchParams?.error === 'string' ? searchParams.error : null
  const successMsg = typeof searchParams?.success === 'string' ? searchParams.success : null

  return <LoginForm errorMsg={errorMsg} successMsg={successMsg} />
}
