'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Rocket, Crown, Diamond, Shield, Zap, Users, Headphones, Globe, Star, Award } from 'lucide-react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import useGlobalState from '@/hooks/globalState';
import { createOrder, verifyPayment } from '@/lib/razorpay/index';
import { toast } from "sonner";
import { addUserData } from '@/lib/firebase/database/userData';
import { addPaymentsData } from '@/lib/firebase/database/payments';


const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Handle responsive behavior with JavaScript
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 499,
      annualPrice: 333,
      description: 'Perfect for beginner trader',
      icon: Rocket,
      color: 'blue',
    },
    {
      id: 'pro',
      name: 'Professional',
      monthlyPrice: 999,
      annualPrice: 599,
      description: 'Ideal for professional trader',
      icon: Crown,
      popular: true,
      color: 'purple',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 19999,
      annualPrice: 12500,
      description: 'For brokers and institutes',
      icon: Diamond,
      color: 'emerald',
    }
  ];

  const features = [
    {
      name: 'Data Import – CSV',
      icon: Zap,
      values: { starter: true, pro: true, enterprise: true }
    },
    {
      name: 'Broker Auto-Sync',
      icon: Users,
      values: { starter: '1 broker', pro: 'upto 3 brokers', enterprise: 'Unlimited brokers' }
    },
    {
      name: 'Sync Frequency',
      icon: Shield,
      values: { starter: 'Manual', pro: 'Auto (hourly)', enterprise: 'Auto (near real-time)' }
    },
    {
      name: 'Segments Supported (Equity / F&O / Crypto)',
      icon: Star,
      values: { starter: 'all', pro: 'all', enterprise: 'all' }
    },
    {
      name: 'Priority Support',
      icon: Headphones,
      values: { starter: true, pro: true, enterprise: true }
    },
    {
      name: 'AI Insights & Recommendations',
      icon: Globe,
      values: { starter: '5 reports per month', pro: 'Unlimited', enterprise: 'Custom rules & playbooks' }
    },
    {
      name: 'Email Reports',
      icon: Award,
      values: { starter: false, pro: 'Weekly + Monthly deep dive', enterprise: 'Custom cadence + SLA' }
    },
    {
      name: 'End to end journaling',
      icon: Award,
      values: { starter: true, pro: true, enterprise: true }
    },
    {
      name: 'White-label Options',
      icon: Diamond,
      values: { starter: false, pro: false, enterprise: true }
    }
  ];

  const renderFeatureValue = (value) => {
    if (value === true) {
      return <Check style={{ width: '20px', height: '20px', color: isDarkMode ? '#10b981' : '#009966', margin: '0 auto' }} />;
    } else if (value === false) {
      return <X style={{ width: '20px', height: '20px', color: isDarkMode ? '#6b7280' : '#9ca3af', margin: '0 auto' }} />;
    } else {
      return <span style={{ fontWeight: '500', color: isDarkMode ? '#d1d5db' : '#374151', fontSize: isMobile ? '12px' : '14px' }}>{value}</span>;
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundImage: isDarkMode
      ? 'linear-gradient(135deg, #111827 0%, #000000 50%, #111827 100%)'
      : 'none',
    backgroundColor: isDarkMode ? 'transparent' : '#f8fdf9',
    color: isDarkMode ? '#ffffff' : '#111827',
    transition: 'all 0.5s ease',
    position: 'relative'
  };

  const backgroundElementsStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: isMobile ? '24px 16px' : '40px 24px'
  };

  const titleStyle = {
    fontSize: isMobile ? '28px' : '48px',
    fontWeight: 'bold',
    marginBottom: '16px',
    backgroundImage: isDarkMode
      ? 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)'
      : 'linear-gradient(90deg, #009966, #00b377)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    backgroundColor: 'transparent'
  };

  const subtitleStyle = {
    fontSize: isMobile ? '16px' : '20px',
    maxWidth: '512px',
    margin: '0 auto',
    color: isDarkMode ? '#d1d5db' : '#6b7280'
  };

  const billingToggleStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '9999px',
    background: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
    border: isDarkMode ? 'none' : '1px solid #e5e7eb',
    backdropFilter: 'blur(12px)'
  };

  const switchStyle = {
    position: 'relative',
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    background: isAnnual ? '#009966' : (isDarkMode ? '#6b7280' : '#d1d5db'),
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const switchHandleStyle = {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ffffff',
    top: '2px',
    left: isAnnual ? '26px' : '2px',
    transition: 'all 0.3s ease'
  };

  const tableStyle = {
    maxWidth: '1152px',
    margin: '0 auto 64px auto',
    padding: isMobile ? '0 16px' : '0 24px'
  };

  const tableContainerStyle = {
    borderRadius: isMobile ? '16px' : '24px',
    overflow: 'hidden',
    background: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : '#ffffff',
    border: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '2px solid #a1d0c1ff',
    backdropFilter: 'blur(12px)',
    boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr',
    gap: '0'
  };

  const cellStyle = {
    padding: isMobile ? '12px 16px' : '24px',
    textAlign: 'center'
  };

  const headerCellStyle = {
    ...cellStyle,
    background: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
    fontWeight: '600'
  };

  const popularCellStyle = {
    ...cellStyle,
    background: isDarkMode ? 'rgba(88, 28, 135, 0.3)' : 'rgba(0, 153, 102, 0.05)'
  };

  const iconContainerStyle = {
    width: isMobile ? '40px' : '48px',
    height: isMobile ? '40px' : '48px',
    margin: '0 auto 12px auto',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDarkMode
      ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
      : 'linear-gradient(135deg, #009966, #00b377)'
  };

  const buttonStyle = {
    width: '100%',
    padding: isMobile ? '10px 12px' : '12px 16px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: isMobile ? '12px' : '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: isDarkMode
      ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
      : 'linear-gradient(135deg, #009966, #00b377)',
    color: '#ffffff'
  };

  const trustIndicatorStyle = {
    textAlign: 'center',
    marginBottom: '64px',
    padding: isMobile ? '0 16px' : '0'
  };

  const trustContainerStyle = {
    display: isMobile ? 'grid' : 'inline-flex',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'none',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '16px' : '32px',
    padding: isMobile ? '20px 16px' : '24px 32px',
    borderRadius: '16px',
    background: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : '#ffffff',
    border: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '2px solid #a1d0c1ff',
    backdropFilter: 'blur(12px)',
    boxShadow: isDarkMode ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.05)'
  };

  const trustItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: isMobile ? '14px' : '16px'
  };

  const faqStyle = {
    maxWidth: '768px',
    margin: '0 auto',
    textAlign: 'center',
    paddingBottom: '64px',
    padding: isMobile ? '0 16px 64px 16px' : '0 0 64px 0'
  };

  const faqButtonContainerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '16px',
    justifyContent: 'center'
  };


  const { user } = useGlobalState()
  const router = useRouter();

  /**
   * Creates a new order for the given planId and type
   * @param {string} planId - The id of the plan to be purchased
   * @param {'monthly' | 'yearly'} type - The type of plan to be purchased (e.g. "monthly", "yearly")
   */
  const handlePayment = async (planId, type) => {

    const selectedPlan = plans.find(p => p.id === planId);
    const price = selectedPlan[type === 'yearly' ? 'annualPrice' : 'monthlyPrice']

    if (selectedPlan) {
      const order = await createOrder({
        amount: type === "yearly" ? price * 12 : price,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          planId: selectedPlan.id,
          userId: user.uid,
          type
        }
      });

      const options = {
        key: 'rzp_live_R7YmFhcKfy5fNY',
        amount: order.amount,
        currency: order.currency,
        name: 'Tradio',
        description: selectedPlan.description,
        image: "https://tradiohub.com/logos/tradio_light_logo.svg",
        order_id: order.id,
        callback_url: 'www.tradiohub.com',
        prefill: {
          name: user?.displayName,
          email: user?.email,
        },
        theme: {
          color: '#00A16B'
        },

        handler: async function (response) {
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (result.status === "ok") {
            const paymentDocId = await addPaymentsData({
              userId: user?.uid,
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: order.amount,
              currency: order.currency,
              planId: selectedPlan.id,
              method: "razorpay",
              status: "success",
            });

            await addUserData({
              plan: {
                planId: selectedPlan.id,
                type,
                amount: order.amount,
                trialPeriod: 0,
                activeSince: new Date(),
                latestPaymentId: paymentDocId,
              },
            });
            router.push("/dashboard");
            toast.success("Payment successfully");
          } else {
            toast.error("Payment Failed");
          }
        },
      }

      const rzp = new Razorpay(options);
      rzp.open();
    }
  }

  // Mobile Card Layout Component
  const MobileCardLayout = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {plans.map((plan) => {
        const IconComponent = plan.icon;
        const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
        const savings = plan.monthlyPrice - plan.annualPrice;

        return (
          <div key={plan.id} style={{
            borderRadius: '20px',
            overflow: 'hidden',
            background: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : '#ffffff',
            border: plan.popular
              ? (isDarkMode ? '2px solid #8b5cf6' : '2px solid #009966')
              : (isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid #e5e7eb'),
            backdropFilter: 'blur(12px)',
            position: 'relative'
          }}>
            {/* Popular Badge */}
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: isDarkMode ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)' : 'linear-gradient(90deg, #009966, #00b377)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 10
              }}>
                Most Popular
              </div>
            )}

            {/* Plan Header */}
            <div style={{
              padding: '24px',
              background: plan.popular
                ? (isDarkMode ? 'rgba(88, 28, 135, 0.2)' : 'rgba(0, 153, 102, 0.05)')
                : (isDarkMode ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb'),
              textAlign: 'center'
            }}>
              <div style={iconContainerStyle}>
                <IconComponent style={{ width: '20px', height: '20px', color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {plan.name}
              </h3>
              <p style={{
                fontSize: '14px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '16px'
              }}>
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold' }}>₹{price}</span>
                  <span style={{
                    fontSize: '16px',
                    marginLeft: '4px',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    /mo
                  </span>
                </div>
                {isAnnual && savings > 0 && (
                  <p style={{
                    color: isDarkMode ? '#10b981' : '#009966',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Save ₹{savings}/month
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePayment(plan.id, isAnnual ? 'yearly' : 'monthly')}
                style={plan.id === 'pro' ? primaryButtonStyle : {
                  ...buttonStyle,
                  background: '#ffffff',
                  color: '#009966',
                  border: '1px solid #009966'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Subscribe
              </button>
            </div>

            {/* Features List */}
            <div style={{ padding: '0 24px 24px' }}>
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                const value = feature.values[plan.id];

                return (
                  <div key={feature.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: index < features.length - 1
                      ? (isDarkMode ? '1px solid rgba(55, 65, 81, 0.3)' : '1px solid #f3f4f6')
                      : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <FeatureIcon style={{
                        width: '16px',
                        height: '16px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                      }} />
                      <span style={{ fontSize: '14px', fontWeight: '400' }}>
                        {feature.name}
                      </span>
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      {renderFeatureValue(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Animated Background Elements */}
      {isDarkMode && (
        <div style={backgroundElementsStyle}>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '256px',
            height: '256px',
            borderRadius: '50%',
            background: '#8b5cf6',
            filter: 'blur(64px)',
            opacity: 0.2,
            animation: 'pulse 2s infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            right: '25%',
            width: '384px',
            height: '384px',
            borderRadius: '50%',
            background: '#3b82f6',
            filter: 'blur(64px)',
            opacity: 0.2,
            animation: 'pulse 2s infinite',
            animationDelay: '1s'
          }}></div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={titleStyle}>
              Choose Your Plan
            </h1>
            <p style={subtitleStyle}>
              Unlock powerful features designed to accelerate your growth. Start free, scale seamlessly.
            </p>
          </div>

          {/* Billing Toggle */}
          <div style={billingToggleStyle}>
            <span style={{
              padding: '8px 12px',
              fontWeight: !isAnnual ? '600' : '400',
              color: !isAnnual ? (isDarkMode ? '#ffffff' : '#111827') : (isDarkMode ? '#9ca3af' : '#6b7280'),
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Monthly
            </span>
            <button onClick={() => setIsAnnual(!isAnnual)} style={switchStyle}>
              <div style={switchHandleStyle}></div>
            </button>
            <span style={{
              padding: '8px 12px',
              fontWeight: isAnnual ? '600' : '400',
              color: isAnnual ? (isDarkMode ? '#ffffff' : '#111827') : (isDarkMode ? '#9ca3af' : '#6b7280'),
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Annual
              <span style={{
                marginLeft: '8px',
                fontSize: '10px',
                background: '#fdc800',
                color: '#101826',
                padding: '2px 6px',
                borderRadius: '9999px'
              }}>Save 20%</span>
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
          {/* Pricing Table - Desktop or Mobile */}
          <div style={tableStyle}>
            {isMobile ? (
              <MobileCardLayout />
            ) : (
              <div style={tableContainerStyle}>
                {/* Popular Badge Row */}
                <div style={gridStyle}>
                  <div style={{ padding: '16px' }}></div>
                  {plans.map((plan) => (
                    <div key={plan.id} style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                      {plan.popular && (
                        <span style={{
                          background: isDarkMode ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)' : 'linear-gradient(90deg, #009966, #00b377)',
                          color: '#ffffff',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                          Most Popular
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Plan Icons and Names */}
                <div style={gridStyle}>
                  <div style={{
                    ...headerCellStyle,
                    textAlign: 'left'
                  }}>
                    Plans
                  </div>
                  {plans.map((plan) => {
                    const IconComponent = plan.icon;
                    return (
                      <div key={plan.id} style={plan.popular ? popularCellStyle : headerCellStyle}>
                        <div style={iconContainerStyle}>
                          <IconComponent style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{plan.name}</h3>
                      </div>
                    );
                  })}
                </div>

                {/* Description Row */}
                <div style={gridStyle}>
                  <div style={{
                    ...cellStyle,
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    Description
                  </div>
                  {plans.map((plan) => (
                    <div key={plan.id} style={{
                      ...cellStyle,
                      fontSize: '14px',
                      color: isDarkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {plan.description}
                    </div>
                  ))}
                </div>

                {/* Pricing Row */}
                <div style={gridStyle}>
                  <div style={{
                    ...cellStyle,
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    Monthly Price
                  </div>
                  {plans.map((plan) => {
                    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                    const savings = plan.monthlyPrice - plan.annualPrice;
                    return (
                      <div key={plan.id} style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '32px', fontWeight: 'bold' }}>₹{price}</span>
                          <span style={{
                            fontSize: '14px',
                            marginLeft: '4px',
                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                          }}>
                            /mo
                          </span>
                        </div>
                        {isAnnual && savings > 0 && (
                          <p style={{
                            color: isDarkMode ? '#10b981' : '#009966',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Save ₹{savings}/month
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feature Rows */}
                {features.map((feature, index) => {
                  const FeatureIcon = feature.icon;

                  return (
                    <div key={feature.name} style={{
                      ...gridStyle,
                      background: index % 2 === 0
                        ? (isDarkMode ? 'rgba(17, 24, 39, 0.2)' : 'rgba(249, 250, 251, 0.4)')
                        : 'transparent'
                    }}>
                      <div style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <FeatureIcon style={{
                          width: '16px',
                          height: '16px',
                          color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }} />
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{feature.name}</span>
                      </div>

                      {plans.map((plan) => (
                        <div key={`${feature.name}-${plan.id}`} style={{ padding: '16px', textAlign: 'center' }}>
                          {renderFeatureValue(feature.values[plan.id])}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* CTA Buttons Row */}
                <div style={gridStyle}>
                  <div style={{
                    ...cellStyle,
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    Get Started
                  </div>
                  {plans.map((plan) => (
                    <div key={plan.id} style={cellStyle}>
                      <button
                        onClick={() => handlePayment(plan.id, isAnnual ? 'yearly' : 'monthly')}
                        style={plan.id === 'pro' ? primaryButtonStyle : {
                          ...buttonStyle,
                          background: '#ffffff',
                          color: '#009966',
                          border: '1px solid #009966'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        Subscribe
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div style={trustIndicatorStyle}>
            <div style={trustContainerStyle}>
              <div style={trustItemStyle}>
                <Check style={{ width: '20px', height: '20px', color: isDarkMode ? '#10b981' : '#009966' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                  7-day free trial
                </span>
              </div>

              <div style={trustItemStyle}>
                <Shield style={{ width: '20px', height: '20px', color: isDarkMode ? '#3b82f6' : '#009966' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                  Credit card not required
                </span>
              </div>

              <div style={trustItemStyle}>
                <Award style={{ width: '20px', height: '20px', color: isDarkMode ? '#8b5cf6' : '#009966' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                  Cancel anytime
                </span>
              </div>

              <div style={trustItemStyle}>
                <Star style={{ width: '20px', height: '20px', color: isDarkMode ? '#eab308' : '#009966' }} />
                <span style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                  24/7 support
                </span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={faqStyle}>
            <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '24px' }}>
              Still have questions?
            </h3>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              marginBottom: '32px',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Our team is here to help you find the perfect plan for your needs.
            </p>

            <div style={faqButtonContainerStyle}>
              <button
                style={{
                  padding: isMobile ? '14px 24px' : '16px 32px',
                  borderRadius: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#ffffff',
                  color: '#009966',
                  border: '2px solid #009966',
                  fontSize: isMobile ? '14px' : '16px'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                onClick={() => window.open('https://orufybookings.com/tradio/feedback-session', '_blank')}
              >
                Contact Support
              </button>

              <button
                style={{
                  padding: isMobile ? '14px 24px' : '16px 32px',
                  borderRadius: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #009966, #00b377)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: isMobile ? '14px' : '16px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                onClick={() => window.open('https://orufybookings.com/tradio/feedback-session', '_blank')}
              >
                Schedule Demo
              </button>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

    </div>
  );
};

export default PricingPage;