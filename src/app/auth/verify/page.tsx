import type { Metadata } from "next"
import Link from "next/link"
import { VerifyForm } from "@/components/auth/verify-forms"

export const metadata: Metadata = {
  title: "Verify Account",
  description: "Verify your account",
}

export default function VerifyPage() {
  return (
    <div className="container-fluid flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your account</h1>
          <p className="text-sm text-gray-500 mb-2">
            We&apos;ve sent a verification code to your email. Please check your inbox.
          </p>
        </div>
        <VerifyForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Didn't receive a code?{" "}
          <Link href="#" className="hover:text-brand underline underline-offset-4">
            Resend code
          </Link>
        </p>
      </div>
    </div>
  )
}

