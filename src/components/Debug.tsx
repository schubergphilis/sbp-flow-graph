import { getNodePosition } from '@helpers/AutoPosition'
import { useAppSelector } from '@hooks/ReduxStore'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import {
	getDragElementState,
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getZoomLevelState,
	isClusterDragState
} from '@store/SettingsSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
	isDebug?: boolean
}

const Debug = ({ isDebug = false }: Props) => {
	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const isClusterDrag = useAppSelector<boolean>(isClusterDragState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)
	const graphId = useAppSelector<string>(getGraphIdState)

	const [testNodes, setTestNodes] = useState<JSX.Element[]>([])
	const [selectedNodes, setSelectedNodes] = useState<JSX.Element[]>()
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [center, setCenter] = useState<OffsetModel | undefined>()

	const timerRef = useRef<NodeJS.Timeout>(undefined)
	const updateRef = useRef<NodeJS.Timeout>(undefined)

	const testData = useCallback(
		(nodes: SVGElement[]): JSX.Element[] => {
			return nodes.map((node, index) => {
				const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

				const pos = getNodePosition(node, offset, zoomLevel)

				return (
					<g key={`debug_${node.id}_${index}`}>
						<text x={pos.x} y={pos.y - pos.height / 1.75} textAnchor="middle" dominantBaseline="central">
							{pos.x} x {pos.y} / {pos.width}
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
		let selectedNodes: SVGElement[] = []

		if (isClusterDrag) {
			selectedNodes = [...(document.getElementById(graphId)?.querySelectorAll<SVGElement>('[data-node]') ?? [])]
		} else if (dragElement) {
			selectedNodes = [document.getElementById(dragElement)! as unknown as SVGElement]
		}

		if (selectedNodes.length === 0) return

		const selected = testData(selectedNodes)

		setSelectedNodes(selected)
	}, [dragElement, isClusterDrag, testData, graphId])

	const updateAllLines = useCallback(() => {
		const regex = isClusterDrag ? '[dummy-nothing]' : `[data-node]:not(#${dragElement})`

		const nodes = [...(document.getElementById(graphId)?.querySelectorAll<SVGElement>(regex) ?? [])]

		const allNodes = testData(nodes)

		setTestNodes(allNodes)
	}, [isClusterDrag, dragElement, testData, graphId])

	const calculateCenter = useCallback(() => {
		const target = document.getElementById(graphId)?.querySelector<SVGElement>('[data-node-group]')
		if (!target) return
		const pos = getNodePosition(target, panPosition, zoomLevel)

		const posWidth = Math.round(pos.width)
		const posHeight = Math.round(pos.height)
		const posX = Math.round(pos.x - posWidth / 2)
		const posY = Math.round(pos.y - posHeight / 2)
		setCenter({ x: posX + posWidth / 2, y: posY + posHeight / 2, width: posWidth, height: posHeight })
	}, [panPosition, zoomLevel, graphId])

	useEffect(() => {
		if (testNodes.length === 0) return
		setTimeout(calculateCenter, 20)
	}, [calculateCenter, testNodes])

	useEffect(() => {
		if (!isDebug) return
		timerRef.current = setTimeout(updateAllLines, 20)
	}, [updateAllLines, isDebug])

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
		isDebug && (
			<Container data-debug-group>
				{selectedNodes}
				{testNodes}
				{center && (
					<g>
						<circle r="4" fill="blue" fillOpacity={0.5} cx={center.x} cy={center.y} />
						<rect
							width={center.width}
							height={center.height}
							x={center.x - center.width / 2}
							y={center.y - center.height / 2}
							stroke="blue"
							fill="none"
						/>
					</g>
				)}
			</Container>
		)
	)
}

const Container = styled.g`
	user-select: none;
	pointer-events: none;
`

export default Debug
