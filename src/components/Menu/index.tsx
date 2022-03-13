import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextLinkFromReactRouter } from 'components/NextLink'
import { Menu as UikitMenu } from '@pancakeswap/uikit'
import { languageList } from 'config/localization/languages'
import { useTranslation } from 'contexts/Localization'
import PhishingWarningBanner from 'components/PhishingWarningBanner'
import useTheme from 'hooks/useTheme'
import { useGGBusdPrice } from 'hooks/useBUSDPrice'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { usePhishingBannerManager } from 'state/user/hooks'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import { useGetLastOraclePrice } from 'state/predictions/hooks'
import config from './config/config'
import UserMenu from './UserMenu'
import GlobalSettings from './GlobalSettings'
import { getActiveMenuItem, getActiveSubMenuItem } from './utils'
import { footerLinks } from './config/footerConfig'



const Menu = (props) => {
  const { isDark, toggleTheme } = useTheme()
  const price = useGetLastOraclePrice()
  const ggPriceUsd = useGGBusdPrice();
  const ggPriceUsdDisplay = ggPriceUsd ? Number(ggPriceUsd.toFixed(3)) : 0;
  // const draftCakePriceUsd = usePriceCakeBusd();
  // const cakePriceUsd = draftCakePriceUsd.toNumber() * 3.18;
  const { currentLanguage, setLanguage, t } = useTranslation()
  const { pathname } = useRouter()
  const [showPhishingWarningBanner] = usePhishingBannerManager()

  const activeMenuItem = getActiveMenuItem({ menuConfig: config(t), pathname })
  const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

  console.log('uikitMenuActiveMenuItem props==>',props)
  console.log('uikitactiveSubMenuItem==>',activeSubMenuItem)
  const styles = {
    logoTitle: {
      display: 'flex',
      alignItems: 'center'
    },
    logoFont: {
      fontWeight: '900',
      fontSize: '20px'
    },
    flex: {
      display: 'flex'
    }
  }



  return (
    <UikitMenu
      linkComponent={(linkProps) => {
        return linkProps.href === "/" ? <a href="/" style={styles.logoTitle} ><div style={styles.flex}><img
        src="https://bafybeia5iird2icxv6cszha72jrd2qktkuvpzyseaw3cc3mwbpjvvoixqi.ipfs.infura-ipfs.io/"
        alt="gg"
        style={{
          width: '2.5rem',
          height: 'auto',
          borderRadius: '50%',          
          background: 'primary',
        }}
      /><div style={styles.logoFont}>PancakeSwap</div></div></a>
        : <NextLinkFromReactRouter to={linkProps.href} {...linkProps} prefetch={false} />
      }}
      userMenu={<UserMenu />}
      globalMenu={<GlobalSettings />}
      banner={showPhishingWarningBanner && typeof window !== 'undefined' && <PhishingWarningBanner />}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={currentLanguage.code}
      langs={languageList}
      setLang={setLanguage}
      cakePriceUsd={ggPriceUsdDisplay}
      links={config(t)}
      footerLinks={footerLinks(t)}
      activeItem={activeMenuItem?.href}
      activeSubItem={activeSubMenuItem?.href}
      buyCakeLabel={t('Buy GG')}
      {...props}
    />
  )
}

export default Menu
