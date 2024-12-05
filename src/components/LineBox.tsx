import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition, getParentNode, getParentNodePosition } from '../helpers/AutoPosition'
import { useAppSelector } from '../hooks/ReduxStore'
import LineModel from '../models/LineModel'
import PositionModel from '../models/PositionModel'
import { getDragElementState, getPanPositionState, getZoomLevelState, isClusterDragState } from '../store/SettingsSlice'
import Line from './Line'

const LineBox = () => {
	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const isClusterDrag = useAppSelector<boolean>(isClusterDragState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)

	const [lines, setLines] = useState<LineModel[]>([])
	const [draggedLines, setDraggedLines] = useState<LineModel[]>([])

	const [isDragging, setIsDragging] = useState<boolean>(false)

	const timerRef = useRef<NodeJS.Timeout>()
	const updateRef = useRef<NodeJS.Timeout>()

	const getLineData = useCallback(
		(nodes: SVGElement[]): LineModel[] => {
			return nodes
				.filter((node) => node.getAttribute('data-node-root') !== 'true')
				.map<LineModel>((node) => {
					const element = node.querySelector('circle, rect') as SVGElement
					return {
						start: getNodePosition(element, panPosition, zoomLevel),
						end: getParentNodePosition(node, panPosition, zoomLevel),
						id: node.getAttribute('data-node-id') as string,
						parentId: node.getAttribute('data-node-parent') as string,
						text: `${node.getAttribute('data-node-id') as string}`,
						startSize: Number(node.getAttribute('data-node-size') ?? 0),
						endSize: Number(getParentNode(node)?.getAttribute('data-node-size') ?? 0)
					}
				})
		},
		[panPosition, zoomLevel]
	)

	const handleLines = useMemo((): JSX.Element[] => {
		return lines.map((data, index) => <Line key={`line_${index}`} data={data} />)
	}, [lines])

	const handleDraggedLines = useMemo((): JSX.Element[] => {
		return draggedLines.map((data, index) => <Line key={`line_dragged_${index}`} data={data} />)
	}, [draggedLines])

	const updateSelectedLines = useCallback(() => {
		// console.log('-----Interval')

		const regex = isClusterDrag ? '[data-node]' : `[data-node-id=${dragElement}],[data-node-parent=${dragElement}]`

		const selectedNodes = [...(document.querySelectorAll<SVGElement>(regex) ?? [])]

		if (!selectedNodes) return

		const selected = getLineData(selectedNodes)

		setDraggedLines(selected)
	}, [isClusterDrag, dragElement, getLineData])

	const updateAllLines = useCallback(() => {
		const regex = isClusterDrag
			? '[dummy-nothing]'
			: `[data-node]:not([data-node-id=${dragElement}],[data-node-parent=${dragElement}])`

		const nodes = [...(document.querySelectorAll<SVGElement>(regex) ?? [])]

		const allNodes = getLineData(nodes)

		setLines(allNodes)
	}, [isClusterDrag, dragElement, getLineData])

	useEffect(() => {
		timerRef.current = setTimeout(updateAllLines, 2)
	}, [updateAllLines, zoomLevel])

	useEffect(() => {
		setIsDragging(dragElement !== undefined)
	}, [dragElement])

	useEffect(() => {
		if (isDragging) {
			updateAllLines()
			updateRef.current = setInterval(updateSelectedLines, 20)
		}
		return () => clearInterval(updateRef.current)
	}, [isDragging, updateAllLines, updateSelectedLines])

	useEffect(() => {
		if (isDragging) return
		updateAllLines()
		setDraggedLines([])
	}, [isDragging, updateAllLines])

	return (
		<Container data-line-group>
			{handleLines}
			{handleDraggedLines}
		</Container>
	)
}

const Container = styled.g``

export default LineBox
