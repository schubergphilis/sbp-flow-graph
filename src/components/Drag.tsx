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

	const selectedElement = undefined

	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [targetList, setTargetList] = useState<SVGElement[]>()
	const [startDragging, setStartDragging] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)

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
			} else {
				targets = [target]
			}

			setTargetList(targets)

			setMouseOffset({ x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY })

			targets.forEach((target) => {
				const node = target.querySelector<SVGElement>('circle, rect') ?? null
				const pos = getNodePosition(node)
				target.setAttribute('data-pos', `${pos.x},${pos.y}`)
			})

			setStartDragging(true)

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

			const offset = panPosition ?? { x: 0, y: 0 }

			const threshold = 10
			const thresholdX = Math.abs(ev.clientX - mouseOffset.x - offset.x) > threshold
			const thresholdY = Math.abs(ev.clientY - mouseOffset.y - offset.y) > threshold

			if (!isDragging && (thresholdX || thresholdY)) {
				const element = ev.target as SVGElement

				const target = element.closest('g[data-node]') as SVGElement
				const id = target?.getAttribute('data-node-id') ?? ''
				dispatch(setDragElementState(id))
				setIsDragging(true)

				console.log(`--- Drag ${(targetList?.length ?? 0) > 1 ? 'Cluster ' : ''}Start ---`, id)
			}

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
		[isDragging, panPosition, targetList, dispatch, zoomLevel, getTargetPos, mouseOffset.x, mouseOffset.y]
	)

	const handleMoveEnd = useCallback(() => {
		dispatch(setDragElementState(undefined))
		dispatch(setClusterDragState(false))

		setStartDragging(false)

		if (!isDragging) return

		setIsDragging(false)

		targetList?.forEach((target) => {
			const node = target.querySelector<SVGElement>('circle, rect') ?? null
			const id = (target?.getAttribute('data-node-id') ?? '').replace(/^X/gim, '')
			const pos = getNodePosition(node, panPosition, zoomLevel)
			target.setAttribute('data-pos', `${pos.x},${pos.y}`)
			dispatch(setPositionState({ id: id, x: pos.x, y: pos.y, isVisible: true }))
		})

		setTargetList(undefined)

		window.removeEventListener('mousemove', handleMove)
		window.removeEventListener('mouseup', handleMoveEnd)
	}, [dispatch, handleMove, isDragging, panPosition, targetList, zoomLevel])

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
