import { getNodePosition } from '@helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import PositionModel from '@models/PositionModel'
import {
	getPanPositionState,
	getZoomLevelState,
	setClusterDragState,
	setDragElementState,
	setPositionState
} from '@store/SettingsSlice'
import { useCallback, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'

interface Props {
	children: JSX.Element
}

const Drag = ({ children }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)

	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [targetList, setTargetList] = useState<SVGElement[]>()
	const [startDragging, setStartDragging] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [targetNode, setTargetNode] = useState<SVGElement>()

	const getTargetPos = useCallback((target: SVGElement): PositionModel => {
		const pos = target.getAttribute('data-pos')?.split(',') ?? ['0', '0']
		return { x: Number(pos[0]), y: Number(pos[1]) }
	}, [])

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent<HTMLDivElement>) => {
			if (ev.button !== 0) return

			const element = ev.target as SVGElement

			const target = element.closest('g[data-node]') as SVGElement

			if (!target || !target?.hasAttribute('data-node')) return

			setTargetNode(target)

			ev.stopPropagation()
			ev.preventDefault()

			const id = target?.getAttribute('data-node-id') ?? ''

			let targets: SVGElement[] = []

			if (ev.metaKey) {
				targets = [...document.querySelectorAll<SVGElement>(`[data-node-parent=${id}],[data-node-id=${id}]`)]
			} else {
				targets = [target]
			}

			setTargetList(targets)

			setMouseOffset({ x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY })

			setStartDragging(true)

			dispatch(setClusterDragState(ev.metaKey))
		},
		[dispatch]
	)

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			const offset = panPosition ?? { x: 0, y: 0 }

			const mouse: PositionModel = {
				x: (ev.clientX - offset.x) / zoomLevel - mouseOffset.x,
				y: (ev.clientY - offset.y) / zoomLevel - mouseOffset.y
			}

			const threshold = 20
			const thresholdX = Math.abs(mouse.x) > threshold
			const thresholdY = Math.abs(mouse.y) > threshold

			if (!isDragging && (thresholdX || thresholdY)) {
				const id = targetNode?.getAttribute('data-node-id') ?? undefined

				dispatch(setDragElementState(id))
				setIsDragging(true)
			}

			targetList?.forEach((target) => {
				const box = getNodePosition(target, offset, zoomLevel)
				const boxOffset = getTargetPos(target)

				const center: PositionModel = {
					x: boxOffset.x - box.width / 2,
					y: boxOffset.y - box.height / 2
				}

				const pos: PositionModel = {
					x: Math.round(center.x + mouse.x),
					y: Math.round(center.y + mouse.y)
				}

				target.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
			})
		},
		[isDragging, panPosition, targetList, dispatch, zoomLevel, getTargetPos, mouseOffset, targetNode]
	)

	const handleMoveEnd = useCallback(
		(ev: MouseEvent) => {
			dispatch(setDragElementState(undefined))
			dispatch(setClusterDragState(false))

			setStartDragging(false)

			if (!isDragging) {
				const offset = panPosition ?? { x: 0, y: 0 }

				const element = ev.target as SVGElement

				const target = element.closest('g[data-node]') as SVGElement

				if (!target) return

				const box = getNodePosition(target, offset, zoomLevel)
				const boxOffset = getTargetPos(target)

				const pos: PositionModel = {
					x: Math.floor(boxOffset.x - box.width / 2),
					y: Math.floor(boxOffset.y - box.height / 2)
				}

				target.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
				return
			}

			setIsDragging(false)
			setTargetNode(undefined)

			targetList?.forEach((target) => {
				// const node = target.querySelector<SVGElement>('circle, rect') ?? null
				const id = (target?.getAttribute('data-node-id') ?? '').replace(/^X/gim, '')
				const pos = getNodePosition(target, panPosition, zoomLevel)

				target.setAttribute('data-pos', `${pos.x},${pos.y}`)
				dispatch(setPositionState({ id: id, x: pos.x, y: pos.y, isVisible: true }))
			})

			setTargetList(undefined)

			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('mouseup', handleMoveEnd)
		},
		[dispatch, getTargetPos, handleMove, isDragging, panPosition, targetList, zoomLevel]
	)

	useLayoutEffect(() => {
		if (!startDragging) return

		document.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseup', handleMoveEnd)

		return () => {
			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [startDragging, handleMove, handleMoveEnd])

	return <Container onMouseDown={handleMouseDown}>{children}</Container>
}

const Container = styled.div`
	position: relative;
	overflow: visible;
	width: 100%;
	height: 100%;
`

export default Drag
