import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PositionModel from '../models/PositionModel'

interface Props {
	children: JSX.Element
}

const Pan = ({ children }: Props) => {
	//const position =  useAppSelector<BoxPositionModel | undefined>((state) => getPositionState(state, 'root'))
	const selectedElement = undefined //useAppSelector<string>(getSelectedElementState)

	const [isPanning, setIsPanning] = useState<boolean>(false)
	const [pageOffset, setPageOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [boxOffset, setBoxOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [mouseOffset, setMouseOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [pos, _setPos] = useState<PositionModel>({ x: 0, y: 0 })

	const panRef = useRef<HTMLDivElement>(null)
	const posRef = useRef<PositionModel>({ x: 0, y: 0 })

	const setPos = useCallback((data: PositionModel) => {
		posRef.current = data
		_setPos(data)
	}, [])

	const handleMouseDown = useCallback((ev: MouseEvent) => {
		ev.stopPropagation()
		ev.preventDefault()

		if (ev.button !== 0) return

		setIsPanning(true)

		const offset = panRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 }

		setBoxOffset({ x: offset.x, y: offset.y })
		setMouseOffset({ x: ev.offsetX, y: ev.offsetY })
	}, [])

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			// panRef.current?.style.removeProperty('transform-origin')

			const target = ev.target as HTMLDivElement

			if (!target.hasAttribute('data-container')) return

			setPos({
				y: boxOffset.y + (ev.offsetY - mouseOffset.y) - pageOffset.y,
				x: boxOffset.x + (ev.offsetX - mouseOffset.x) - pageOffset.x
			})
		},
		[boxOffset, pageOffset, mouseOffset, setPos]
	)

	const handleMoveEnd = useCallback(() => {
		setIsPanning(false)

		panRef.current?.removeEventListener('mousemove', handleMove)
		panRef.current?.removeEventListener('mouseup', handleMoveEnd)

		// Dont save position when dragging when you are dragging when a bubble is selected
		if (selectedElement !== '' && selectedElement !== undefined) return

		/*
        TODO: Save position in LocalStorage
		dispatch(
			setPositionState({
				position: posRef.current,
				id: 'root'
			})
		)*/
	}, [handleMove, selectedElement])

	useLayoutEffect(() => {
		const container = document.querySelector<HTMLDivElement>('[data-container]')
		setPageOffset({ y: container?.offsetTop ?? 0, x: container?.offsetLeft ?? 0 })
	}, [])

	useLayoutEffect(() => {
		document.addEventListener('mousedown', handleMouseDown)
		return () => {
			document.removeEventListener('mousedown', handleMouseDown)
		}
	}, [handleMouseDown])

	useLayoutEffect(() => {
		if (!isPanning) return
		document.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseup', handleMoveEnd)

		return () => {
			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [isPanning, handleMove, handleMoveEnd])

	return (
		<Container
			data-pan
			ref={panRef}
			style={{
				transform: `translate(${pos.x}px, ${pos.y}px)`
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
