import { closestNumber, generateSteps } from '@helpers/Helpers'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import {
	getGraphIdState,
	getShowInfoState,
	getZoomLevelState,
	setShowInfoState,
	setZoomLevelState
} from '@store/SettingsSlice'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import CenterTool from './CenterTool'
import AddIcon from './icons/AddIcon'
import InfoIcon from './icons/InfoIcon'
import RemoveIcon from './icons/RemoveIcon'

interface Props {
	autoCenter?: boolean
}
const ZoomTools = ({ autoCenter }: Props) => {
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
		<Container>
			<Left>
				<Level>level: {Math.round(zoomLevel * 100) / 100}</Level>
			</Left>
			<Center>
				<ActionButton
					disabled={maxZoom === zoomLevel || selectedElement !== ''}
					title="Zoom in"
					type="button"
					onClick={(ev) => setZoom(ev, 1)}>
					<AddIcon />
				</ActionButton>
				<CenterTool autoCenter={autoCenter} />
				<ActionButton
					disabled={minZoom === zoomLevel || selectedElement !== ''}
					type="button"
					title="Zoom out"
					onClick={(ev) => setZoom(ev, -1)}>
					<RemoveIcon />
				</ActionButton>
			</Center>
			<Right>
				<ActionButton $isSelected={showInfo} onClick={handleShowInfo} title="Show importance weights">
					<InfoIcon />
				</ActionButton>
			</Right>
		</Container>
	)
}

const Container = styled.div`
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

export const ActionButton = styled.button<{ $isSelected?: boolean }>`
	border-radius: 0.5em;
	background-color: ${({ $isSelected, theme }) => ($isSelected ? theme.style.colorPrimary : theme.style.cardColorBg)};
	height: 3em;
	width: 3em;
	border: 1px solid ${({ theme }) => theme.style.borderColor};
	cursor: pointer;
	pointer-events: all !important;

	&:hover {
		filter: hue-rotate(2deg) brightness(95%);
	}

	&:active {
		filter: hue-rotate(4deg) brightness(90%);
	}
`
export default ZoomTools
