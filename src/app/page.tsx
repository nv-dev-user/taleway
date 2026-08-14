import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/editor" className="mr-12">Edit</Link>
      <Link href="/read/11">Read</Link>
    </div>
  );
}
