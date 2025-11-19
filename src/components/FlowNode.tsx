import { getNodePosition } from '@helpers/AutoPosition'
import { generatePolygoinPoints } from '@helpers/Helpers'
import { useAppSelector } from '@hooks/ReduxStore'
import NodeModel from '@models/NodeModel'
import OffsetModel from '@models/OffsetModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import {
	getDataListState,
	getGraphIdState,
	getPageOffsetState,
	getPositionListState,
	getVisibilityListState,
	getZoomLevelState
} from '@store/SettingsSlice'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import FlowNodeBadge from './FlowNodeBadge'
import FlowNodeIcon from './FlowNodeIcon'
import FlowNodeName from './FlowNodeName'

interface Props {
	data: ProcessModel
	iconSelector?: (name: string) => JSX.Element
}

const FlowNode = memo(
	({
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
		const ref = useRef<SVGGElement>(null)

		const graphId = useAppSelector<string>(getGraphIdState)
		const dataList = useAppSelector<ProcessModel[] | undefined>(getDataListState)
		const positionList = useAppSelector<NodeModel[] | undefined>(getPositionListState)
		const visibilityList = useAppSelector<string[] | undefined>(getVisibilityListState)
		const zoomLevel = useAppSelector<number>(getZoomLevelState)
		const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)

		const [size, setSize] = useState<OffsetModel>({ width: 0, height: 0, x: 0, y: 0 })

		const hasChildernVisible = useCallback(
			(id: string) => {
				return dataList?.find(
					(data) =>
						data.parent === id &&
						(positionList?.find((item) => item.id === data.id && visibilityList?.includes(item.id)) ?? false)
				)
					? true
					: undefined
			},
			[dataList, positionList, visibilityList]
		)

		useEffect(() => {
			if (!ref.current || !ref.current.hasAttribute('data-node-visible')) return

			const pos = getNodePosition(ref.current, { x: 0, y: 0 }, zoomLevel)
			setSize({ width: pos.width, height: pos.height, x: 0, y: 0 })
		}, [pageOffset, zoomLevel, badge, isVisible])

		return (
			<Container
				ref={ref}
				id={`X${graphId}_${id}`}
				data-node-reference={`X${graphId}_${referenceId}`}
				data-node
				data-node-root={root ? true : undefined}
				data-node-parent={parent ? `X${graphId}_${parent}` : undefined}
				data-node-info={info ?? undefined}
				data-node-info-tooltip={infoTooltip ?? undefined}
				data-node-type={type}
				data-node-size={value / 2}
				data-node-children={hasChildren}
				data-node-children-visible={root ? true : hasChildernVisible(id)}
				data-node-visible={isVisible ? true : undefined}
				data-node-badge={badge ? badge : undefined}
				transform={'translate(-10000, -10000)'}>
				{/* This Rect is needed to devine the correct size of a Node (otherwise it will pick the actual node */}
				<rect width={size.width} height={Math.max(size.height - (badge ? 20 : 0), 0)} fill="transparent" />

				{type === 'circle' ? (
					<g transform={`translate(${size.width / 2}, ${value / 2})`}>
						<circle data-node-status={status} r={value / 2} cx="0" cy="0" style={{ filter: 'url(#dropshadow)' }} />
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
					<g transform={`translate(${size.width / 2 - value / 2}, 0)`}>
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
					<g transform={`translate(${size.width / 2 - value / 2}, 0)`}>
						<rect
							data-node-status={status}
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
					<FlowNodeIcon boxWidth={size.width} nodeSize={value}>
						{iconSelector(icon)}
					</FlowNodeIcon>
				)}
				{badge > 0 && <FlowNodeBadge badge={badge} nodeSize={value} boxWidth={size.width} />}
				<FlowNodeName name={name} boxHeight={value} boxWidth={size.width} />
			</Container>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.data === nextProps.data
	}
)

const Container = styled.g`
	/* Optimize compositing */
	isolation: isolate;
	transform-style: preserve-3d;

	& > g > circle,
	& > g > rect,
	& > g > polygon {
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

	&:not([data-node-visible]) {
		fill-opacity: 0;
		stroke-opacity: 0;

		& > g >,
		& > g > circle,
		& > g > rect,
		& > g > polygon {
			pointer-events: none !important;
		}
	}

	&[transform='translate(-10000, -10000)'] {
		fill-opacity: 0;
		stroke-opacity: 0;
	}
`

export default FlowNode
