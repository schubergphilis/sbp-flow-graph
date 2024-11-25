import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition, getParentNodePosition } from '../helpers/AutoPosition'
import { useDidMountEffect } from '../hooks/UseDidMountEffect'
import LineModel from '../models/LineModel'
import PositionModel from '../models/PositionModel'
import Line from './Line'
import { GlobalState } from './Provider'

const LineBox = () => {
	const { state } = useContext(GlobalState)

	const [lines, setLines] = useState<LineModel[]>([])
	const [draggedLines, setDraggedLines] = useState<LineModel[]>([])
	const [offset, setOffset] = useState<PositionModel>({ x: 0, y: 0 })

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

	const getLines = useCallback((): void => {
		const nodes = [...(document.querySelectorAll<SVGElement>('[data-node]') ?? [])]
		const lines = getLineData(nodes)
		setLines(lines)
	}, [getLineData])

	const updateLines = useCallback(() => {
		console.log('-----Interval', draggedLines.length)
		const allBoxes = [...new Set(draggedLines.flatMap(({ id, parentId }) => [id, parentId]))]

		const query = allBoxes.map((id) => `[data-node-id=${id}]`).join(', ')
		const boxList = [...(document.querySelectorAll<SVGElement>(query) ?? [])]

		const list = getLineData(boxList)

		const items = lines.map((line) => ({ ...line, ...list.find(({ id }) => id === line.id) }))

		setLines(items)
	}, [draggedLines, getLineData, lines])

	useDidMountEffect(() => {
		getPanOffset()

		const items = lines.filter(({ id, parentId }) => id === state.dragElement || parentId === state.dragElement)

		setDraggedLines(items)
	}, [state.dragElement])

	useEffect(() => {
		timerRef.current = setTimeout(getLines, 2)
	}, [getLines])

	useEffect(() => {
		if (draggedLines.length > 0) {
			updateRef.current = setInterval(updateLines, 20)
		}
		return () => clearInterval(updateRef.current)
	}, [draggedLines, updateLines])

	return (
		<Container>
			{lines.map((data, index) => (
				<Line key={index} data={data} />
			))}
		</Container>
	)
}

const Container = styled.g``

export default LineBox
