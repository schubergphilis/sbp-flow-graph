import { useAppSelector } from '@hooks/ReduxStore'
import LineModel from '@models/LineModel'
import { getShowInfoState } from '@store/SettingsSlice'
import styled from 'styled-components'
import FlowNodeName from './FlowNodeName'

interface Props {
	data: LineModel
}

const Line = ({ data: { start, end, info, startSize, endSize, status, tooltip } }: Props) => {
	const showInfo = useAppSelector<boolean>(getShowInfoState)

	const textLength = (info?.length || 1) * 11

	const startAngle = Math.atan2(end.y - start.y, end.x - start.x)
	const startX = start.x + startSize * Math.cos(startAngle)
	const startY = start.y + startSize * Math.sin(startAngle)

	const endAngle = Math.atan2(start.y - end.y, start.x - end.x)
	const endX = end.x + endSize * Math.cos(endAngle)
	const endY = end.y + endSize * Math.sin(endAngle)

	const midX = (startX + endX) / 2
	const midY = (startY + endY) / 2

	const firstX = (startX + midX) / 2
	const firstY = (startY + midY) / 2

	const lastX = (endX + midX) / 2
	const lastY = (endY + midY) / 2

	return (
		<Container data-line-status={status}>
			<path
				d={`M${start.x} ${start.y} ${firstX} ${firstY} ${midX} ${midY} ${lastX} ${lastY} L${end.x} ${end.y}`}
				strokeWidth={1}
				strokeDasharray={4}
				markerMid="url(#arrow)"
				fill="none"
			/>

			{showInfo && info && (
				<g transform={`translate(${midX - textLength / 2}, ${midY})`}>
					<FlowNodeName name={info ?? ''} boxHeight={-30} boxWidth={textLength} minSize={30} tooltip={tooltip} />
				</g>
			)}
		</Container>
	)
}

const Container = styled.g`
	pointer-events: none;
	& text {
		user-select: none;
	}

	& rect,
	& polygon {
		pointer-events: all;
	}

	&[data-line-status='Error'] > path {
		stroke: ${({ theme }) => theme.style.notificationErrorColorBg};
	}

	&[data-line-status='Success'] {
		& > g:last-child {
			& rect,
			& polygon {
				stroke: ${({ theme }) => theme.style.notificationSuccessColorBg};
				stroke-width: 2;
			}
		}
		& > path {
			stroke: ${({ theme }) => theme.style.notificationSuccessColorBg};
		}
	}

	&[data-line-status='Warning'] {
		& > g:last-child {
			& rect,
			& polygon {
				stroke: ${({ theme }) => theme.style.notificationWarningColorBg};
				stroke-width: 2;
			}
		}
		& > path {
			stroke: ${({ theme }) => theme.style.notificationWarningColorBg};
		}
	}

	&[data-line-status='Info'] {
		& > g:last-child {
			& rect,
			& polygon {
				stroke: ${({ theme }) => theme.style.notificationInfoColorBg};
				stroke-width: 2;
			}
		}
		& > path {
			stroke: ${({ theme }) => theme.style.notificationInfoColorBg};
		}
	}

	&[data-line-status='Critical'] {
		& > g:last-child {
			& rect,
			& polygon {
				stroke: ${({ theme }) => theme.style.notificationCriticalColorBg};
				stroke-width: 2;
			}
		}
		& > path {
			stroke: ${({ theme }) => theme.style.notificationCriticalColorBg};
		}
	}

	&[data-line-status='Unknown'] {
		& > g:last-child {
			& rect,
			& polygon {
				stroke: ${({ theme }) => theme.style.notificationUnknownColorBg};
				stroke-width: 2;
			}
		}
		& > path {
			stroke: ${({ theme }) => theme.style.notificationUnknownColorBg};
		}
	}

	&[data-line-status='Running'] {
		& > g:last-child {
			& rect,
			& polygon {
				stroke: ${({ theme }) => theme.style.notificationRunningColorBg};
				stroke-width: 2;
			}
		}
		& > path {
			stroke: ${({ theme }) => theme.style.notificationRunningColorBg};
			stroke-dasharray: 10;
			animation: dash 5s linear infinite;
		}
	}

	@keyframes dash {
		to {
			stroke-dashoffset: -500;
		}
	}
`
export default Line
