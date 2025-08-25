import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import PositionModel from '@models/PositionModel'
import {
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getZoomLevelState,
	setPageOffsetState,
	setPanPositionState
} from '@store/SettingsSlice'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
	refresh?: number
	children: JSX.Element
}

const Pan = ({ children, refresh }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)
	const graphId = useAppSelector<string>(getGraphIdState)

	const [isPanning, setIsPanning] = useState<boolean>(false)
	const [boxOffset, setBoxOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [pos, _setPos] = useState<PositionModel>({ x: 0, y: 0 })

	const ref = useRef<HTMLDivElement>(null)
	const panRef = useRef<HTMLDivElement>(null)
	const posRef = useRef<PositionModel>({ x: 0, y: 0 })

	const setPos = useCallback((data: PositionModel) => {
		posRef.current = data
		_setPos(data)
	}, [])

	const handleMouseDown = useCallback((ev: MouseEvent) => {
		// ev.stopPropagation()
		ev.preventDefault()

		if (ev.button !== 0) return

		const target = ev.target as HTMLElement

		if (!target.hasAttribute('data-container')) return

		setIsPanning(true)

		const offset = panRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 }

		setBoxOffset({ x: offset.x, y: offset.y })
		setMouseOffset({ x: ev.offsetX, y: ev.offsetY })
	}, [])

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			const target = ev.target as HTMLDivElement

			if (!target.hasAttribute('data-container')) return

			const posX = boxOffset.x + (ev.offsetX - mouseOffset.x) - pageOffset.x
			const posY = boxOffset.y + (ev.offsetY - mouseOffset.y) - pageOffset.y

			setPos({
				x: posX,
				y: posY
			})
		},
		[boxOffset, pageOffset, mouseOffset, setPos]
	)

	const handleMoveEnd = useCallback(() => {
		setIsPanning(false)

		panRef.current?.removeEventListener('mousemove', handleMove)
		panRef.current?.removeEventListener('mouseup', handleMoveEnd)

		dispatch(setPanPositionState(pos))
	}, [dispatch, handleMove, pos])

	useLayoutEffect(() => {
		if (!panPosition) return
		setPos(panPosition)
	}, [setPos, panPosition])

	useLayoutEffect(() => {
		const container = panRef.current?.closest<HTMLDivElement>('[data-container]')?.getBoundingClientRect()

		dispatch(setPageOffsetState({ x: container?.x ?? 0, y: container?.y ?? 0 }))
	}, [dispatch, refresh])

	useLayoutEffect(() => {
		const node = document.getElementById(graphId) as HTMLDivElement

		node?.addEventListener('mousedown', handleMouseDown)

		return () => {
			node?.removeEventListener('mousedown', handleMouseDown)
		}
	}, [handleMouseDown, graphId])

	useLayoutEffect(() => {
		if (!isPanning) return
		ref.current = document.getElementById(graphId) as HTMLDivElement
		ref.current?.addEventListener('mousemove', handleMove)
		ref.current?.addEventListener('mouseup', handleMoveEnd)

		return () => {
			ref.current?.removeEventListener('mousemove', handleMove)
			ref.current?.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [isPanning, handleMove, handleMoveEnd, graphId])

	return (
		<Container
			data-pan
			ref={panRef}
			style={{
				transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoomLevel})`
			}}>
			{children}
		</Container>
	)
}

const Container = styled.div`
	transform-origin: 0 0;
	height: 100%;
	width: 100%;
`

export default Pan
