import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const footerSections = [
    {
      title: "Features",
      links: [
        { name: "Trading Journal", href: "/dashboard" },
        { name: "Trade Analytics", href: "/#features" },
        { name: "Broker Integrations", href: "/#brokers" },
        { name: "AI Insights", href: "/#features" },
      ],
    },
    {
      title: "Brokers Integration",
      links: [
        {
          name: "Zerodha",
          href: "https://youtu.be/fqh3bVfkm5A?si=xPA-_cOInsy6MFZi",
        },
        {
          name: "Angel One",
          href: "https://youtu.be/CAhOFoYXB7U?si=F9s0USRmIBZaXvvK",
        },
        {
          name: "Dhan",
          href: "https://youtu.be/w_8btgrECig?si=L2M-jKAuQYhDvOIu",
        },
        {
          name: "Fyers",
          href: "https://youtu.be/Gi3V3h7ESSE?si=1t4NgMCLMatp08a8",
        },
        {
          name: "Upstox",
          href: "https://youtu.be/bBD2cZsfCEE?si=mrcb_Pbj03NAJHE3",
        },
        { name: "View All Brokers", href: "/integrations" },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          name: "Getting Started Guide",
          href: "https://youtu.be/tUbXOtMAwJM?si=uTroG7GUakLjnD-f",
        },
        {
          name: "Video Tutorials",
          href: "https://www.youtube.com/@Tradio-hub",
        },
        { name: "Help Center", href: "/help" },
        { name: "Community Forum", href: "/community" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        {
          name: "Contact Us",
          href: "https://orufybookings.com/tradio/feedback-session",
        },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Partner Program", href: "/comming-soon" },
        { name: "Affiliate Program", href: "/comming-soon" },
        { name: "Enterprise", href: "/comming-soon" },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-6 gap-8 mb-10">
          <div className="lg:col-span-2">
            <Link href="/dashboard">
              <Image
                src="/logos/tradio_dark_logo.svg"
                alt="Tradio Light Logo"
                width={120}
                height={120}
                className="rounded-full mb-4"
                priority
              />
            </Link>

            <p className="text-neutral-300 mb-5 leading-relaxed">
              Advanced trading journal and analytics platform designed
              specifically for Indian stock market traders. Transform your
              trading with powerful insights.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>📧 Email:</strong> pavan.kona@tradiohub.com
              </p>
              <p>
                <strong>📞 Phone:</strong> +91-8074298469
              </p>
              <p>
                <strong>🕒 Support Hours:</strong> 9 AM - 11 PM (Monday-Sunday)
              </p>
            </div>
          </div>

          {/* Mapped Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-white mb-5">{section.title}</h3>
              <div className="space-y-3">
                {section.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  const linkClasses =
                    "block text-neutral-300 hover:text-emerald-400 transition-colors text-sm";

                  if (isExternal) {
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        className={linkClasses}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={linkClasses}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <p className="text-neutral-400 mb-2 text-sm">
                {" "}
                {/* Made text a bit smaller */}
                &copy; {new Date().getFullYear()} TradioHub. All rights
                reserved. | Designed for Indian Stock Market Traders
              </p>
              <p className="text-xs text-neutral-500">
                {" "}
                {/* Made text a bit smaller */}
                <strong>Disclaimer:</strong> Tradio is a journaling and
                technology platform only and does not provide investment advice,
                recommendations, or brokerage services. Any trades, strategies,
                or decisions recorded on the platform are solely your own
                responsibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
