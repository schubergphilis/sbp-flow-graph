import styled from 'styled-components'
import { ProcessModel } from '../models/ProcessModel'

interface Props {
	data: ProcessModel
}

const FlowNode = ({ data: { id, value, root, parent, type } }: Props) => {
	return (
		<Container>
			<circle
				r={value / 2}
				fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
				data-node
				data-node-root={root}
				data-node-id={`X${id}`}
				data-node-parent={parent ? `X${parent}` : undefined}
				data-node-type={type}
				cx="-1000"
				cy="-1000"
				fillOpacity={0}
			/>
		</Container>
	)
}

const Container = styled.g`
	& > circle {
		transform-origin: top left;
		transition: fill-opacity 0.5s ease-in-out;
		pointer-events: auto !important;
	}
`

export default FlowNode
