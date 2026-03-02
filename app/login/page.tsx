import { cookies } from "next/headers"
import LoginForm from "./LoginForm"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const errorMsg = cookieStore.get('flash_error')?.value ?? null
  return <LoginForm errorMsg={errorMsg} />
}
