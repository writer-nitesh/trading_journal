import { link } from "d3";
import Link from "next/link";

const Pricing = () => {
  const plans = [
    {
      title: "Starter",
      price: "₹499",
      period: "per month",
      features: [
        "Unlimited trades",
        "Advanced analytics (400+ stats)",
        "1 Broker Auto-Sync",
        "Priority support",
        "End to end Journaling",
      ],
      buttonText: "Start 7-Day Trial",
      buttonClass:
        "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white",
      popular: false,
      link: "/signup",
    },
    {
      title: "Professional",
      price: "₹999",
      period: "",
      features: [
        "Everything in Starter",
        "AI Insights",
        "Auto broker sync upto 3 brokers",
        "AI trading assistant",
        "Risk management tools",
        "Custom reports & exports",
      ],
      buttonText: "Start 7-Day Trial",
      buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
      popular: true,
      link: "/signup",
    },
    {
      title: "Enterprise",
      price: "flexible",
      period: "",
      features: [
        "Everything in Professional",
        "Multi-account analysis",
        "Mentor collaboration",
        "White-label options",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      buttonClass:
        "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white",
      popular: false,
      link: "/signup",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300">
            Start with free-trail and upgrade as you grow. No hidden fees, No
            credit card, cancel anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-neutral-800 border-2 rounded-xl p-8 text-center relative transition-all hover:-translate-y-2 hover:shadow-xl ${
                plan.popular
                  ? "border-emerald-600 transform scale-105 shadow-lg"
                  : "border-neutral-200 dark:border-neutral-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-neutral-900 px-5 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                {plan.title}
              </h3>
              <div className="text-5xl font-extrabold text-emerald-600 mb-2">
                {plan.price}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 mb-8">
                {plan.period}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="text-emerald-500 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.link}
                className={`w-full px-8 py-3 rounded-lg font-semibold transition-all ${plan.buttonClass}`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
