import { redirect } from "next/navigation";

// Any unknown URL goes back to the Help Now home page (same as the old site).
export default function CatchAllPage() {
  redirect("/");
}
