import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition, getParentNodePosition } from '../helpers/AutoPosition'
import LineModel from '../models/LineModel'
import PositionModel from '../models/PositionModel'
import Line from './Line'
import { GlobalState } from './Provider'

const LineBox = () => {
	const { state } = useContext(GlobalState)

	const [lines, setLines] = useState<LineModel[]>([])
	const [draggedLines, setDraggedLines] = useState<LineModel[]>([])
	const [offset, setOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState<boolean>(false)

	const timerRef = useRef<NodeJS.Timeout>()
	const updateRef = useRef<NodeJS.Timeout>()

	const getPanOffset = useCallback(() => {
		const offsetTarget = document?.querySelector<HTMLDivElement>('[data-pan]')

		const offset = offsetTarget?.getBoundingClientRect() ?? { x: 0, y: 0 }
		setOffset(offset)
	}, [])

	const getLineData = useCallback(
		(nodes: SVGElement[]): LineModel[] => {
			return nodes
				.filter((node) => node.getAttribute('data-node-root') !== 'true')
				.map<LineModel>((node) => ({
					start: getNodePosition(node, offset),
					end: getParentNodePosition(node, offset),
					id: node.getAttribute('data-node-id') as string,
					parentId: node.getAttribute('data-node-parent') as string,
					text: `${node.getAttribute('data-node-id') as string}`
				}))
		},
		[offset]
	)

	const handleLines = useMemo((): JSX.Element[] => {
		return lines.map((data, index) => <Line key={`line_${index}`} data={data} />)
	}, [lines])

	const handleDraggedLines = useMemo((): JSX.Element[] => {
		return draggedLines.map((data, index) => <Line key={`line_dragged_${index}`} data={data} />)
	}, [draggedLines])

	const updateSelectedLines = useCallback(() => {
		// console.log('-----Interval')
		const selectedNodes = [
			...(document.querySelectorAll<SVGElement>(
				`[data-node-id=${state.dragElement}],[data-node-parent=${state.dragElement}]`
			) ?? [])
		]

		if (!selectedNodes) return
		const selected = getLineData(selectedNodes)
		setDraggedLines(selected)
	}, [state.dragElement, getLineData])

	const updateAllLines = useCallback(() => {
		const nodes = [
			...(document.querySelectorAll<SVGElement>(
				`[data-node]:not([data-node-id=${state.dragElement}],[data-node-parent=${state.dragElement}])`
			) ?? [])
		]

		const allNodes = getLineData(nodes)

		setLines(allNodes)
	}, [state.dragElement, getLineData])

	useEffect(() => {
		timerRef.current = setTimeout(updateAllLines, 2)
	}, [updateAllLines])

	useEffect(() => {
		getPanOffset()
		setIsDragging(state.dragElement !== undefined)
	}, [getPanOffset, state.dragElement])

	useEffect(() => {
		if (isDragging) {
			updateAllLines()
			updateRef.current = setInterval(updateSelectedLines, 20)
		}
		return () => clearInterval(updateRef.current)
	}, [isDragging, updateAllLines, getPanOffset, updateSelectedLines])

	useEffect(() => {
		if (isDragging) return
		updateAllLines()
		setDraggedLines([])
	}, [isDragging, updateAllLines])

	return (
		<Container>
			{handleLines}
			{handleDraggedLines}
		</Container>
	)
}

const Container = styled.g``

export default LineBox
