import { useCallback, useRef, useState } from 'react'
// import { cleanId } from 'src/functions/Helpers'
// import { useAppDispatch, useAppSelector } from 'src/hooks/ReduxStore'
// import Position from 'src/models/internal/Position'
// import { getDragElementState, getZoomLevelState, setDragClusterState, setPositionState } from 'src/store/PositionSlice'
import styled from 'styled-components'
import PositionModel from '../models/PositionModel'

interface Props {
	children: JSX.Element
}

const FlowDrag = ({ children }: Props) => {
	//const dispatch = useAppDispatch()

	//const dragElement = useAppSelector<string | undefined>(getDragElementState)
	//const zoomLevel = useAppSelector<number>(getZoomLevelState)

	const [id, setId] = useState<string>()

	const [list, _setList] = useState<HTMLDivElement[]>([])
	const [offset, _setOffset] = useState<PositionModel>({ x: 0, y: 0 })

	const listRef = useRef<HTMLDivElement[]>([])
	const offsetRef = useRef<PositionModel>(offset)

	const setList = (data: HTMLDivElement[]) => {
		listRef.current = data
		_setList(data)
	}

	const setOffset = (data: PositionModel) => {
		offsetRef.current = data
		_setOffset(data)
	}
	/*
	useLayoutEffect(() => {
		if (!id) return

		bundleElements()
	}, [id])

	useLayoutEffect(() => {
		if (!id) return

		document.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseup', handleMoveEnd)

		return () => {
			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseup', handleMoveEnd)
		}
	}, [id])

	const bundleElements = useCallback(() => {
		const list = [
			...document.querySelectorAll<HTMLDivElement>(`[data-parent^=X${id}]`),
			...document.querySelectorAll<HTMLDivElement>(`[data-id^=X${id}]`)
		]

		setList(list)
	}, [id])

	const handleMoveEnd = useCallback(
		(ev: MouseEvent) => {
			setId(undefined)
			dispatch(setDragClusterState(''))

			listRef.current.forEach((item) => {
				const transform = item?.getAttribute('data-pos')?.split(',') ?? ['0', '0']
				const id = cleanId(item?.getAttribute('data-id') ?? '')

				dispatch(
					setPositionState({
						position: {
							x: Number(transform[0]) - (offsetRef.current.x - ev.clientX) / zoomLevel,
							y: Number(transform[1]) - (offsetRef.current.y - ev.clientY) / zoomLevel
						},
						id: id
					})
				)
			})

			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseup', handleMoveEnd)
		},
		[zoomLevel]
	)

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			ev.stopPropagation()
			ev.preventDefault()

			listRef.current.forEach((item) => {
				const transform = item?.getAttribute('data-pos')?.split(',') ?? ['0', '0']

				item.style.setProperty('left', `${Number(transform[0]) - (offsetRef.current.x - ev.clientX) / zoomLevel}px`)
				item.style.setProperty('top', `${Number(transform[1]) - (offsetRef.current.y - ev.clientY) / zoomLevel}px`)
			})
		},
		[list, zoomLevel]
	)
*/
	const handleMouseDown = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
		ev.stopPropagation()
		ev.preventDefault()

		if (ev.button !== 0) return

		const target = ev.target as HTMLDivElement

		if (!target.hasAttribute('data-nodebox')) return

		//const element = target.closest<HTMLDivElement>('[data-box]')
		//const id = cleanId(element?.getAttribute('data-id') ?? '')

		setId(id)
		setOffset({ x: ev.nativeEvent.clientX, y: ev.nativeEvent.clientY })
		//dispatch(setDragClusterState(id))
	}, [])

	return (
		<Container onMouseDown={handleMouseDown} className="flowbox">
			{children}
		</Container>
	)
}

const Container = styled.div`
	pointer-events: auto;
	border: 1px solid red;
`

export default FlowDrag
