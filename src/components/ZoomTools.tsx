import { closestNumber, generateSteps } from '@helpers/Helpers'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { CssColorType } from '@schubergphilis/sbp-frontend-style'
import {
	getGraphIdState,
	getShowInfoState,
	getZoomLevelState,
	setShowInfoState,
	setZoomLevelState
} from '@store/SettingsSlice'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ActionButton } from './ActionButton'
import CenterTool from './CenterTool'
import AddIcon from './icons/AddIcon'
import InfoIcon from './icons/InfoIcon'
import RemoveIcon from './icons/RemoveIcon'

interface Props {
	autoCenter?: boolean
	zoomSmall?: boolean
	zoomColor?: CssColorType
}
const ZoomTools = ({ autoCenter, zoomSmall = false, zoomColor }: Props) => {
	const minZoom: number = 0.2
	const maxZoom: number = 3
	const step: number = 0.2
	const zoomLevels: number[] = generateSteps(minZoom, maxZoom, step)
	const selectedElement = ''

	const dispatch = useAppDispatch()

	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const showInfo = useAppSelector<boolean>(getShowInfoState)
	const graphId = useAppSelector<string>(getGraphIdState)

	const handleZoomLevel = useCallback(
		(level: number, delta: number) => {
			const newLevel = delta < 0 ? Math.max(minZoom, level) : Math.min(maxZoom, level)

			dispatch(setZoomLevelState(Math.round(newLevel * 100) / 100))
		},
		[dispatch]
	)

	const setZoom = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement>, delta: number) => {
			ev.preventDefault()
			ev.stopPropagation()

			const level = zoomLevel + step * delta
			const closest = closestNumber(zoomLevels, level)
			handleZoomLevel(closest, delta)
		},
		[handleZoomLevel, zoomLevel, zoomLevels]
	)

	const handleScroll = useCallback(
		(ev: WheelEvent) => {
			if (!ev.metaKey) return

			const delta = ev.deltaY
			const level = zoomLevel + delta / 100
			const newLevel = delta < 0 ? Math.max(minZoom, level) : Math.min(maxZoom, level)
			handleZoomLevel(newLevel, delta)
		},
		[handleZoomLevel, zoomLevel]
	)

	const handleShowInfo = useCallback(() => {
		dispatch(setShowInfoState(!showInfo))
	}, [dispatch, showInfo])

	useEffect(() => {
		document.getElementById(graphId)?.addEventListener('wheel', handleScroll)

		return () => {
			document.getElementById(graphId)?.removeEventListener('wheel', handleScroll)
		}
	}, [handleScroll, graphId])

	return (
		<Container $zoomSmall={zoomSmall}>
			<Left>
				<Level>level: {Math.round(zoomLevel * 100) / 100}</Level>
			</Left>
			<Center>
				<ActionButton
					disabled={maxZoom === zoomLevel || selectedElement !== ''}
					title="Zoom in"
					type="button"
					onClick={(ev) => setZoom(ev, 1)}
					$color={zoomColor}>
					<AddIcon />
				</ActionButton>
				<CenterTool autoCenter={autoCenter} color={zoomColor} />
				<ActionButton
					disabled={minZoom === zoomLevel || selectedElement !== ''}
					type="button"
					title="Zoom out"
					onClick={(ev) => setZoom(ev, -1)}
					$color={zoomColor}>
					<RemoveIcon />
				</ActionButton>
			</Center>
			<Right>
				<ActionButton
					$isSelected={showInfo}
					onClick={handleShowInfo}
					title="Show importance weights"
					$color={zoomColor}>
					<InfoIcon />
				</ActionButton>
			</Right>
		</Container>
	)
}

const Container = styled.div<{ $zoomSmall: boolean }>`
	position: absolute;
	bottom: 0;
	right: 0;
	display: flex;
	//flex-direction: column;
	justify-content: space-between;
	align-items: center;
	gap: 0.5em;
	z-index: 1;
	margin: 2em;
	min-width: 4em;
	font-size: ${({ $zoomSmall }) => ($zoomSmall ? '0.75em' : '1em')};
`
const Level = styled.div`
	font-size: 0.75em;
`
const Left = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5em;
`
const Center = styled(Left)``
const Right = styled(Left)``

export default ZoomTools
