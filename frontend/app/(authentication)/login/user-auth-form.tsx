"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { handleLogin } from "@/lib/auth";
import { createCookie } from "@/lib/actions";
import { ToastAction } from "@/components/ui/toast";

import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

import jwtDecode from "jwt-decode";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type IconProps = React.HTMLAttributes<SVGElement>;

const Icons = {
  gitHub: (props: IconProps) => (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      ></path>
    </svg>
  ),
  PassportLogo: (props: IconProps) => (
    // <svg width="128" height="146" viewBox="0 0 128 146" fill="none" xmlns="http://www.w3.org/2000/svg">
    <svg width="35" height="20" viewBox="0 0 128 146" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* // <svg viewBox="0 0 438.549 438.549" {...props}> */}
      <path d="M61.6349 145.42L2.16453 111.085C0.825226 110.311 0 108.882 0 107.335V38.6652C0 37.1176 0.825226 35.689 2.16453 34.9152L61.6349 0.580364C62.9742 -0.193454 64.6246 -0.193454 65.9639 0.580364L125.434 34.9152C126.774 35.689 127.599 37.1176 127.599 38.6652V107.335C127.599 108.882 126.774 110.311 125.434 111.085L65.9639 145.42C64.6246 146.193 62.9742 146.193 61.6349 145.42ZM12.9872 104.837L61.6349 132.925C62.9742 133.699 64.6246 133.699 65.9639 132.925L114.612 104.837C115.951 104.064 116.776 102.635 116.776 101.087V44.9153C116.776 43.3676 115.951 41.939 114.612 41.1652L65.9639 13.0778C64.6246 12.304 62.9742 12.304 61.6349 13.0778L12.9872 41.1652C11.6479 41.939 10.8226 43.3676 10.8226 44.9153V101.087C10.8226 102.635 11.6479 104.064 12.9872 104.837Z" fill="white" />
      <path d="M61.6345 23.0133L21.5908 46.1331C20.2515 46.9069 19.4263 48.3355 19.4263 49.8832V93.6228C19.4263 96.7154 21.0767 99.5753 23.7553 101.12L28.6255 103.931C29.3479 104.348 30.2489 103.829 30.2489 102.995V56.1333C30.2489 54.5856 31.0741 53.157 32.4134 52.3832L61.6345 35.5134C62.9738 34.7396 64.6243 34.7396 65.9636 35.5134L95.1847 52.3832C96.524 53.157 97.3492 54.5856 97.3492 56.1333V89.8755C97.3492 91.4231 96.524 92.8517 95.1847 93.6255L65.9636 110.495C64.6243 111.269 62.9738 111.269 61.6345 110.495L51.8942 104.873C50.5549 104.099 49.7296 102.671 49.7296 101.123V67.3807C49.7296 65.833 50.5549 64.4044 51.8942 63.6306L61.6345 58.0083C62.9738 57.2344 64.6243 57.2344 65.9636 58.0083L75.704 63.6306C77.0433 64.4044 77.8685 65.833 77.8685 67.3807V78.6281C77.8685 80.1757 77.0433 81.6043 75.704 82.3781L70.8338 85.1893C70.1114 85.606 69.2104 85.0865 69.2104 84.2531V77.3348V72.4565C69.2104 70.9088 68.3852 69.4803 67.0459 68.7064L64.8813 67.4564C64.2103 67.0695 63.3878 67.0695 62.7168 67.4564L60.0111 69.0176C59.0073 69.5966 58.3878 70.6707 58.3878 71.8288V73.0003V96.1689C58.3878 97.7219 59.2211 99.1559 60.5685 99.927L61.6129 100.522C62.9495 101.285 64.5918 101.283 65.9257 100.511L86.5266 88.6174C87.8659 87.8436 88.6911 86.415 88.6911 84.8673V61.1225C88.6911 59.5748 87.8659 58.1463 86.5266 57.3724L65.9636 45.5C64.6243 44.7262 62.9738 44.7262 61.6345 45.5L41.0715 57.3724C39.7322 58.1463 38.907 59.5748 38.907 61.1225V107.359C38.907 108.907 39.7322 110.336 41.0715 111.11L61.6345 122.982C62.9738 123.756 64.6243 123.756 65.9636 122.982L106.007 99.8621C107.347 99.0883 108.172 97.6597 108.172 96.112V49.8751C108.172 48.3274 107.347 46.8988 106.007 46.125L65.9636 23.0052C64.6243 22.2314 62.9738 22.2314 61.6345 23.0052V23.0133Z" fill="white" />
    </svg>
  ),
  spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};




// export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
//   const [isLoading, setIsLoading] = React.useState<boolean>(false);
//   const { toast } = useToast();
//   const router = useRouter();

