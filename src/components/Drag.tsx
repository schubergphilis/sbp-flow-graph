import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition } from '../helpers/AutoPosition'
import PositionModel from '../models/PositionModel'
import { GlobalState } from './Provider'

interface Props {
	children: JSX.Element
}

const Drag = ({ children }: Props) => {
	const { state, setState } = useContext(GlobalState)

	const zoomLevel = 1
	const selectedElement = undefined

	const [pos, _setPos] = useState<PositionModel>({ x: 0, y: 0 })
	const [offset, setOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [boxOffset, setBoxOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })

	const [target, setTarget] = useState<SVGElement>()

	const posRef = useRef<PositionModel>(pos)

	const setPos = useCallback(
		(data: PositionModel) => {
			posRef.current = data
			_setPos(data)
		},
		[posRef, _setPos]
	)

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent<HTMLDivElement>) => {
			// If command is pressed, underlying FlowDrag will take over
			if (ev.metaKey) return

			if (ev.button !== 0) return

			if (selectedElement !== '' && selectedElement !== undefined) return

			const target = ev.target as SVGElement

			if (!target.hasAttribute('data-node')) return

			ev.stopPropagation()
			ev.preventDefault()

			setTarget(target)

			const id = target?.getAttribute('data-node-id') ?? ''
			console.log('--- Drag Start ---', id)

			const boxOffset = getNodePosition(target)

			setBoxOffset(boxOffset)
			setMouseOffset({ x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY })

			const offsetTarget = target?.closest<HTMLDivElement>('[data-pan]')

			const offset = offsetTarget?.getBoundingClientRect() ?? { x: 0, y: 0 }

			setOffset({ x: offset.x, y: offset.y })

			setState({ ...state, ...{ dragElement: id } })
		},
		[state, setState, setTarget, selectedElement]
	)

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			const pos: PositionModel = {
				x: Math.round((boxOffset.x - offset.x + (ev.clientX - offset.x)) / zoomLevel - mouseOffset.x),
				y: Math.round((boxOffset.y - offset.y + (ev.clientY - offset.y)) / zoomLevel - mouseOffset.y)
			}

			setPos(pos)

			target?.setAttribute('cx', `${pos.x}`)
			target?.setAttribute('cy', `${pos.y}`)
		},
		[offset, boxOffset, mouseOffset, zoomLevel, setPos, target]
	)

	const handleMoveEnd = useCallback(() => {
		const { dragElement: _, ...newState } = state
		console.log('--- Drag End ---', _)

		setState(newState)

		setTarget(undefined)

		window.removeEventListener('mousemove', handleMove)
		window.removeEventListener('mouseup', handleMoveEnd)
	}, [state, setState, handleMove])

	useLayoutEffect(() => {
		if (!state.dragElement) return

		document.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseup', handleMoveEnd)

		return () => {
			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [state.dragElement, handleMove, handleMoveEnd])

	return <Container onMouseDown={handleMouseDown}>{children}</Container>
}

const Container = styled.div`
	position: relative;
	overflow: visible;
	width: 100%;
	height: 100%;
	pointer-events: auto;
`

export default Drag
