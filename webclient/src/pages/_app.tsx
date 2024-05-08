import { AppProps } from "next/app";
import React from "react";
import "../css/bootstrap.scss";
import "../css/global.scss";
import { use100vh } from "react-div-100vh";
import Head from "next/head";

const title = "Collaborative Climate Conquest";
const description =
  "A game made with the SOLUZION Framework to tackle the Wicked Problem of Climate Change";

export default ({ Component, pageProps }: AppProps) => {
  const height = use100vh() ?? 1000;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property={"og:title"} key={"title"} content={title} />
        <meta
          property={"og:description"}
          key={"description"}
          content={description}
        />
        <link
          key={"icon"}
          rel={"icon"}
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/climate_ghosts.png`}
        />
      </Head>
      <div
        className={"bg-light d-flex flex-column overflow-y-scroll"}
        style={{ height }}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
};
