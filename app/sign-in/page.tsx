import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  urlParams.set("mode", "login");

  if (params?.redirect && typeof params.redirect === "string") {
    urlParams.set("redirect", params.redirect);
  }
  if (params?.role && typeof params.role === "string") {
    urlParams.set("role", params.role);
  }
  if (params?.reason && typeof params.reason === "string") {
    urlParams.set("reason", params.reason);
  }

  redirect(`/sign-up?${urlParams.toString()}`);
}
