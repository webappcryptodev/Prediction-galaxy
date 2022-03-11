import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowBackIcon,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Button,
  BinanceIcon,
  Text,
  BalanceInput,
  Slider,
  Box,
  AutoRenewIcon,
} from '@pancakeswap/uikit'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import { Zero } from '@ethersproject/constants'
import { parseUnits } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { useGetMinBetAmount } from 'state/predictions/hooks'
import { useTranslation } from 'contexts/Localization'
import { usePredictionsContract } from 'hooks/useContract'
import { useGetBnbBalance, useGetGGBalance } from 'hooks/useTokenBalance'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { BetPosition } from 'state/types'
import { formatBigNumber, formatFixedNumber } from 'utils/formatBalance'
import ConnectWalletButton from 'components/ConnectWalletButton'
import PositionTag from '../PositionTag'
import useSwiper from '../../hooks/useSwiper'
import FlexRow from '../FlexRow'

interface SetPositionCardProps {
  position: BetPosition
  togglePosition: () => void
  epoch: number
  onBack: () => void
  onSuccess: (hash: string) => Promise<void>
}

const dust = parseUnits('0.01', 18)
const percentShortcuts = [10, 25, 50, 75]

const MyCustomTokenIcon = () => {
  return (
    <Box
      style={{
        width: '1.5rem',
        height: 'auto',
        borderRadius: '50%',
        background: 'primary',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="https://bafybeia5iird2icxv6cszha72jrd2qktkuvpzyseaw3cc3mwbpjvvoixqi.ipfs.infura-ipfs.io/"
        alt="gg"
        style={{
          width: '2.5rem',
          height: 'auto',
          borderRadius: '50%',
          background: 'primary',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Rotate it slightly
          transform: 'rotate(-10deg)',
        }}
      />
    </Box>
  )
}

const getButtonProps = (value: BigNumber, bnbBalance: BigNumber, minBetAmountBalance: BigNumber) => {
  const hasSufficientBalance = () => {
    if (value.gt(0)) {
      return value.lte(bnbBalance)
    }
    return bnbBalance.gt(0)
  }

  if (!hasSufficientBalance()) {
    return { key: 'Insufficient GG balance', disabled: true }
  }

  if (value.eq(0)) {
    return { key: 'Enter an amount', disabled: true }
  }

  return { key: 'Confirm', disabled: value.lt(minBetAmountBalance) }
}

const getValueAsEthersBn = (value: string) => {
  const valueAsFloat = parseFloat(value)
  return Number.isNaN(valueAsFloat) ? Zero : parseUnits(value)
}

const SetPositionCard: React.FC<SetPositionCardProps> = ({ position, togglePosition, epoch, onBack, onSuccess }) => {
  const [value, setValue] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [percent, setPercent] = useState(0)

  const { account } = useWeb3React()
  const { swiper } = useSwiper()
  const { balance: bnbBalance } = useGetBnbBalance()
  const { balance: ggBalance, fetchStatus } = useGetGGBalance()
  const minBetAmount = useGetMinBetAmount()
  const { t } = useTranslation()
  const { fetchWithCatchTxError, loading: isTxPending } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const predictionsContract = usePredictionsContract()

  const maxBalance = useMemo(() => {
    return ggBalance.gt(dust) ? ggBalance.sub(dust) : dust
  }, [ggBalance])
  const balanceDisplay = formatBigNumber(ggBalance)

  const valueAsBn = getValueAsEthersBn(value)
  const showFieldWarning = account && valueAsBn.gt(0) && errorMessage !== null

  const handleInputChange = (input: string) => {
    const inputAsBn = getValueAsEthersBn(input)

    if (inputAsBn.eq(0)) {
      setPercent(0)
    } else {
      const inputAsFn = FixedNumber.from(inputAsBn)
      const maxValueAsFn = FixedNumber.from(maxBalance)
      const hundredAsFn = FixedNumber.from(100)
      const percentage = inputAsFn.divUnsafe(maxValueAsFn).mulUnsafe(hundredAsFn)
      const percentageAsFloat = percentage.toUnsafeFloat()

      setPercent(percentageAsFloat > 100 ? 100 : percentageAsFloat)
    }
    setValue(input)
  }

  const handlePercentChange = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const maxValueAsFn = FixedNumber.from(maxBalance)
      const hundredAsFn = FixedNumber.from(100)
      const sliderPercentAsFn = FixedNumber.from(sliderPercent.toFixed(18)).divUnsafe(hundredAsFn)
      const balancePercentage = maxValueAsFn.mulUnsafe(sliderPercentAsFn)
      setValue(formatFixedNumber(balancePercentage))
    } else {
      setValue('')
    }
    setPercent(sliderPercent)
  }

  // Clear value
  const handleGoBack = () => {
    setValue('')
    setPercent(0)
    onBack()
  }

  // Disable the swiper events to avoid conflicts
  const handleMouseOver = () => {
    swiper.keyboard.disable()
    swiper.mousewheel.disable()
    swiper.detachEvents()
  }

  const handleMouseOut = () => {
    swiper.keyboard.enable()
    swiper.mousewheel.enable()
    swiper.attachEvents()
  }

  const { key, disabled } = getButtonProps(valueAsBn, maxBalance, minBetAmount)

  const handleEnterPosition = async () => {
    const betMethod = position === BetPosition.BULL ? 'betBull' : 'betBear'

    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(predictionsContract, betMethod, [epoch], { value: valueAsBn.toString() })
    })
    if (receipt?.status) {
      onSuccess(receipt.transactionHash)
    }
  }

  // Warnings
  useEffect(() => {
    const inputAmount = getValueAsEthersBn(value)
    const hasSufficientBalance = inputAmount.gt(0) && inputAmount.lte(maxBalance)

    if (!hasSufficientBalance) {
      setErrorMessage(t('Insufficient GG balance'))
    } else if (inputAmount.gt(0) && inputAmount.lt(minBetAmount)) {
      setErrorMessage(
        t('A minimum amount of %num% %token% is required', { num: formatBigNumber(minBetAmount), token: 'GG' }),
      )
    } else {
      setErrorMessage(null)
    }
  }, [value, maxBalance, minBetAmount, setErrorMessage, t])

  return (
    <Card onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <CardHeader p="16px">
        <Flex alignItems="center">
          <IconButton variant="text" scale="sm" onClick={handleGoBack} mr="8px">
            <ArrowBackIcon width="24px" />
          </IconButton>
          <FlexRow>
            <Heading scale="md">{t('Set Position')}</Heading>
          </FlexRow>
          <PositionTag betPosition={position} onClick={togglePosition}>
            {position === BetPosition.BULL ? t('Up') : t('Down')}
          </PositionTag>
        </Flex>
      </CardHeader>
      <CardBody py="16px">
        <Flex alignItems="center" justifyContent="space-between" mb="8px">
          <Text textAlign="right" color="textSubtle">
            {t('Commit')}:
          </Text>
          <Flex alignItems="center">
           <MyCustomTokenIcon />
            <Text bold textTransform="uppercase">
              GG
            </Text>
          </Flex>
        </Flex>
        <BalanceInput
          value={value}
          onUserInput={handleInputChange}
          isWarning={showFieldWarning}
          inputProps={{ disabled: !account || isTxPending }}
        />
        {showFieldWarning && (
          <Text color="failure" fontSize="12px" mt="4px" textAlign="right">
            {errorMessage}
          </Text>
        )}
        <Text textAlign="right" mb="16px" color="textSubtle" fontSize="12px" style={{ height: '18px' }}>
          {account && t('Balance: %balance%', { balance: balanceDisplay })}
        </Text>
        <Slider
          name="balance"
          min={0}
          max={100}
          value={percent}
          onValueChanged={handlePercentChange}
          valueLabel={account ? `${percent.toFixed(percent > 0 ? 1 : 0)}%` : ''}
          step={0.01}
          disabled={!account || isTxPending}
          mb="4px"
          className={!account || isTxPending ? '' : 'swiper-no-swiping'}
        />
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          {percentShortcuts.map((percentShortcut) => {
            const handleClick = () => {
              handlePercentChange(percentShortcut)
            }

            return (
              <Button
                key={percentShortcut}
                scale="xs"
                variant="tertiary"
                onClick={handleClick}
                disabled={!account || isTxPending}
                style={{ flex: 1 }}
              >
                {`${percentShortcut}%`}
              </Button>
            )
          })}
          <Button
            scale="xs"
            variant="tertiary"
            onClick={() => handlePercentChange(100)}
            disabled={!account || isTxPending}
          >
            {t('Max')}
          </Button>
        </Flex>
        <Box mb="8px">
          {account ? (
            <Button
              width="100%"
              disabled={!account || disabled}
              onClick={handleEnterPosition}
              isLoading={isTxPending}
              endIcon={isTxPending ? <AutoRenewIcon color="currentColor" spin /> : null}
            >
              {t(key)}
            </Button>
          ) : (
            <ConnectWalletButton width="100%" />
          )}
        </Box>
        <Text as="p" fontSize="12px" lineHeight={1} color="textSubtle">
          {t('You won’t be able to remove or change your position once you enter it.')}
        </Text>
      </CardBody>
    </Card>
  )
}

export default SetPositionCard
