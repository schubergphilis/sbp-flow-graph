import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Line from './Line'

const LineBox = () => {
	const [lines, setLines] = useState<SVGElement[]>([])
	const timerRef = useRef<NodeJS.Timeout>()

	const getLines = useCallback((): void => {
		const nodes = [...(document.querySelectorAll<SVGElement>('[data-node]') ?? [])]
		const lines = nodes.filter((node) => node.getAttribute('data-node-root') !== 'true')
		setLines(lines)
	}, [])

	useEffect(() => {
		timerRef.current = setTimeout(getLines, 1)
	}, [getLines])

	return (
		<Container>
			{lines.map((node, index) => (
				<Line key={index} node={node} />
			))}
		</Container>
	)
}

const Container = styled.g``

export default LineBox
