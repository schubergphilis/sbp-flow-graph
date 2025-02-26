import ProcessModel from '@models/ProcessModel'
import styled from 'styled-components'
import FlowNodeIcon from './FlowNodeIcon'
import FlowNodeName from './FlowNodeName'

interface Props {
	data: ProcessModel
}

const FlowNode = ({
	data: { id, value, root, parent, type = 'circle', name, icon, hasChildren, status, childStatus }
}: Props) => {
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
						data-node-status={status}
						fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
						r={value / 2}
						cx="0"
						cy="0"
						style={{ filter: 'url(#dropshadow)' }}
					/>
					<circle
						data-child-status={childStatus}
						strokeWidth={value / 10}
						fill="transparent"
						r={value / 2 - value / 20}
						cx="0"
						cy="0"
					/>
				</g>
			) : (
				<g>
					<rect
						data-node-status={status}
						fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
						width={value}
						height={value}
						x="0"
						y="0"
						style={{ filter: 'url(#dropshadow)' }}
					/>

					<rect
						data-child-status={childStatus}
						strokeWidth={value / 10}
						fill="transparent"
						width={value - value / 10}
						height={value - value / 10}
						x={value / 20}
						y={value / 20}
					/>
				</g>
			)}
			{icon && <FlowNodeIcon name={icon} value={value} />}
			<FlowNodeName name={name} value={value} />
		</Container>
	)
}

const Container = styled.g`
	& > g > circle,
	& > g > rect {
		transform-origin: top left;
		transition: fill-opacity 0.5s ease-in-out;
		pointer-events: auto !important;
	}

	& > g > [data-node-status='Error'] {
		fill: ${({ theme }) => theme.style.notificationErrorColorBg};
	}

	& > g > [data-node-status='Success'] {
		fill: ${({ theme }) => theme.style.notificationSuccessColorBg};
	}

	& > g > [data-node-status='Warning'] {
		fill: ${({ theme }) => theme.style.notificationWarningColorBg};
	}

	& > g > [data-child-status='Error'] {
		stroke: ${({ theme }) => theme.style.notificationErrorColorBg};
	}

	& > g > [data-child-status='Success'] {
		stroke: ${({ theme }) => theme.style.notificationSuccessColorBg};
	}

	& > g > [data-child-status='Unknown'] {
		stroke: ${({ theme }) => theme.style.notificationWarningColorBg};
	}

	cursor: default;

	&[data-node-children]:not([data-node-root]) {
		cursor: pointer;
	}
`

export default FlowNode
