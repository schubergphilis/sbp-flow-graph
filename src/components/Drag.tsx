import { useCallback, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition } from '../helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '../hooks/ReduxStore'
import PositionModel from '../models/PositionModel'
import {
	getDragElementState,
	getPanPositionState,
	getZoomLevelState,
	setClusterDragState,
	setDragElementState,
	setPositionState
} from '../store/SettingsSlice'

interface Props {
	children: JSX.Element
}

const Drag = ({ children }: Props) => {
	const dispatch = useAppDispatch()
	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)

	const selectedElement = undefined

	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [targetList, setTargetList] = useState<SVGElement[]>()

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent<HTMLDivElement>) => {
			if (ev.button !== 0) return

			if (selectedElement !== '' && selectedElement !== undefined) return

			const element = ev.target as SVGElement

			const target = element.closest('g[data-node]') as SVGElement

			if (!target || !target?.hasAttribute('data-node')) return

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

			targets.forEach((target) => {
				const node = target.querySelector<SVGElement>('circle, rect') ?? null
				const pos = getNodePosition(node)
				target.setAttribute('data-pos', `${pos.x},${pos.y}`)
			})

			dispatch(setDragElementState(id))
			dispatch(setClusterDragState(ev.metaKey))
		},
		[selectedElement, dispatch]
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

			const offset = panPosition ?? { x: 0, y: 0 }

			targetList?.forEach((target) => {
				const node = target.querySelector<SVGElement>('circle, rect') ?? null
				const box = getNodePosition(node, offset, zoomLevel)
				const boxOffset = getTargetPos(target)

				const pos: PositionModel = {
					x: Math.round((boxOffset.x - offset.x + (ev.clientX - offset.x)) / zoomLevel - mouseOffset.x),
					y: Math.round((boxOffset.y - offset.y + (ev.clientY - offset.y)) / zoomLevel - mouseOffset.y)
				}

				const group = target.closest('g[data-node]')

				if (!group) return

				group?.setAttribute('transform', `translate(${pos.x - box.width / 2}, ${pos.y - box.height / 2})`)
			})
		},
		[targetList, getTargetPos, zoomLevel, panPosition, mouseOffset]
	)

	const handleMoveEnd = useCallback(() => {
		dispatch(setDragElementState(undefined))
		dispatch(setClusterDragState(false))

		targetList?.forEach((target) => {
			const id = target?.getAttribute('data-node-id') ?? ''
			const pos = getNodePosition(target, panPosition, zoomLevel)
			dispatch(setPositionState({ id: id, x: pos.x, y: pos.y }))
		})

		setTargetList(undefined)

		window.removeEventListener('mousemove', handleMove)
		window.removeEventListener('mouseup', handleMoveEnd)
	}, [dispatch, handleMove, panPosition, targetList, zoomLevel])

	useLayoutEffect(() => {
		if (!dragElement) return

		document.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseup', handleMoveEnd)

		return () => {
			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [dragElement, handleMove, handleMoveEnd])

	return <Container onMouseDown={handleMouseDown}>{children}</Container>
}

const Container = styled.div`
	position: relative;
	overflow: visible;
	width: 100%;
	height: 100%;
`

export default Drag
