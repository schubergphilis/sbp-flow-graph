import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import {
	getDataListState,
	getGraphIdState,
	getPanPositionState,
	getZoomLevelState,
	setPageOffsetState,
	setPanPositionState,
	setUpdateState
} from '@store/SettingsSlice'
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
	refresh?: number
	children: JSX.Element
}

const Pan = memo(({ children, refresh }: Props) => {
	const dispatch = useAppDispatch()
	const graphId = useAppSelector<string>(getGraphIdState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const dataList = useAppSelector<ProcessModel[] | undefined>(getDataListState)

	const [isPanning, setIsPanning] = useState<boolean>(false)

	const elementGraphRef = useRef<HTMLDivElement>(null)
	const elementPanRef = useRef<HTMLDivElement>(null)
	const offsetBoxRef = useRef<PositionModel>({ x: 0, y: 0 })
	const offsetMouseRef = useRef<PositionModel>({ x: 0, y: 0 })
	const positionRef = useRef<PositionModel>({ x: panPosition?.x ?? 0, y: panPosition?.y ?? 0 })
	const rafRef = useRef<number | null>(null)

	const updatePosition = useCallback(() => {
		if (!elementPanRef.current) return
		// Use translate3d for hardware acceleration
		elementPanRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) scale(${zoomLevel})`
	}, [zoomLevel])

	const handleMouseDown = useCallback((ev: MouseEvent) => {
		ev.preventDefault()

		if (ev.button !== 0) return

		const target = ev.target as HTMLElement

		if (!target.hasAttribute('data-container')) return

		setIsPanning(true)

		const offset = elementPanRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
		offsetBoxRef.current = offset
		offsetMouseRef.current = { x: ev.clientX, y: ev.clientY }

		// Add will-change for optimization
		if (!elementPanRef.current) return
		elementPanRef.current.style.willChange = 'transform'
	}, [])

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			if (!(ev.buttons & 1)) {
				// Left button was released, stop dragging
				handleMoveEnd()
				return
			}

			const target = ev.target as HTMLDivElement

			if (!target.hasAttribute('data-container')) return
			if (rafRef.current) cancelAnimationFrame(rafRef.current)

			rafRef.current = requestAnimationFrame(() => {
				const posX = Math.round(offsetBoxRef.current.x + (ev.offsetX - offsetMouseRef.current.x))
				const posY = Math.round(offsetBoxRef.current.y + (ev.offsetY - offsetMouseRef.current.y))

				positionRef.current = {
					x: posX,
					y: posY
				}

				if (!elementPanRef.current) return

				updatePosition()
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[updatePosition]
	)

	const handleMoveEnd = useCallback(() => {
		setIsPanning(false)

		// Remove will-change to save memory
		if (!elementPanRef.current) return
		elementPanRef.current.style.willChange = 'auto'

		elementGraphRef.current?.removeEventListener('mousemove', handleMove)
		elementGraphRef.current?.removeEventListener('mouseup', handleMoveEnd)

		dispatch(setPanPositionState(positionRef.current))
	}, [dispatch, handleMove])

	useLayoutEffect(() => {
		const container = elementGraphRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
		dispatch(setPageOffsetState({ x: Math.round(container.x), y: Math.round(container.y) }))
	}, [dispatch, refresh, dataList])

	useLayoutEffect(() => {
		if (!refresh) return
		dispatch(setUpdateState())
	}, [dispatch, refresh])

	useLayoutEffect(() => {
		updatePosition()

		elementGraphRef.current = document.getElementById(graphId) as HTMLDivElement

		elementGraphRef.current?.addEventListener('mousedown', handleMouseDown)

		return () => {
			elementGraphRef.current?.removeEventListener('mousedown', handleMouseDown)
		}
	}, [graphId, handleMouseDown, updatePosition])

	useLayoutEffect(() => {
		if (!isPanning) return

		elementGraphRef.current?.addEventListener('mousemove', handleMove)
		elementGraphRef.current?.addEventListener('mouseup', handleMoveEnd)

		return () => {
			elementGraphRef.current?.removeEventListener('mousemove', handleMove)
			elementGraphRef.current?.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [isPanning, handleMove, handleMoveEnd])

	return (
		<Container data-pan ref={elementPanRef}>
			{children}
		</Container>
	)
})

const Container = styled.div`
	transform-origin: 0 0;
	height: 100%;
	width: 100%;

	/* Enable GPU acceleration */
	transform: translateZ(0);

	/* Optimize compositing */
	isolation: isolate;
`

export default Pan
