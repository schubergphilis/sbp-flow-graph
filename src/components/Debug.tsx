import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodeOffset } from '../helpers/AutoPosition'
import { GlobalState } from './Provider'

interface Props {
	isDebug?: boolean
}

const Debug = ({ isDebug = false }: Props) => {
	const { state } = useContext(GlobalState)

	const [testNodes, setTestNodes] = useState<JSX.Element[]>([])
	const [selectedNode, setSelectedNode] = useState<JSX.Element>()

	const timerRef = useRef<NodeJS.Timeout>()
	const updateRef = useRef<NodeJS.Timeout>()

	const testData = useCallback((nodes: SVGElement[]): JSX.Element[] => {
		return nodes.map((node, index) => {
			const offset = getNodeOffset(node)

			return (
				<g key={index}>
					<text x={offset.x} y={offset.y - offset.height / 1.75} textAnchor="middle" dominantBaseline="central">
						{offset.x} x {offset.y} / {offset.width}
					</text>
					<rect
						width={offset.width}
						height={offset.height}
						x={offset.x - offset.width / 2}
						y={offset.y - offset.height / 2}
						stroke={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
						fill="transparent"
					/>
					<path
						d={`M${offset.x - offset.width / 2} ${offset.y - offset.height / 2} L${offset.x + offset.width / 2} ${offset.y + offset.height / 2}`}
						stroke={`hsla(${Math.random() * 360}, 70%, 50%, 90%)`}
						strokeWidth={1}
						strokeDasharray={4}
						fill="none"
					/>
					<path
						d={`M${offset.x - offset.width / 2} ${offset.y} L${offset.x + offset.width / 2} ${offset.y}`}
						stroke={`hsl(${Math.random() * 360}, 0%, 0%)`}
						strokeWidth={1}
						strokeDasharray={4}
						fill="none"
					/>
					<path
						d={`M${offset.x} ${offset.y - offset.height / 2} L${offset.x} ${offset.y + offset.height / 2}`}
						stroke={`hsl(${Math.random() * 360}, 0%, 0%)`}
						strokeWidth={1}
						strokeDasharray={4}
						fill="none"
					/>
				</g>
			)
		})
	}, [])

	const getTestData = useCallback((): void => {
		const allNodes = [...(document.querySelectorAll<SVGElement>('[data-node]') ?? [])]
		const list = testData(allNodes)
		setTestNodes(list)
	}, [testData])

	const updateSelectedLines = useCallback(() => {
		console.log('-----Interval')

		const selectedNode = document.querySelector<SVGElement>(`[data-node-id=${state.dragElement}]`)

		if (!selectedNode) return
		const selected = testData([selectedNode])

		setSelectedNode(selected[0])
	}, [state.dragElement, testData])

	const updateAllLines = useCallback(() => {
		const allNodes = [
			...(document.querySelectorAll<SVGElement>(`[data-node]:not([data-node-id=${state.dragElement}])`) ?? [])
		]

		const all = testData(allNodes)

		setTestNodes(all)
	}, [state.dragElement, testData])

	useEffect(() => {
		if (!isDebug) return
		timerRef.current = setTimeout(getTestData, 2)
	}, [getTestData, isDebug, testData])

	useEffect(() => {
		if (state.dragElement) {
			updateAllLines()
			updateRef.current = setInterval(updateSelectedLines, 20)
		}
		return () => clearInterval(updateRef.current)
	}, [state.dragElement, updateAllLines, updateSelectedLines])

	useEffect(() => {
		if (state.dragElement) return
		updateAllLines()
	}, [state.dragElement, updateAllLines])

	return (
		isDebug && (
			<Container>
				{selectedNode}
				{testNodes}
			</Container>
		)
	)
}

const Container = styled.g`
	user-select: none;
	pointer-events: none;
`

export default Debug
