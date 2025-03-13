import { ReactNode } from 'react'
import styled from 'styled-components'

interface Props {
	children?: ReactNode
	boxWidth: number
	boxHeight: number
}

const FlowNodeIcon = ({ children, boxWidth, boxHeight }: Props) => {
	const offset = Math.max(boxHeight / 4, 5)
	return (
		<Container transform={`translate(${boxWidth / 2 - boxHeight / 2} , 0)`}>
			<svg x={offset} y={offset} width={boxHeight - offset * 2} height={boxHeight - offset * 2}>
				{children}
			</svg>
		</Container>
	)
}

const Container = styled.g`
	pointer-events: none;
`
export default FlowNodeIcon
