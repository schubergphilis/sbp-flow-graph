import { closestNumber, generateSteps } from '@helpers/Helpers'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { getZoomLevelState, setZoomLevelState } from '@store/SettingsSlice'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import CenterTool from './CenterTool'
import AddIcon from './icons/AddIcon'
import RemoveIcon from './icons/RemoveIcon'

const ZoomTools = () => {
	const minZoom: number = 0.25
	const maxZoom: number = 3
	const step: number = 0.25
	const zoomLevels: number[] = generateSteps(minZoom, maxZoom, step)
	const selectedElement = ''

	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)

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

	useEffect(() => {
		document.addEventListener('wheel', handleScroll)

		return () => {
			document?.removeEventListener('wheel', handleScroll)
		}
	}, [handleScroll])

	return (
		<Container>
			<Level>level: {Math.round(zoomLevel * 100) / 100}</Level>
			<ActionButton
				disabled={maxZoom === zoomLevel || selectedElement !== ''}
				type="button"
				onClick={(ev) => setZoom(ev, 1)}>
				<AddIcon />
			</ActionButton>
			<CenterTool />
			<ActionButton
				disabled={minZoom === zoomLevel || selectedElement !== ''}
				type="button"
				onClick={(ev) => setZoom(ev, -1)}>
				<RemoveIcon />
			</ActionButton>
		</Container>
	)
}

const Container = styled.div`
	position: absolute;
	bottom: 0;
	right: 0;
	display: flex;
	flex-direction: column;
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
export const ActionButton = styled.button`
	border-radius: 0.5em;
	background-color: rgba(255, 255, 255, 0.75);
	height: 3em;
	width: 3em;
	border: 1px solid black;
	cursor: pointer;
	pointer-events: all !important;

	&:hover {
		background-color: rgba(233, 233, 233, 0.75);
	}

	&:active {
		background-color: rgba(200, 200, 200, 0.75);
	}
`
export default ZoomTools
