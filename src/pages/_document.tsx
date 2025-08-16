import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to external domains */}
          <link rel="preconnect" href="https://lh3.googleusercontent.com" />
          <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
          
          {/* Meta tags for security */}
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https://lh3.googleusercontent.com https://placehold.co data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com; font-src 'self' data:;" />
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
