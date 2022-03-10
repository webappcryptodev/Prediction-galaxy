import { ResetCSS } from '@pancakeswap/uikit'
import Script from 'next/script'
import BigNumber from 'bignumber.js'
// import EasterEgg from 'components/EasterEgg'
import GlobalCheckClaimStatus from 'components/GlobalCheckClaimStatus'
// import SubgraphHealthIndicator from 'components/SubgraphHealthIndicator'
import { ToastListener } from 'contexts/ToastsContext'
import useEagerConnect from 'hooks/useEagerConnect'
import { useInactiveListener } from 'hooks/useInactiveListener'
import useSentryUser from 'hooks/useSentryUser'
import useUserAgent from 'hooks/useUserAgent'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { PersistGate } from 'redux-persist/integration/react'
import { useStore, persistor } from 'state'
import { usePollBlockNumber } from 'state/block/hooks'
import { usePollCoreFarmData } from 'state/farms/hooks'
import { NextPage } from 'next'
import { useFetchProfile } from 'state/profile/hooks'
import { Blocklist, Updaters } from '..'
import ErrorBoundary from '../components/ErrorBoundary'
import Menu from '../components/Menu'
import BlockCountry from '../components/BlockCountry'
import Providers from '../Providers'
import GlobalStyle from '../style/Global'

// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

function GlobalHooks() {
  usePollBlockNumber()
  useEagerConnect()
  useFetchProfile()
  usePollCoreFarmData()
  useUserAgent()
  useInactiveListener()
  useSentryUser()
  return null
}

function MyApp(props: AppProps) {
  const { pageProps } = props
  const store = useStore(pageProps.initialReduxState)

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content="Cheaper and faster than Uniswap? Discover PancakeSwap, the leading DEX on Binance Smart Chain (BSC) with the best farms in DeFi and a lottery for CAKE."
        />
        <meta name="theme-color" content="#1FC7D4" />
        <meta name="twitter:image" content="https://pancakeswap.finance/images/hero.png" />
        <meta
          name="twitter:description"
          content="The most popular AMM on BSC! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by PancakeSwap), NFTs, and more, on a platform you can trust."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="🥞 PancakeSwap - A next evolution DeFi exchange on Binance Smart Chain (BSC)"
        />
        <title>Galaxy Goggle DAO</title>
      </Head>
      <Providers store={store}>
        <Blocklist>
          <GlobalHooks />
          <Updaters />
          <ResetCSS />
          <GlobalStyle />
          <GlobalCheckClaimStatus excludeLocations={[]} />
          <PersistGate loading={null} persistor={persistor}>
            <BlockCountry />
            <App {...props} />
          </PersistGate>
        </Blocklist>
      </Providers>
      <Script
        strategy="afterInteractive"
        id="google-tag"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${process.env.NEXT_PUBLIC_GTAG}');
          `,
        }}
      />
    </>
  )
}

type NextPageWithLayout = NextPage & {
  Layout?: React.FC
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? ErrorBoundary : Fragment


const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment
  const [logoState, setLogoState] = useState(true)
  const handleScroll = () => {
    console.log('window.scrollY========',window.scrollY)
    if(window.screenY>65) {
      console.log('window.scrollY>65',window.scrollY)
      setLogoState(false)
    } else {
      setLogoState(true)
    }
  }

  useEffect(() => {
    console.log('window.scrollY',window.scrollY)
  }, [handleScroll, logoState])

  document.addEventListener('scroll',handleScroll)
 // NOTE: Main layout component
  // This is the main layout component that wraps the entire page

  return (
    <ProductionErrorBoundary>
      <div id='galaxyLogo' style={{backgroundColor:'rgb(31 199 212)',width: '1.6rem', height: '1.6rem',position:'absolute',borderRadius: '100%',right:'23.8%', marginTop: '-41px', zIndex: '555', display: 'flex', alignItems: 'center'}}>
        <img src="https://bafybeia5iird2icxv6cszha72jrd2qktkuvpzyseaw3cc3mwbpjvvoixqi.ipfs.infura-ipfs.io/" style={{width:'2rem',borderRadius:'100%'}} alt='logo1'/>
        </div>
      <Menu>        
        <Layout>
          <Component {...pageProps} />          
        </Layout>
        <div style={{backgroundColor:'#27262c',width: '2rem',height:'3rem',position:'absolute',left:'5.5%',display: 'flex' , marginTop:'45px', alignItems: 'center'}}>
        <img src="https://bafybeia5iird2icxv6cszha72jrd2qktkuvpzyseaw3cc3mwbpjvvoixqi.ipfs.infura-ipfs.io/" style={{width:'2rem'}} alt='logo2'/>
        </div>
        <div style={{backgroundColor:'#27262c',width: '2.3rem', height: '2rem',position:'absolute',right:'20%',bottom:'39px', display: 'flex', alignItems: 'center',borderRadius: '100%', zIndex:'555'}}>
        <img src="https://bafybeia5iird2icxv6cszha72jrd2qktkuvpzyseaw3cc3mwbpjvvoixqi.ipfs.infura-ipfs.io/" style={{width:'2rem'}} alt='logo3'/>
        </div>
      </Menu>
      <ToastListener />
      {
        // Simple copyright notice
        <div className="text-center text-gray-500 text-xs">
          <p>
            <a href="https://galaxygoggle.io" target="_blank" rel="noopener noreferrer">
              Galaxy Goggle DAO
            </a>
            &nbsp;&copy;&nbsp;
            {new Date().getFullYear()}
          </p>
        </div>
      }
    </ProductionErrorBoundary>
  )
}

export default MyApp
