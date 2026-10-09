import { redirect } from "next/navigation";

export default function RecoverPage() {
  redirect("/sign-up?mode=forgot_password");
}
