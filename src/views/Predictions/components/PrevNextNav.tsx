import { ArrowBackIcon, ArrowForwardIcon, BunnyCardsIcon, Flex, IconButton, Box } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useGetCurrentEpoch, useGetSortedRounds } from 'state/predictions/hooks'
import useSwiper from '../hooks/useSwiper'

const MyCustomTokenIcon = () => {
  return (
    <Box
      style={{
        width: '1.5rem',
        height: '1.5rem',
        borderRadius: '50%',
        background: 'primary',
        color: 'white',
        // display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="https://bafybeic2zqzzcsvqlemgzvlgwc77yxkykdngsztcqs4yoasldmp54edzl4.ipfs.infura-ipfs.io/"
        alt="gg"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'primary',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </Box>
  )
}

const StyledPrevNextNav = styled(Flex)`
  align-items: center;
  display: none;
  justify-content: space-between;
  overflow: initial;
  position: relative;
  width: 128px;

  box-shadow: ${({ theme }) => theme.shadows.level1};
  border-radius: ${({ theme }) => theme.radii.default};
  background-color: ${({ theme }) => theme.card.background};

  ${({ theme }) => theme.mediaQueries.lg} {
    display: flex;
  }
`

const Icon = styled.div`
  cursor: pointer;
  left: 50%;
  margin-left: -32px;
  position: absolute;
`

const PrevNextNav = () => {
  const { swiper } = useSwiper()
  const currentEpoch = useGetCurrentEpoch()
  const rounds = useGetSortedRounds()

  const handlePrevSlide = () => {
    swiper.slidePrev()
  }

  const handleNextSlide = () => {
    swiper.slideNext()
  }

  const handleSlideToLive = () => {
    const currentEpochIndex = rounds.findIndex((round) => round.epoch === currentEpoch)

    swiper.slideTo(currentEpochIndex - 1)
    swiper.update()
  }

  return (
    <StyledPrevNextNav>
      <IconButton variant="text" scale="sm" onClick={handlePrevSlide}>
        <ArrowBackIcon color="primary" width="24px" />
      </IconButton>
      <Icon onClick={handleSlideToLive}>
        <MyCustomTokenIcon />
      </Icon>
      <IconButton variant="text" scale="sm" onClick={handleNextSlide}>
        <ArrowForwardIcon color="primary" width="24px" />
      </IconButton>
    </StyledPrevNextNav>
  )
}

export default PrevNextNav
