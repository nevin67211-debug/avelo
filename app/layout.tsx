import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./lib/ThemeContext";

export const metadata: Metadata = {
title: "Avelo",
description: "Build your online store",
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html lang="en">
<body>
<ThemeProvider>
{children}
</ThemeProvider>
</body>
</html>
);
}