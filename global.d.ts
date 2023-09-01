interface Window {
  ethereum: any;
}

interface JWTContent {
  address: string;
  exp: number;
}

interface AuthCookie {
  name: string;
  value: string;
  expires: number;
  httpOnly: boolean;
}
