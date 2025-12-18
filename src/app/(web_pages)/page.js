'use client';
import Brokers from "@/components/landing/broker";
import Features from "@/components/landing/features";
import FinalCTA from "@/components/landing/finalCTA";
import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";
import TradeReview from "@/components/landing/tradeReview";

const Homepage = () => {
  return (
      <main>
        <Hero />
        <Brokers />
        <TradeReview />
        <Features />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
  );
};

export default Homepage;