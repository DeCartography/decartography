"use server";

import { cookies } from "next/headers";

export async function createCookie(options: AuthCookie) {
  "use server";
  cookies().set(options.name, options.value, {
    httpOnly: options.httpOnly,
    expires: options.expires,
  });
}

export async function deleteCookie(name: string) {
  "use server";
  cookies().delete(name);
}