//   async function onSubmit(event: React.SyntheticEvent) {
//     event.preventDefault();
//     console.log("onSubmit function is triggered");  // ここに追加

//     setIsLoading(true);

//     try {
//       const token = await handleLogin();
//       if (token instanceof Error) {
//         // Handle the error case
//         console.log(token);
//         toast({
//           variant: "destructive",
//           title: "Uh oh! Something went wrong.",
//           description:
//             "Please ensure you have a score above 15 on Gitcoin Passport.",
//           action: <ToastAction altText="Try again">Try again</ToastAction>,
//         });
//       } else {
//         // Handle the success case with the token
//         console.log("Successfully logged in with token:", token);
//         const decoded: JWTContent = jwtDecode(token);

//         // await createCookie({
//         //   name: "_auth",
//         //   value: token,
//         //   httpOnly: true,
//         //   expires: (decoded?.exp || 0) * 1000,
//         // });

//         // サーバーにトークンを送信して_auth Cookieを設定
//         const response = await fetch("https://localhost:1337/api/set-auth-cookie", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: 'include',  // Include credentials such as cookies, authorization headers or TLS client certificates.
//           body: JSON.stringify({ token }),
//         });

//         await createCookie({
//           name: "address",
//           value: decoded?.address,
//           httpOnly: true,
//           expires: (decoded?.exp || 0) * 1000,
//         });

//         console.log("Current cookies:", document.cookie); // cookieの確認

//         toast({
//           title: "Yay! You're logged in.",
//           description: "Redirecting...",
//         });
//         return router.push("/");
//       }
//     } catch (err) {
//       console.error("An error occurred during login:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className={cn("grid gap-4", className)} {...props}>
//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <span className="w-full border-t" />
//         </div>
//         {/* <div className="relative flex justify-center text-xs uppercase">
//           <span className="bg-background px-2 text-muted-foreground">
//             Or continue with
//           </span>
//         </div> */}
//       </div>
//       <Button
//         variant="default"
//         type="button"
//         disabled={isLoading}
//         onClick={onSubmit}
//       >
//         {isLoading ? (
//           <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
//         ) : (
//           <Icons.gitHub className="mr-2 h-4 w-4" />
//         )}{" "}
//         Login with Gitcoin Passport
//       </Button>
//     </div>
//   );
// }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    // console.log("onSubmit function is triggered"); // リダイレクト前に発火している

    setIsLoading(true);

    try {
      const token = await handleLogin();
      if (token instanceof Error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: (
            <span>
              Please ensure you have a score above 15 on Gitcoin Passport. Initialize or Update your score on{" "}
              <a href="https://passport.gitcoin.co" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                passport.gitcoin.co
              </a>
            </span>
          ),
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        console.log("Successfully logged in with token:", token); //これは発火してるっぽい

        // 追加
        const decoded: JWTContent = jwtDecode(token); // トークンのデコード

        // console.log("createCookie"); // debug
        // await createCookie({
        //   name: "_auth",
        //   value: token,
        //   httpOnly: true,
        //   expires: (decoded?.exp || 0) * 1000,
        // });
        await createCookie({
          name: "address",
          value: decoded?.address,
          httpOnly: true,
          expires: (decoded?.exp || 0) * 1000,
        });


        // // サーバーにトークンを送信して_auth Cookieを設定
        // const response = await fetch("https://localhost:1337/api/set-auth-cookie", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   credentials: 'include',  // Include credentials such as cookies, authorization headers or TLS client certificates.
        //   body: JSON.stringify({ token }),
        // });

        const response = await fetch("https://localhost:1337/api/set-auth-cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ token, address: decoded?.address }), // addressも送信
        });


        if (response.ok) {
          // const decoded: JWTContent = jwtDecode(token);

          // // addressもCookieに保存
          // await createCookie({
          //   name: "address",
          //   value: decoded?.address,
          //   httpOnly: false, // もしくは true、必要に応じて
          //   expires: (decoded?.exp || 0) * 1000,
          // });
          // console.log("createCookie triggered") //これがそもそも動いてないっぽい



          // ローカルでcookieを設定（この部分はオプション）
          // console.log("Current cookies:", document.cookie);

          toast({
            title: "Yay! You're logged in.",
            description: "Redirecting...",
          });

          return router.push("/");
        }
      }
    } catch (err) {
      console.error("An error occurred during login:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
      <Button
        variant="default"
        type="button"
        disabled={isLoading}
        onClick={onSubmit}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          // <Icons.gitHub className="mr-2 h-4 w-4" />
          <Icons.PassportLogo className="mr-2 h-4 w-4" />
        )}
        Login with Gitcoin Passport
      </Button>
    </div>
  );
}
