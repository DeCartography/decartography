"use server";

import { cookies } from "next/headers";
import { convertDictionaryToArray } from "./helpers";

export async function createCookie(options: AuthCookie) {
  "use server";
  cookies().set(options.name, options.value, {
    // httpOnly: options.httpOnly,
    httpOnly: false,
    expires: options.expires,
  });
}

export async function deleteCookie(name: string) {
  "use server";
  cookies().delete(name);
}

interface GetNFTsResponse {
  addresses: { address: string;
               links: string[];
               unselected_addresses: number // added
              }[];
  isInitialTask: number | null;
}


// export async function getNFTs(amount: number = 6) {
//   "use server";
//   const _auth = await (await cookies().get("_auth"))?.value;
//   const wallet = await (await cookies().get("address"))?.value;

//   // if (!wallet) return [];
//   if (!wallet) return { addresses: [], isInitialTask: null };


//   try {
//     const res = await fetch(
//       // `${process.env.BACKEND_URL}/api/get-addresses?amount=${amount}`,
//       `https://localhost:1337/api/get-addresses?amount=${amount}`,
//       // `https://localhost:1337/api/get-old-addresses?amount=${amount}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${_auth}`,
//         },
//       },
//     );

//     // const addresses = await convertDictionaryToArray(await res.json());
//     //   // res.jsonの中身は以下のようなものになる
//     //   // {
//     //   //   "0xAddress1": ["NFT_Image_URL_1", "NFT_Image_URL_2", ...],
//     //   //   "0xAddress2": ["NFT_Image_URL_1", "NFT_Image_URL_2", ...],
//     //   //   ...
//     //   // }
//     // const isInitialTask = jsonResponse.is_initial_task

//     const jsonResponse = await res.json();
//     console.log(jsonResponse)

//     const addresses = await convertDictionaryToArray(jsonResponse);
//     const isInitialTask = jsonResponse.is_initial_task;  // 追加

//     return { addresses, isInitialTask };  // 追加


//     // return addresses;
//   } catch (error) {
//     console.error(error);
//     return { addresses: [], isInitialTask: null };
//   }
// }


export async function getNFTs(amount: number = 6): Promise<GetNFTsResponse> {
  "use server";
  const _auth = await (await cookies().get("_auth"))?.value;
  const wallet = await (await cookies().get("address"))?.value;

  if (!wallet) return { addresses: [], isInitialTask: null };

  try {
    const res = await   fetch(
      `https://localhost:1337/api/get-addresses?amount=${amount}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_auth}`,
        },
      },
    );

    const jsonResponse = await res.json();
    console.log(jsonResponse)

    const addresses = await convertDictionaryToArray(jsonResponse);
    const isInitialTask = jsonResponse.is_initial_task;


    return { addresses, isInitialTask };
  } catch (error) {
    console.error(error);
    return { addresses: [], isInitialTask: null };
  }
}
