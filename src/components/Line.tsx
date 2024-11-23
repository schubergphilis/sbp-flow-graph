import styled from 'styled-components'
import LineModel from '../models/LineModel'

interface Props {
	data: LineModel
}

const Line = ({ data: { start, end, text } }: Props) => {
	const angle = (Math.atan2(start.x - end.x, start.y - end.y) * 180) / Math.PI

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
		<Container>
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
				d={`M${end.x} ${end.y} L${start.x} ${start.y}`}
				stroke={`hsl(${Math.random() * 360}, 50%, 50%)`}
				strokeWidth={1}
				strokeDasharray={4}
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
`
export default Line
