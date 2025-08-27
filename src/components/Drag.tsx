import { getNodePosition, getTargetOffset } from '@helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import PositionModel from '@models/PositionModel'
import {
	getDragElementState,
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getZoomLevelState,
	setClusterDragState,
	setDragElementState,
	setPositionState
} from '@store/SettingsSlice'
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
	children: JSX.Element
}

const Drag = memo(({ children }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)
	const graphId = useAppSelector<string>(getGraphIdState)
	const dragElement = useAppSelector<string | undefined>(getDragElementState)

	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [targetId, setTargetId] = useState<string>()

	const ref = useRef<HTMLDivElement>(null)
	const targetRef = useRef<SVGGElement | null>(null)
	const targetListRef = useRef<SVGGElement[] | null>(null)
	const mouseOffsetRef = useRef<PositionModel>({ x: 0, y: 0 })
	const rafRef = useRef<number | null>(null)

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent<HTMLDivElement>) => {
			if (ev.button !== 0) return

			const target = (ev.target as SVGElement).closest('[data-node]') as SVGGElement | null

			if (!target || !target?.hasAttribute('data-node')) return

			targetRef.current = target

			ev.stopPropagation()
			ev.preventDefault()

			const id = target.id
			const cleanId = (id ?? '').match(/(?<=_)([\w-]+)/gim)?.[0] ?? ''

			let targets: SVGGElement[] = []

			if (ev.metaKey) {
				targets = [target]
			} else {
				targets = Array.from(
					document
						.getElementById(graphId)
						?.querySelectorAll<SVGGElement>(`[data-node-parent=${id}]:not([data-node-children-visible]),#${id}`) ?? []
				)
			}

			targetListRef.current = targets

			mouseOffsetRef.current = { x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY }

			setIsDragging(true)
			setTargetId(cleanId)
			dispatch(setClusterDragState(!ev.metaKey))
		},
		[dispatch, graphId]
	)

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			if (!targetListRef.current) return

			if (rafRef.current) cancelAnimationFrame(rafRef.current)

			const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

			if (!dragElement) dispatch(setDragElementState(targetId))

			rafRef.current = requestAnimationFrame(() => {
				const mouse: PositionModel = {
					x: (ev.clientX - offset.x) / zoomLevel - mouseOffsetRef.current.x,
					y: (ev.clientY - offset.y) / zoomLevel - mouseOffsetRef.current.y
				}

				if (!targetListRef.current) return

				for (let i = 0; i < targetListRef.current.length; i++) {
					const target = targetListRef.current[i]
					const box = getNodePosition(target, offset, zoomLevel)
					const boxOffset = getTargetOffset(target)

					// Don't set position on nodes that aren't opened yet (need autoPosition first)
					if (boxOffset.x === 0 && boxOffset.y === 0) continue

					const center: PositionModel = {
						x: boxOffset.x - box.width / 2,
						y: boxOffset.y - box.height / 2
					}

					const pos: PositionModel = {
						x: Math.round(center.x + mouse.x),
						y: Math.round(center.y + mouse.y)
					}

					target.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
				}
			})
		},
		[panPosition, pageOffset, dragElement, targetId, dispatch, zoomLevel]
	)

	const handleMoveEnd = useCallback(() => {
		dispatch(setDragElementState(undefined))
		dispatch(setClusterDragState(false))

		setIsDragging(false)
		setTargetId(undefined)
		targetRef.current = null

		if (!targetListRef.current) return

		for (let i = 0; i < targetListRef.current.length; i++) {
			const target = targetListRef.current[i]
			const id = (target.id ?? '').match(/(?<=_)([\w-]+)/gim)?.[0] ?? ''

			const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }
			const pos = getNodePosition(target, offset, zoomLevel)
			const isVisible = target.getAttribute('data-node-visible') === 'true'
			const initialPos = getTargetOffset(target)

			// Don't set position on nodes that aren't opened yet (need autoPosition first)
			if (!isVisible && initialPos.x === 0 && initialPos.y === 0) continue

			target.setAttribute('data-pos', `${pos.x},${pos.y}`)

			dispatch(setPositionState({ id: id, x: pos.x, y: pos.y, isVisible: isVisible }))
		}

		targetListRef.current = null

		ref.current?.removeEventListener('mousemove', handleMove)
		ref.current?.removeEventListener('mouseup', handleMoveEnd)
	}, [dispatch, handleMove, pageOffset, panPosition, zoomLevel])

	useLayoutEffect(() => {
		if (!isDragging) return

		ref.current = document.getElementById(graphId) as HTMLDivElement
		ref.current?.addEventListener('mousemove', handleMove)
		ref.current?.addEventListener('mouseup', handleMoveEnd)

		return () => {
			ref.current?.removeEventListener('mousemove', handleMove)
			ref.current?.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [isDragging, handleMove, handleMoveEnd, graphId])

	return (
		<Container data-drag onMouseDown={handleMouseDown}>
			{children}
		</Container>
	)
})

const Container = memo(styled.div`
	position: relative;
	overflow: visible;
	width: 100%;
	height: 100%;
`)

export default Drag
