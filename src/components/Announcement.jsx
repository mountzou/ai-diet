import Link from "next/link";

export default function Announcement() {
  return (
    <div className="bg-muted">
      <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
        <div className="flex items-center justify-between gap-x-6 p-4">
          <div className="flex w-full items-center gap-x-4 text-sm">
            <p className="flex-1 text-center">
              <Link
                href="#"
                className="font-semibold underline-offset-4 hover:underline"
              >
                Introducing our new UI blocks
              </Link>
              <span className="hidden sm:inline">
                {" "}
                — Get started with 50+ new components.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
