import { useState } from 'react';
import Footer from '../components/Footer';

const productCards = [
  {
    title: 'Distributed Data Engine',
    description: 'Operationalize high-throughput DDP pipelines for enterprise civil infrastructure data.',
  },
  {
    title: 'Database Migration',
    description: 'Modernize and synchronize legacy engineering systems into resilient cloud-native stacks.',
  },
  {
    title: 'Predictive Anomaly Detection',
    description: 'Detect infrastructure risk patterns early with production-ready industrial AI monitoring.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    key: 'starter',
    price: '$249 AUD',
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    key: 'pro',
    price: '$749 AUD',
    cta: 'Get Started',
  },
  {
    name: 'Business',
    key: 'business',
    price: '$1,850 AUD',
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    key: 'enterprise',
    price: 'Custom',
    cta: 'Contact Sales',
  },
];

export default function HomePage() {
  const [loadingTier, setLoadingTier] = useState('');

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = async (tier) => {
    setLoadingTier(tier);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to begin checkout.');
      }

      window.location.href = data.url;
    } catch (error) {
      window.alert(error.message);
    } finally {
      setLoadingTier('');
    }
  };

  return (
    <main style={{ fontFamily: 'Inter, Segoe UI, sans-serif', background: '#040712', color: '#f8fafc' }}>
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>
        <p style={{ color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Enterprise SaaS</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '0 0 1rem' }}>
          FlexiCAD: The Operating System for Industrial AI.
        </h1>
        <p style={{ maxWidth: 840, color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Enterprise-grade AI frameworks for CGM Civil Engineering. Deploy high-throughput DDP Engines and PAD
          Systems.
        </p>
      </section>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {productCards.map((card) => (
            <article
              key={card.title}
              style={{ border: '1px solid #1e293b', borderRadius: '14px', padding: '1.5rem', background: '#0b1120' }}
            >
              <h2 style={{ marginTop: 0 }}>{card.title}</h2>
              <p style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{card.description}</p>
              <button
                onClick={scrollToPricing}
                style={{
                  marginTop: '1rem',
                  background: '#1d4ed8',
                  border: 0,
                  color: 'white',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Request Demo
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ maxWidth: 1080, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {pricingTiers.map((tier) => {
            const checkoutEnabled = ['starter', 'pro', 'business'].includes(tier.key);
            const isLoading = loadingTier === tier.key;

            return (
              <article
                key={tier.key}
                style={{ border: '1px solid #1e293b', borderRadius: '14px', padding: '1.5rem', background: '#0b1120' }}
              >
                <h3 style={{ marginTop: 0 }}>{tier.name}</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{tier.price}</p>
                <button
                  disabled={isLoading}
                  onClick={() => (checkoutEnabled ? handleCheckout(tier.key) : scrollToPricing())}
                  style={{
                    background: checkoutEnabled ? '#2563eb' : '#334155',
                    border: 0,
                    color: 'white',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  {isLoading ? 'Redirecting…' : tier.cta}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export function privacyPolicy() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, Segoe UI, sans-serif', background: '#040712', color: '#f8fafc' }}>
      <h1>Privacy Policy</h1>
      <p>Effective Date: [Insert Date]</p>
      <p>At FlexiCAD, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.</p>
      <h2>Information We Collect</h2>
      <p>We may collect personal information such as your name, email address, and payment details when you interact with our website or make a purchase. We also collect non-personal information such as browser type and IP address for analytics purposes.</p>
      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to provide and improve our services, process transactions, communicate with you, and comply with legal obligations. We do not sell or rent your personal information to third parties.</p>
      <h2>Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.</p>
      <h2>Your Rights</h2>
      <p>You have the right to access, correct, or delete your personal information. You can also opt-out of receiving marketing communications from us. To exercise these rights, please contact us at [Insert Contact Information].</p>
      <h2>Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at [Insert Contact Information].</p>
    </div>
  );
}
