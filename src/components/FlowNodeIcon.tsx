import { ReactNode } from 'react'
import styled from 'styled-components'

interface Props {
	children?: ReactNode
	nodeSize: number
	boxWidth: number
}

const FlowNodeIcon = ({ children, boxWidth, nodeSize }: Props) => {
	const offset = Math.max(nodeSize / 2, 5)
	return (
		<Container transform={`translate(${boxWidth / 2 - offset / 2} , ${nodeSize / 2 - offset / 2})`}>
			<svg x={0} y={0} width={offset} height={offset}>
				{children}
			</svg>
		</Container>
	)
}

const Container = styled.g`
	pointer-events: none;
`
export default FlowNodeIcon
