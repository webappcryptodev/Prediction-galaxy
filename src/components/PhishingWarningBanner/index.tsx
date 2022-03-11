import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Box, CloseIcon, IconButton, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { usePhishingBannerManager } from 'state/user/hooks'

const Container = styled(Flex)`
  overflow: hidden;
  height: 100%;
  padding: 12px;
  align-items: center;
    linear-gradient(180deg, #8051d6 0%, #492286 100%);
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0px;
    background: linear-gradient(180deg, #8051d6 0%, #492286 100%);
  }
`

const InnerContainer = styled(Flex)`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

const SpeechBubble = styled.div`
  background: rgba(39, 38, 44, 0.4);
  border-radius: 16px;
  padding: 8px;
  width: 60%;
  height: 80%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  & ${Text} {
    flex-shrink: 0;
    margin-right: 4px;
  }
`

const PhishingWarningBanner: React.FC = () => {
  const { t } = useTranslation()
  const [, hideBanner] = usePhishingBannerManager()
  const { isMobile, isMd } = useMatchBreakpoints()
  const warningText = t("please make sure you're visiting https://galaxygoggle.finance - check the URL carefully.")
  const warningTextAsParts = warningText.split(/(https:\/\/galaxygoggle.finance)/g)
  const warningTextComponent = (
    <>
      <Text as="span" color="warning" small bold textTransform="uppercase">
        {t('Phishing warning: ')}
      </Text>
      {warningTextAsParts.map((text, i) => (
        <Text
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          small
          as="span"
          bold={text === 'https://galaxygoggle.finance'}
          color={text === 'https://galaxygoggle.finance' ? '#FFFFFF' : '#BDC2C4'}
        >
          {text}          
        </Text>
      ))}
    </>
  )
  return (
    <Container>
      {isMobile || isMd ? (
        <>
          <Box>
            {warningTextComponent}
          </Box>
          <IconButton onClick={hideBanner} variant="text">
            <CloseIcon color="#FFFFFF" />
          </IconButton>
        </>
      ) : (
        <>
          <InnerContainer>
            <picture>
              <img src="https://bafybeic2zqzzcsvqlemgzvlgwc77yxkykdngsztcqs4yoasldmp54edzl4.ipfs.infura-ipfs.io/" alt="phishing-warning" width="92px" />
            </picture>
            <SpeechBubble>{warningTextComponent}</SpeechBubble>
          </InnerContainer>
          <IconButton onClick={hideBanner} variant="text">
            <CloseIcon color="#FFFFFF" />
          </IconButton>
          <div id='galaxyLogo' style={{backgroundColor:'rgb(31 199 212)',width: '1.6rem', height: '1.6rem',position:'absolute',borderRadius: '100%',right:'23.8%', marginTop: '125px', zIndex: '555', display: 'flex', alignItems: 'center'}}>
            <img src="https://bafybeia5iird2icxv6cszha72jrd2qktkuvpzyseaw3cc3mwbpjvvoixqi.ipfs.infura-ipfs.io/" style={{width:'2rem',borderRadius:'100%'}} alt='logo1'/>
          </div>
        </>
      )}
    </Container>
  )
}

export default PhishingWarningBanner
