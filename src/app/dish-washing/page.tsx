import type { Metadata } from "next";
import { DishWashingView } from "@/components/dish-washing/DishWashingView/DishWashingView";

export const metadata: Metadata = {
  title: "Dish Washing Service | Help Now by CityCalls",
  description: "Book a verified dish washing help at home in Ghaziabad with Help Now by CityCalls.",
};

export default function DishWashingPage() {
  return <DishWashingView />;
}
