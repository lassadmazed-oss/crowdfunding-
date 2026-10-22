import { notFound } from "next/navigation";

// Unknown paths under a language render that language's not-found page inside the site layout.
export default function CatchAllPage() {
  notFound();
}
