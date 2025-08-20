import { generatePolygoinPoints } from '@helpers/Helpers'
import { useAppSelector } from '@hooks/ReduxStore'
import ProcessModel from '@models/ProcessModel'
import { getGraphIdState } from '@store/SettingsSlice'
import { useCallback } from 'react'
import styled from 'styled-components'
import FlowNodeBadge from './FlowNodeBadge'
import FlowNodeIcon from './FlowNodeIcon'
import FlowNodeName from './FlowNodeName'

interface Props {
	data: ProcessModel
	iconSelector?: (name: string) => JSX.Element
}

const FlowNode = ({
	data: {
		id,
		referenceId,
		value,
		root,
		parent,
		type = 'circle',
		name,
		icon,
		badge = 0,
		tooltip,
		info,
		infoTooltip,
		hasChildren,
		status,
		childStatus,
		isVisible
	},
	iconSelector
}: Props) => {
	const textLength = Math.max((name?.length || 1) * 11, 75)
	const boxSize = Math.max(textLength, value)

	const graphId = useAppSelector<string>(getGraphIdState)

	const hasChildernVisible = useCallback(
		(id: string) => {
			return (
				document
					.getElementById(graphId)!
					.querySelector(`[data-node-parent=X${graphId}_${id}][data-node-visible=true]`) !== null
			)
		},
		[graphId]
	)

	return (
		<Container
			id={`X${graphId}_${id}`}
			data-node-reference={`X${graphId}_${referenceId}`}
			data-node
			data-node-root={root ? 'true' : undefined}
			data-node-parent={parent ? `X${graphId}_${parent}` : undefined}
			data-node-info={info ?? undefined}
			data-node-info-tooltip={infoTooltip ?? undefined}
			data-node-type={type}
			data-node-size={value / 2}
			data-node-children={hasChildren}
			data-node-children-visible={!root && hasChildren ? hasChildernVisible(id) : undefined}
			data-node-visible={isVisible}
			fillOpacity={0}
			transform={'translate(-10000, -10000)'}>
			{type === 'circle' ? (
				<g transform={`translate(${boxSize / 2}, ${value / 2})`}>
					<circle
						data-node-status={status}
						// fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
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
						data-node-tooltip={tooltip}
						style={{ filter: 'url(#innershadow)' }}
					/>
				</g>
			) : type === 'polygon' ? (
				<g transform={`translate(${boxSize / 2 - value / 2}, 0)`}>
					<polygon
						data-node-status={status}
						points={generatePolygoinPoints(value)}
						style={{ filter: 'url(#dropshadow)' }}
					/>

					<polygon
						data-child-status={childStatus}
						points={generatePolygoinPoints(value - value / 20)}
						strokeWidth={value / 10}
						fill="transparent"
						data-node-tooltip={tooltip}
						style={{ filter: 'url(#dropshadow)' }}
					/>
				</g>
			) : (
				<g transform={`translate(${boxSize / 2 - value / 2}, 0)`}>
					<rect
						data-node-status={status}
						// fill={`hsla(${Math.random() * 360}, 50%, 50%, 90%)`}
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
						data-node-tooltip={tooltip}
						style={{ filter: 'url(#innershadow)' }}
					/>
				</g>
			)}
			{icon && iconSelector && (
				<FlowNodeIcon boxHeight={value} boxWidth={boxSize}>
					{iconSelector(icon)}
				</FlowNodeIcon>
			)}
			<FlowNodeName name={name} boxHeight={value} boxWidth={boxSize} />
			{badge > 0 && <FlowNodeBadge badge={badge} type={type} nodeSize={value} boxWidth={boxSize} />}
		</Container>
	)
}

const Container = styled.g`
	& > g > circle,
	& > g > rect,
	& > g > polygon {
		transform-origin: top left;
		transition: fill-opacity 0.25s ease-in-out;
		pointer-events: auto !important;
	}

	& > g > [data-node-status='Running'] {
		fill: url(#stripes);
	}

	& > g > [data-node-status='Unknown'] {
		fill: ${({ theme }) => theme.style.notificationUnknownColorBg};
	}

	& > g > [data-node-status='Success'] {
		fill: ${({ theme }) => theme.style.notificationSuccessColorBg};
	}

	& > g > [data-node-status='Warning'] {
		fill: ${({ theme }) => theme.style.notificationWarningColorBg};
	}

	& > g > [data-node-status='Error'] {
		fill: ${({ theme }) => theme.style.notificationErrorColorBg};
	}

	& > g > [data-node-status='Critical'] {
		fill: ${({ theme }) => theme.style.notificationCriticalColorBg};
	}

	& > g > [data-child-status='Unknown'] {
		stroke: ${({ theme }) => theme.style.notificationUnknownColorBg};
	}

	& > g > [data-child-status='Success'] {
		stroke: ${({ theme }) => theme.style.notificationSuccessColorBg};
	}

	& > g > [data-child-status='Warning'] {
		stroke: ${({ theme }) => theme.style.notificationWarningColorBg};
	}

	& > g > [data-child-status='Error'] {
		stroke: ${({ theme }) => theme.style.notificationErrorColorBg};
	}

	& > g > [data-child-status='Critical'] {
		stroke: ${({ theme }) => theme.style.notificationCriticalColorBg};
	}

	cursor: default;

	&[data-node-children]:not([data-node-root='true']) {
		cursor: pointer;
	}

	&[data-node-visible='false'] {
		fill-opacity: 0;
		stroke-opacity: 0;

		& > g > circle,
		& > g >,
		& > g > polygon {
			pointer-events: none !important;
		}
	}

	&[transform='translate(-10000, -10000)'] {
		display: none;
	}
`

export default FlowNode
