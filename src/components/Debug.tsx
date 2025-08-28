import { getNodePosition } from '@helpers/AutoPosition'
import { elementGroupCenter } from '@helpers/Helpers'
import { useAppSelector } from '@hooks/ReduxStore'
import NodeModel from '@models/NodeModel'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import {
	getDragElementState,
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getPositionListState,
	getZoomLevelState,
	isClusterDragState
} from '@store/SettingsSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const Debug = () => {
	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const isClusterDrag = useAppSelector<boolean>(isClusterDragState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)
	const graphId = useAppSelector<string>(getGraphIdState)
	const positionList = useAppSelector<NodeModel[] | undefined>(getPositionListState)

	const [testNodes, setTestNodes] = useState<JSX.Element[]>([])
	const [selectedNodes, setSelectedNodes] = useState<JSX.Element[]>()
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [center, setCenter] = useState<OffsetModel | undefined>()

	// const timerRef = useRef<NodeJS.Timeout>(undefined)
	const updateRef = useRef<NodeJS.Timeout>(undefined)

	const testData = useCallback(
		(nodes: SVGElement[]): JSX.Element[] => {
			return nodes.map((node, index) => {
				const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

				const pos = getNodePosition(node, offset, zoomLevel)

				return (
					<g key={`debug_${node.id}_${index}`}>
						<text x={pos.x} y={pos.y - pos.height / 1.75} textAnchor="middle" dominantBaseline="central">
							{pos.x}x{pos.y} | {pos.width}x{pos.height}
						</text>
						<rect
							width={pos.width}
							height={pos.height}
							x={pos.x - pos.width / 2}
							y={pos.y - pos.height / 2}
							stroke={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
							fill="transparent"
						/>
						<path
							d={`M${pos.x - pos.width / 2} ${pos.y - pos.height / 2} L${pos.x + pos.width / 2} ${pos.y + pos.height / 2}`}
							stroke={`hsla(${Math.random() * 360}, 70%, 50%, 90%)`}
							strokeWidth={1}
							strokeDasharray={4}
							fill="none"
						/>
						<path
							d={`M${pos.x - pos.width / 2} ${pos.y} L${pos.x + pos.width / 2} ${pos.y}`}
							stroke={`hsl(${Math.random() * 360}, 0%, 0%)`}
							strokeWidth={1}
							strokeDasharray={4}
							fill="none"
						/>
						<path
							d={`M${pos.x} ${pos.y - pos.height / 2} L${pos.x} ${pos.y + pos.height / 2}`}
							stroke={`hsl(${Math.random() * 360}, 0%, 0%)`}
							strokeWidth={1}
							strokeDasharray={4}
							fill="none"
						/>
					</g>
				)
			})
		},
		[panPosition, zoomLevel, pageOffset]
	)

	const updateSelectedLines = useCallback(() => {
		// console.log('-----Interval')

		const regex = isClusterDrag ? '[data-node]' : `#X${graphId}_${dragElement}`

		const nodes = [...(document.getElementById(graphId)?.querySelectorAll<SVGElement>(regex) ?? [])]

		if (nodes.length === 0) return

		const selected = testData(nodes)

		setSelectedNodes(selected)
	}, [dragElement, isClusterDrag, testData, graphId])

	const updateAllLines = useCallback(() => {
		const regex = isClusterDrag ? '[dummy-nothing]' : `[data-node][data-node-visible]:not(#X${graphId}_${dragElement})`

		const nodes = [...(document.getElementById(graphId)?.querySelectorAll<SVGElement>(regex) ?? [])]

		const allNodes = testData(nodes)

		setTestNodes(allNodes)
	}, [isClusterDrag, dragElement, testData, graphId])

	const calculateCenter = useCallback(() => {
		const group = Array.from(
			document.getElementById(graphId)?.querySelectorAll<SVGElement>('[data-node-group] [data-node-visible]') ?? []
		)

		const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }
		const center = elementGroupCenter(group, offset, zoomLevel)

		setCenter(center)
	}, [graphId, panPosition, pageOffset, zoomLevel])

	useEffect(() => {
		if (testNodes.length === 0) return
		setTimeout(calculateCenter, 20)
	}, [calculateCenter, testNodes])

	useEffect(() => {
		if (!positionList) return
		updateAllLines()
	}, [positionList, updateAllLines])

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
		setSelectedNodes(undefined)
	}, [isDragging, updateAllLines])

	return (
		<Container data-debug-group>
			{selectedNodes}
			{testNodes}
			{center && (
				<g>
					<circle
						r="10"
						fill="blue"
						fillOpacity={0.5}
						cx={center.x + center.width / 2}
						cy={center.y + center.height / 2}
					/>
					<rect width={center.width} height={center.height} x={center.x} y={center.y} stroke="blue" fill="none" />
				</g>
			)}
		</Container>
	)
}

const Container = styled.g`
	user-select: none;
	pointer-events: none;
	& * {
		user-select: none;
		pointer-events: none;
	}
`

export default Debug
