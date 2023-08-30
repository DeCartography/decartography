"use server";

import { cookies } from "next/headers";

async function create(name: string, value: string, options: any) {
  cookies().set(name, value, options);
  // or
  cookies().set({
    name: "name",
    value: "lee",
    httpOnly: true,
    path: "/",
  });
}
