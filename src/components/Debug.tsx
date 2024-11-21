import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { getNodeOffset } from '../helpers/AutoPosition'

interface Props {
	isDebug?: boolean
}

const Debug = ({ isDebug = false }: Props) => {
	const timerRef = useRef<NodeJS.Timeout>()
	const [testNodes, setTestNodes] = useState<JSX.Element[]>([])

	const testData = useCallback(() => {
		const nodes = [...(document.querySelectorAll<SVGElement>('[data-node]') ?? [])]
		const list = nodes.map((node, index) => {
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
		setTestNodes(list)
	}, [])

	useEffect(() => {
		if (!isDebug) return
		timerRef.current = setTimeout(testData, 2)
	}, [isDebug, testData])

	return isDebug && <Container>{testNodes}</Container>
}

const Container = styled.g``

export default Debug
