import { calculateLinePath } from '@helpers/Helpers'
import { useAppSelector } from '@hooks/ReduxStore'
import LineModel from '@models/LineModel'
import { getShowInfoState } from '@store/SettingsSlice'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import FlowNodeName from './FlowNodeName'

interface Props {
	data: LineModel
	dragged?: boolean
}

const Line = memo(
	({ data, dragged = false }: Props) => {
		const showInfo = useAppSelector<boolean>(getShowInfoState)

		const elementPathRef = useRef<SVGPathElement>(null)

		const [isLoaded, setIsLoaded] = useState<number>(dragged ? 1 : 0)

		const pathCalculations = useMemo(() => calculateLinePath(data), [data])

		const { pathData, midX, midY, textLength } = pathCalculations

		useEffect(() => {
			setTimeout(() => setIsLoaded(1), 10)
		}, [])
		return (
			<Container data-line-status={data.status}>
				<path
					ref={elementPathRef}
					d={pathData}
					strokeWidth={dragged ? 1.5 : 1}
					strokeDasharray={4}
					markerMid="url(#arrow)"
					fill="none"
					strokeOpacity={isLoaded}
				/>

				{showInfo && data.info && (
					<g transform={`translate(${midX - textLength / 2}, ${midY})`}>
						<FlowNodeName name={data.info} boxHeight={-30} boxWidth={textLength} minSize={30} tooltip={data.tooltip} />
					</g>
				)}
			</Container>
		)
	},
	(prevProps, nextProps) => {
		// Custom comparison for better memoization
		const prev = prevProps.data
		const next = nextProps.data

		return (
			prev.start.x === next.start.x &&
			prev.start.y === next.start.y &&
			prev.end.x === next.end.x &&
			prev.end.y === next.end.y &&
			prev.startSize === next.startSize &&
			prev.endSize === next.endSize &&
			prev.status === next.status
		)
	}
)

const Container = styled.g`
	transition: stroke-opacity 0.25s ease-in-out;

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
