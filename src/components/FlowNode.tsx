import styled from 'styled-components'
import { ProcessModel } from '../models/ProcessModel'
import FlowNodeName from './FlowNodeName'

interface Props {
	data: ProcessModel
}

const FlowNode = ({ data: { id, value, root, parent, type = 'circle', name, hasChildren } }: Props) => {
	return (
		<Container
			data-node-id={`X${id}`}
			data-node
			data-node-root={root}
			data-node-parent={parent ? `X${parent}` : undefined}
			data-node-type={type}
			data-node-size={value / 2}
			data-node-children={hasChildren}
			fillOpacity={0}
			transform={'translate(-10000, -10000)'}>
			{type === 'circle' ? (
				<g transform={`translate(${value / 2}, ${value / 2})`}>
					<circle
						r={value / 2}
						fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
						cx="0"
						cy="0"
						style={{ filter: 'url(#dropshadow)' }}
					/>
				</g>
			) : (
				<rect
					fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
					width={value}
					height={value}
					x="0"
					y="0"
					style={{ filter: 'url(#dropshadow)' }}
				/>
			)}
			<FlowNodeName name={name} value={value} />
		</Container>
	)
}

const Container = styled.g`
	& > g > circle,
	& > rect {
		transform-origin: top left;
		transition: fill-opacity 0.5s ease-in-out;
		pointer-events: auto !important;
	}
	cursor: default;

	&[data-node-children]:not([data-node-root]) {
		cursor: pointer;
	}
`

export default FlowNode
