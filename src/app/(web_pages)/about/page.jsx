import React from "react";

function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold  mb-6">About Us</h1>
        <p className="text-lg  leading-relaxed">
          At Tradio, we believe every trader deserves the tools to trade
          smarter, not harder.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-12">
        <p className="text-base  leading-relaxed mb-4">
          Trading is more than just numbers on a screen – it's about discipline,
          psychology, and continuous learning. Yet most retail traders struggle
          because they don't have the right insights into their own performance.
        </p>
        <p className="text-base  leading-relaxed">
          That's why we built Tradio.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold  mb-4">Our Mission</h2>
        <p className="text-base  leading-relaxed">
          To empower equity, F&O, and crypto traders with simple yet powerful
          tools that make tracking, analyzing, and improving trades effortless.
        </p>
      </div>

      {/* What We Do */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold  mb-4">What We Do</h2>
        <p className="text-base  leading-relaxed mb-6">
          Tradio is an all-in-one trading journal and analytics platform that
          helps traders:
        </p>

        <div className="space-y-3 ml-4">
          <p className="text-base  leading-relaxed">
            • Upload trades via broker integration or CSV
          </p>
          <p className="text-base  leading-relaxed">
            • Analyze PNL graphs, day-wise results, and key performance metrics
          </p>
          <p className="text-base  leading-relaxed">
            • Journal strategies, mistakes, notes, and even chart screenshots
          </p>
          <p className="text-base  leading-relaxed">
            • Identify patterns with strategy-wise and mistake-wise analytics
          </p>
          <p className="text-base  leading-relaxed">
            • Build consistency and improve decision-making with data-driven
            insights
          </p>
        </div>
      </div>

      {/* Why Tradio */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold  mb-4">Why Tradio?</h2>
        <p className="text-base  leading-relaxed">
          Most brokers only show you the "what" – raw numbers. Tradio goes
          deeper to show you the "why" behind your trades. We give you clarity
          on what's working, what's not, and how you can grow as a trader.
        </p>
      </div>

      {/* Vision */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold  mb-4">Our Vision</h2>
        <p className="text-base  leading-relaxed">
          To become the go-to platform for traders worldwide – starting with
          India – helping every retail trader turn data into an edge.
        </p>
      </div>

      {/* Personal Touch */}
      <div className="mb-12">
        <p className="text-base  leading-relaxed mb-4">
          At Tradio, we're traders ourselves. We know the pain of repeating
          mistakes, missing insights, and not having the right tools to measure
          progress.
        </p>
        <p className="text-base  leading-relaxed">
          That's why we're building a platform that we wish we had when we
          started our trading journey.
        </p>
      </div>

      {/* Closing */}
      <div className="text-center">
        <p className="text-lg font-medium ">
          📈 With Tradio, you don't just track your trades – you Trade Better
          Every Day.
        </p>
      </div>
    </div>
  );
}

export default About;
