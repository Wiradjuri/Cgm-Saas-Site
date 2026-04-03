export default function Footer() {
  return (
    <footer style={{ background: '#0b1020', color: '#d1d5db', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <p style={{ margin: 0 }}>
          CGM SaaS operating as FlexiCAD. Developed by Bradley Peter Murray.
        </p>
        <p style={{ margin: 0 }}>ABN: 35 955 094 046 | Location: Miranda, NSW 2228</p>
        <p style={{ margin: 0 }}>
          Security by Design: Adhering to OWASP Top 10 standards for Industrial Infrastructure.
        </p>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: '#93c5fd' }}>
            Privacy
          </a>
          <a href="/terms" style={{ color: '#93c5fd' }}>
            Terms
          </a>
          <a href="/refunds" style={{ color: '#93c5fd' }}>
            Refunds
          </a>
        </nav>
      </div>
    </footer>
  );
}
