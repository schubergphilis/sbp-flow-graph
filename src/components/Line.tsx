import LineModel from '@models/LineModel'
import styled from 'styled-components'

interface Props {
	data: LineModel
}

const Line = ({ data: { start, end, text, startSize, endSize, status } }: Props) => {
	const angle = (Math.atan2(start.x - end.x, start.y - end.y) * 180) / Math.PI

	const startAngle = Math.atan2(end.y - start.y, end.x - start.x)
	const startX = start.x + startSize * Math.cos(startAngle)
	const startY = start.y + startSize * Math.sin(startAngle)

	const endAngle = Math.atan2(start.y - end.y, start.x - end.x)
	const endX = end.x + endSize * Math.cos(endAngle)
	const endY = end.y + endSize * Math.sin(endAngle)

	const midX = (startX + endX) / 2
	const midY = (startY + endY) / 2

	const textAngle =
		angle < 0 && angle <= -135
			? angle - 180
			: angle > 45 && angle <= 135
				? angle + 180
				: angle < 0 && angle >= -45
					? angle
					: angle > 0 && angle <= 45
						? angle
						: 0

	return (
		<Container data-line-status={status}>
			<text
				x={start.x}
				y={start.y}
				textAnchor="middle"
				dominantBaseline="central"
				transform={`rotate(${textAngle}, ${start.x}, ${start.y})`}
				fillOpacity={0}>
				{text}
			</text>

			<path
				d={`M${start.x} ${start.y}  ${midX} ${midY} L${end.x} ${end.y}`}
				stroke={`hsl(${Math.random() * 360}, 50%, 50%)`}
				strokeWidth={1}
				strokeDasharray={4}
				markerMid="url(#arrow)"
				fill="none"
			/>
		</Container>
	)
}

const Container = styled.g`
	pointer-events: none;
	& > text {
		user-select: none;
	}

	&[data-line-status='Error'] > path {
		stroke: ${({ theme }) => theme.style.notificationErrorColorBg};
	}

	&[data-line-status='Success'] > path {
		stroke: ${({ theme }) => theme.style.notificationSuccessColorBg};
	}

	&[data-line-status='Unknown'] > path {
		stroke: ${({ theme }) => theme.style.notificationUnknownColorBg};
	}
`
export default Line
