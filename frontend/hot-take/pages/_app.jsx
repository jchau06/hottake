import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";

import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <meta name="apple-mobile-web-app-title" content="HotTake" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0,user-scalable=no"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="UTF-8" />

        <link
          rel="shortcut icon"
          href="/favicons/teal-fire-icon-transparent.svg"
        />

        {/* <link rel="icon" href="/favicon.ico" size="any" /> */}
        {/* <link rel="icon" type="image/x-icon" size="128" href="/favicon.ico" /> */}
        {/* <link rel="shortcut icon" size="128" href="../public/favicon.ico" /> */}

        {/* <link rel="apple-touch-icon" size="128" href="/favicon.ico" /> */}

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <title>HotTake</title>
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </div>
  );
}
