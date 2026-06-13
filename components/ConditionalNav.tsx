"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";

export default function ConditionalNav() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return <Nav />;
}