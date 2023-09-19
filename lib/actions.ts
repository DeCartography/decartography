"use server";

import { cookies } from "next/headers";
import { convertDictionaryToArray } from "./helpers";

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

export async function getNFTs(amount: number = 6) {
  "use server";
  const _auth = await (await cookies().get("_auth"))?.value;
  const wallet = await (await cookies().get("address"))?.value;

  if (!wallet) return [];

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/get-addresses?amount=${amount}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_auth}`,
        },
      },
    );

    const addresses = await convertDictionaryToArray(await res.json());
    return addresses;
  } catch (error) {
    console.error(error);
  }
}
