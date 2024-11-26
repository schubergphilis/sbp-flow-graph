import { useCallback, useContext, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition } from '../helpers/AutoPosition'
import PositionModel from '../models/PositionModel'
import { GlobalState } from './Provider'

interface Props {
	children: JSX.Element
}

const Drag = ({ children }: Props) => {
	const { state, setState } = useContext(GlobalState)

	const selectedElement = undefined

	const [offset, setOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })

	const [targetList, setTargetList] = useState<SVGElement[]>()

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent<HTMLDivElement>) => {
			if (ev.button !== 0) return

			if (selectedElement !== '' && selectedElement !== undefined) return

			const target = ev.target as SVGElement

			if (!target.hasAttribute('data-node')) return

			ev.stopPropagation()
			ev.preventDefault()

			const id = target?.getAttribute('data-node-id') ?? ''

			let targets: SVGElement[] = []

			if (ev.metaKey) {
				targets = [...document.querySelectorAll<SVGElement>(`[data-node-parent=${id}],[data-node-id=${id}]`)]

				console.log('--- Drag Start ---', id)
			} else {
				targets = [target]

				console.log('--- Drag Cluster Start ---', id)
			}

			setTargetList(targets)

			setMouseOffset({ x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY })

			const offsetTarget = target?.closest<HTMLDivElement>('[data-pan]')

			const offset = offsetTarget?.getBoundingClientRect() ?? { x: 0, y: 0 }

			targets.forEach((target) => {
				const pos = getNodePosition(target)
				target.setAttribute('data-pos', `${pos.x},${pos.y}`)
			})

			setOffset({ x: offset.x, y: offset.y })

			setState({ ...state, ...{ dragElement: id, isClusterDrag: ev.metaKey } })
		},
		[state, setState, selectedElement]
	)

	const getTargetPos = useCallback((target: SVGElement): PositionModel => {
		const pos = target.getAttribute('data-pos')?.split(',') ?? ['0', '0']
		return { x: Number(pos[0]), y: Number(pos[1]) }
	}, [])

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			// console.table([
			// 	{
			// 		boxOffset: boxOffset.x,
			// 		offset: offset.x,
			// 		client: ev.clientX,
			// 		mouseOffset: mouseOffset.x,
			// 		pos: pos.x,
			// 		mouseX: ev.clientX - mouseOffset.x - offset.x
			// 	}
			// ])

			targetList?.forEach((target) => {
				const boxOffset = getTargetPos(target)

				const zoomLevel = state.zoomLevel ?? 1

				const pos: PositionModel = {
					x: Math.round((boxOffset.x - offset.x + (ev.clientX - offset.x)) / zoomLevel - mouseOffset.x),
					y: Math.round((boxOffset.y - offset.y + (ev.clientY - offset.y)) / zoomLevel - mouseOffset.y)
				}

				//TODO: Circle specific! should not be specific to an element
				target.setAttribute('cx', `${pos.x}`)
				target.setAttribute('cy', `${pos.y}`)
			})
		},
		[targetList, getTargetPos, state.zoomLevel, offset, mouseOffset]
	)

	const handleMoveEnd = useCallback(() => {
		const { dragElement: _, isClusterDrag: __, ...newState } = state
		console.log('--- Drag End ---', _, __)

		setState(newState)

		setTargetList(undefined)

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
