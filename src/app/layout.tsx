import { SessionProvider } from "./components/SessionProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>CuzVault</title>
      </head>
      <body className="bg-gray-100">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
