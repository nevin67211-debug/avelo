import type { Metadata } from "next";
import React, { type ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "../lib/ThemeContext";
import { AuthProvider } from "../lib/auth-context";
import { CartProvider } from "../lib/cart-context";

export const metadata: Metadata = {
title: "Avelo",
description: "Build your online store",
};

export default function RootLayout({
children,
}: {
children: ReactNode;
}): ReactNode {
return (
<html lang="en">
<body>
<ThemeProvider>
  <AuthProvider>
    <CartProvider>
      {children}
    </CartProvider>
  </AuthProvider>
</ThemeProvider>
</body>
</html>
);
}