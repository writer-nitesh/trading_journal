import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "../theme/theme-mode";
const Header = () => {
  return (
    <header className="bg-white dark:bg-neutral-900 shadow-lg sticky w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center py-4">
          <Link
            href="/"
            className="flex-shrink-0"
            aria-label="Go to Tradio homepage"
          >
            <Image
              src="/logos/tradio_dark_logo.svg"
              alt="Tradio Dark Logo"
              width={120}
              height={120}
              className="rounded-full hidden dark:block"
              priority
            />
            <Image
              src="/logos/tradio_light_logo.svg"
              alt="Tradio Light Logo"
              width={120}
              height={120}
              className="rounded-full  dark:hidden"
              priority
            />
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            <a
              href="/#brokers"
              className="text-neutral-500 dark:text-neutral-300 font-medium hover:text-emerald-600 transition-colors"
            >
              Brokers
            </a>
            <a
              href="/#ai-review"
              className="text-neutral-500 dark:text-neutral-300 font-medium hover:text-emerald-600 transition-colors"
            >
              AI Review
            </a>
            <a
              href="/#features"
              className="text-neutral-500 dark:text-neutral-300 font-medium hover:text-emerald-600 transition-colors"
            >
              Features
            </a>
            <a
              href="/#testimonials"
              className="text-neutral-500 dark:text-neutral-300 font-medium hover:text-emerald-600 transition-colors"
            >
              Reviews
            </a>
            <a
              href="/#pricing"
              className="text-neutral-500 dark:text-neutral-300 font-medium hover:text-emerald-600 transition-colors"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link
              href="/signup"
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
