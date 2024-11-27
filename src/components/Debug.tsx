import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodePosition } from '../helpers/AutoPosition'
import OffsetModel from '../models/OffsetModel'
import PositionModel from '../models/PositionModel'
import { GlobalState } from './Provider'

interface Props {
	isDebug?: boolean
}

const Debug = ({ isDebug = false }: Props) => {
	const { state } = useContext(GlobalState)

	const [testNodes, setTestNodes] = useState<JSX.Element[]>([])
	const [selectedNodes, setSelectedNodes] = useState<JSX.Element[]>()
	const [offset, setOffset] = useState<PositionModel>({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [center, setCenter] = useState<OffsetModel | undefined>()

	const timerRef = useRef<NodeJS.Timeout>()
	const updateRef = useRef<NodeJS.Timeout>()

	const getPanOffset = useCallback(() => {
		const offsetTarget = document?.querySelector<HTMLDivElement>('[data-pan]')

		const offset = offsetTarget?.getBoundingClientRect() ?? { x: 0, y: 0 }
		setOffset(offset)
	}, [])

	const testData = useCallback(
		(nodes: SVGElement[]): JSX.Element[] => {
			return nodes.map((node, index) => {
				const pos = getNodePosition(node, offset, state.zoomLevel ?? 1)

				return (
					<g key={`debug_${index}`}>
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
		[offset, state.zoomLevel]
	)

	const updateSelectedLines = useCallback(() => {
		// console.log('-----Interval')

		const regex = state.isClusterDrag ? '[data-node]' : `[data-node-id=${state.dragElement}]`

		const selectedNodes = [...document.querySelectorAll<SVGElement>(regex)]

		if (!selectedNodes) return

		const selected = testData(selectedNodes)

		setSelectedNodes(selected)
	}, [state.dragElement, state.isClusterDrag, testData])

	const updateAllLines = useCallback(() => {
		const regex = state.isClusterDrag ? '[dummy-nothing]' : `[data-node]:not([data-node-id=${state.dragElement}])`

		const nodes = [...(document.querySelectorAll<SVGElement>(regex) ?? [])]

		const allNodes = testData(nodes)

		setTestNodes(allNodes)
	}, [state.isClusterDrag, state.dragElement, testData])

	const calculateCenter = useCallback(() => {
		const target = document.querySelector<SVGElement>('[data-node-group]')
		const pos = getNodePosition(target, offset, state.zoomLevel)

		const posWidth = Math.round(pos.width)
		const posHeight = Math.round(pos.height)
		const posX = Math.round(pos.x - posWidth / 2)
		const posY = Math.round(pos.y - posHeight / 2)
		setCenter({ x: posX + posWidth / 2, y: posY + posHeight / 2, width: posWidth, height: posHeight })
	}, [offset, state.zoomLevel])

	useEffect(() => {
		if (testNodes.length === 0) return
		setTimeout(calculateCenter, 20)
	}, [calculateCenter, testNodes])

	useEffect(() => {
		getPanOffset()
	}, [getPanOffset, state.zoomLevel])

	useEffect(() => {
		if (!isDebug) return
		timerRef.current = setTimeout(updateAllLines, 2)
	}, [updateAllLines, isDebug])

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
	}, [isDragging, updateAllLines, updateSelectedLines, getPanOffset])

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
