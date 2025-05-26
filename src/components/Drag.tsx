import { getNodePosition, getTargetOffset } from '@helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import PositionModel from '@models/PositionModel'
import {
	getPagetOffsetState,
	getPanPositionState,
	getZoomLevelState,
	setClusterDragState,
	setDragElementState,
	setPositionState
} from '@store/SettingsSlice'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
	children: JSX.Element
}

const Drag = ({ children }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPagetOffsetState)

	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [targetList, setTargetList] = useState<SVGElement[]>()
	const [startDragging, setStartDragging] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [targetNode, setTargetNode] = useState<SVGElement>()

	const ref = useRef<HTMLDivElement>(null)

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent<HTMLDivElement>) => {
			if (ev.button !== 0) return

			const element = ev.target as SVGElement

			const target = element.closest('[data-node]') as SVGElement

			if (!target || !target?.hasAttribute('data-node')) return

			setTargetNode(target)

			ev.stopPropagation()
			ev.preventDefault()

			const id = target?.getAttribute('data-node-id') ?? ''

			let targets: SVGElement[] = []

			if (ev.metaKey) {
				targets = [target]
			} else {
				targets = [
					...document.querySelectorAll<SVGElement>(
						`[data-node-parent=${id}]:not([data-node-children-visible=true]),[data-node-id=${id}]`
					)
				]
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

			const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

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
				const boxOffset = getTargetOffset(target)

				// Don't set position on nodes that aren't opened yet (need autoPosition first)
				if (boxOffset.x === 0 && boxOffset.y === 0) return

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
		[isDragging, panPosition, pageOffset, targetList, dispatch, zoomLevel, mouseOffset, targetNode]
	)

	const handleMoveEnd = useCallback(
		(ev: MouseEvent) => {
			dispatch(setDragElementState(undefined))
			dispatch(setClusterDragState(false))

			setStartDragging(false)

			if (!isDragging) {
				const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

				const element = ev.target as SVGElement

				const target = element.closest('[data-node]') as SVGElement

				if (!target) return

				const box = getNodePosition(target, offset, zoomLevel)
				const boxOffset = getTargetOffset(target)

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
				const id = (target.getAttribute('data-node-id') ?? '').replace(/^X/gim, '')
				const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }
				const pos = getNodePosition(target, offset, zoomLevel)
				const isVisible = target.getAttribute('data-node-visible') === 'true'
				const initialPos = getTargetOffset(target)

				// Don't set position on nodes that aren't opened yet (need autoPosition first)
				if (!isVisible && initialPos.x === 0 && initialPos.y === 0) return

				target.setAttribute('data-pos', `${pos.x},${pos.y}`)

				dispatch(setPositionState({ id: id, x: pos.x, y: pos.y, isVisible: isVisible }))
			})

			setTargetList(undefined)

			ref.current?.removeEventListener('mousemove', handleMove)
			ref.current?.removeEventListener('mouseup', handleMoveEnd)
		},
		[dispatch, handleMove, isDragging, pageOffset, panPosition, targetList, zoomLevel]
	)

	useLayoutEffect(() => {
		if (!startDragging) return
		ref.current = document.querySelector<HTMLDivElement>('[data-container]')
		ref.current?.addEventListener('mousemove', handleMove)
		ref.current?.addEventListener('mouseup', handleMoveEnd)

		return () => {
			ref.current?.removeEventListener('mousemove', handleMove)
			ref.current?.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [startDragging, handleMove, handleMoveEnd])

	return (
		<Container data-drag onMouseDown={handleMouseDown}>
			{children}
		</Container>
	)
}

const Container = styled.div`
	position: relative;
	overflow: visible;
	width: 100%;
	height: 100%;
`

export default Drag
