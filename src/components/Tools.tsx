import { useCallback, useContext } from 'react'
import styled from 'styled-components'
import { closestNumber, generateSteps } from '../helpers/Helpers'
import AddIcon from './icons/AddIcon'
import RemoveIcon from './icons/RemoveIcon'
import { GlobalState } from './Provider'

const Tools = () => {
	const minZoom: number = 0.25
	const maxZoom: number = 3
	const step: number = 0.25
	const zoomLevels: number[] = generateSteps(minZoom, maxZoom, step)
	const selectedElement = ''

	const { state, setState } = useContext(GlobalState)

	const handleZoomLevel = useCallback(
		(level: number, delta: number) => {
			const newLevel = delta < 0 ? Math.max(minZoom, level) : Math.min(maxZoom, level)

			setState({ ...state, ...{ zoomLevel: Math.round(newLevel * 100) / 100 } })
		},
		[setState, state]
	)

	const setMinZoom = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement>) => {
			ev.preventDefault()
			ev.stopPropagation()
			const level = (state.zoomLevel ?? 1) - step
			const closest = closestNumber(zoomLevels, level)
			handleZoomLevel(closest, -1)
		},
		[handleZoomLevel, state.zoomLevel, zoomLevels]
	)

	const setMaxZoom = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement>) => {
			ev.preventDefault()
			ev.stopPropagation()
			const level = (state.zoomLevel ?? 1) + step
			const closest = closestNumber(zoomLevels, level)
			handleZoomLevel(closest, 1)
		},
		[handleZoomLevel, state.zoomLevel, zoomLevels]
	)

	return (
		<Container>
			<ActionButton disabled={maxZoom === state.zoomLevel || selectedElement !== ''} type="button" onClick={setMaxZoom}>
				<AddIcon />
			</ActionButton>
			<Level>level: {Math.round((state.zoomLevel ?? 1) * 100) / 100}</Level>
			<ActionButton disabled={minZoom === state.zoomLevel || selectedElement !== ''} type="button" onClick={setMinZoom}>
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
const ActionButton = styled.button`
	border-radius: 0.5em;
	background-color: rgba(255, 255, 255, 0.75);
	height: 3em;
	width: 3em;
	border: 1px solid black;
	cursor: pointer;
	pointer-events: all !important;
`
export default Tools
