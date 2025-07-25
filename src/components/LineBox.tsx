import { StatusType } from '@datatypes/StatusType'
import { getNodePosition, getParentNode, getParentNodePosition } from '@helpers/AutoPosition'
import { useAppSelector } from '@hooks/ReduxStore'
import LineModel from '@models/LineModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import {
	getDataListState,
	getDragElementState,
	getPagetOffsetState,
	getPanPositionState,
	getUpdateState,
	getZoomLevelState,
	isClusterDragState
} from '@store/SettingsSlice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import Line from './Line'

const LineBox = () => {
	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const isClusterDrag = useAppSelector<boolean>(isClusterDragState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPagetOffsetState)
	const openDataList = useAppSelector<ProcessModel[] | undefined>(getDataListState)
	const update = useAppSelector<number>(getUpdateState)

	const [lines, setLines] = useState<LineModel[]>([])
	const [draggedLines, setDraggedLines] = useState<LineModel[]>([])

	const [isDragging, setIsDragging] = useState<boolean>(false)

	const timerRef = useRef<NodeJS.Timeout>(undefined)
	const updateRef = useRef<NodeJS.Timeout>(undefined)

	const getLineData = useCallback(
		(nodes: SVGElement[]): LineModel[] => {
			const offset: PositionModel = {
				x: (panPosition?.x ?? 0) + pageOffset.x,
				y: (panPosition?.y ?? 0) + pageOffset.y
			}

			return nodes
				.filter(
					(node) => node.getAttribute('data-node-root') !== 'true' && node.getAttribute('data-node-visible') !== 'false'
				)
				.map<LineModel>((node) => {
					const element = node.querySelector('circle, rect, polygon') as SVGElement

					return {
						start: getNodePosition(element, offset, zoomLevel),
						end: getParentNodePosition(node, offset, zoomLevel),
						id: node.getAttribute('data-node-id') as string,
						parentId: node.getAttribute('data-node-parent') as string,
						info: node.getAttribute('data-node-info') as string,
						tooltip: node.getAttribute('data-node-info-tooltip') as string,
						startSize: Number(node.getAttribute('data-node-size') ?? 0),
						endSize: Number(getParentNode(node)?.getAttribute('data-node-size') ?? 0),
						status: `${element?.getAttribute('data-node-status') as StatusType}`
					}
				})
		},
		[panPosition, zoomLevel, pageOffset]
	)

	const handleLines = useMemo((): JSX.Element[] => {
		return lines.map((data) => <Line key={`line_${data.id}`} data={data} />)
	}, [lines])

	const handleDraggedLines = useMemo((): JSX.Element[] => {
		return draggedLines.map((data) => <Line key={`line_dragged_${data.id}`} data={data} />)
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
			: `[data-node]:not([data-node-id=${dragElement}],[data-node-parent=${dragElement}],[data-node-visible=false])`

		const nodes = [...(document.querySelectorAll<SVGElement>(regex) ?? [])]

		const allNodes = getLineData(nodes)

		setLines(allNodes)
	}, [isClusterDrag, dragElement, getLineData])

	useEffect(() => {
		timerRef.current = setTimeout(updateAllLines, 20)
	}, [updateAllLines, zoomLevel, update, openDataList])

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
