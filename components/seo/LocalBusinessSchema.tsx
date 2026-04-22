'use client'

export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'La Mina de Oro',
    image: 'https://minadeoro.com.co/og-image.png',
    '@id': 'https://minadeoro.com.co',
    url: 'https://minadeoro.com.co',
    telephone: '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'Colombia',
      postalCode: '',
      addressCountry: 'CO',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '$$',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
