import NotFoundClient from "@/components/NotFoundClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Page Not Found",
  description: "You've wandered off the grid. Let's get you back.",
  robots: "noindex, nofollow",
};

export default function NotFound() {
  return <NotFoundClient />;
}
