import { cookies } from "next/headers"
import RegisterForm from "./RegisterForm"

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const errorMsg = cookieStore.get('flash_error')?.value ?? null
  return <RegisterForm errorMsg={errorMsg} />
}
