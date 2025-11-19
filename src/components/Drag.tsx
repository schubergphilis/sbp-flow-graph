import { getNodePosition, getParentNode, getParentNodePosition, getTargetOffset } from '@helpers/AutoPosition'
import { calculateLinePath } from '@helpers/Helpers'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import LineModel from '@models/LineModel'
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

	const [startDragging, setStartDragging] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [targetId, setTargetId] = useState<string>()
	const [isFocused, setIsFocused] = useState<boolean>(false)

	const ref = useRef<HTMLDivElement>(null)
	const targetRef = useRef<SVGGElement | null>(null)
	const targetListRef = useRef<SVGGElement[] | null>(null)
	const lineListRef = useRef<SVGPathElement[] | null>(null)
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

			setIsFocused(ev.metaKey)

			if (ev.metaKey) {
				targets = [target]
			} else {
				targets = Array.from(
					document
						.getElementById(graphId)
						?.querySelectorAll<SVGGElement>(`[data-node-parent=${id}]:not([data-node-children-visible]),#${id}`) ?? []
				)
			}

			lineListRef.current = Array.from(
				document
					.getElementById(graphId)
					?.querySelectorAll<SVGPathElement>(`[data-line-id=${id}],[data-line-parent=${id}]`) ?? []
			)

			targetListRef.current = targets

			mouseOffsetRef.current = { x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY }

			setStartDragging(true)
			setTargetId(cleanId)
			dispatch(setClusterDragState(!ev.metaKey))
		},
		[dispatch, graphId]
	)

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			if (!(ev.buttons & 1)) {
				// Left button was released, stop dragging
				handleMoveEnd(ev)
				return
			}

			if (!targetListRef.current) return

			if (rafRef.current) cancelAnimationFrame(rafRef.current)

			const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

			if (!dragElement) dispatch(setDragElementState(targetId))

			rafRef.current = requestAnimationFrame(() => {
				const mouse: PositionModel = {
					x: Math.round((ev.clientX - offset.x) / zoomLevel - mouseOffsetRef.current.x),
					y: Math.round((ev.clientY - offset.y) / zoomLevel - mouseOffsetRef.current.y)
				}

				if (!targetListRef.current) return

				setIsDragging(true)

				for (let i = 0; i < targetListRef.current.length; i++) {
					const target = targetListRef.current[i]
					const boxOffset = getTargetOffset(target)

					const pos: PositionModel = {
						x: Math.round(boxOffset.x + mouse.x),
						y: Math.round(boxOffset.y + mouse.y)
					}

					target.setAttribute('transform', `translate(${pos.x}, ${pos.y})`)
				}

				// update lines
				lineListRef.current?.forEach((item) => {
					const id = item.getAttribute('data-line-id') ?? ''
					const node = document.getElementById(id) as SVGGElement | null

					if (!node || node.hasAttribute('data-node-root')) return

					const element = node.querySelector('[data-node-status]') as SVGElement

					const data: LineModel = {
						start: getNodePosition(element, offset, zoomLevel),
						end: getParentNodePosition(node, offset, zoomLevel),
						info: node.getAttribute('data-node-info') as string,
						startSize: Number(node.getAttribute('data-node-size') ?? 0),
						endSize: Number(getParentNode(node)?.getAttribute('data-node-size') ?? 0)
					}

					const { pathData, midX, midY, textLength } = calculateLinePath(data)
					item.setAttribute('d', pathData)
					item.nextElementSibling?.setAttribute('transform', `translate(${midX - textLength / 2}, ${midY})`)
				})
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[dispatch, dragElement, pageOffset.x, pageOffset.y, panPosition?.x, panPosition?.y, targetId, zoomLevel]
	)

	const handleMoveEnd = useCallback(
		(ev: MouseEvent) => {
			dispatch(setDragElementState(undefined))
			dispatch(setClusterDragState(false))
			setStartDragging(false)

			const cleanId = targetId ?? ''

			setTargetId(undefined)

			targetRef.current = null

			if (!isDragging) return

			setIsDragging(false)

			if (!targetListRef.current) return

			const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

			const mouse: PositionModel = {
				x: Math.round((ev.clientX - offset.x) / zoomLevel - mouseOffsetRef.current.x),
				y: Math.round((ev.clientY - offset.y) / zoomLevel - mouseOffsetRef.current.y)
			}

			// Save position of all affected nodes (also the invisible nodes)
			dispatch(setPositionState({ id: cleanId, x: mouse.x, y: mouse.y, isFocused: isFocused }))

			for (let i = 0; i < targetListRef.current.length; i++) {
				const target = targetListRef.current[i]

				const element = target.querySelector('rect') as SVGElement

				const pos = getNodePosition(element, offset, zoomLevel)

				target.setAttribute('data-pos', `${pos.x},${pos.y}`)
			}

			targetListRef.current = null
			lineListRef.current = null

			setIsFocused(false)

			ref.current?.removeEventListener('mousemove', handleMove)
			ref.current?.removeEventListener('mouseup', handleMoveEnd)
		},
		[
			dispatch,
			handleMove,
			isDragging,
			pageOffset.x,
			pageOffset.y,
			panPosition?.x,
			panPosition?.y,
			zoomLevel,
			targetId,
			isFocused
		]
	)

	useLayoutEffect(() => {
		if (!startDragging) return

		ref.current = document.getElementById(graphId) as HTMLDivElement
		ref.current?.addEventListener('mousemove', handleMove)
		ref.current?.addEventListener('mouseup', handleMoveEnd)

		return () => {
			ref.current?.removeEventListener('mousemove', handleMove)
			ref.current?.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [startDragging, handleMove, handleMoveEnd, graphId])

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
