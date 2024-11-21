import styled from 'styled-components'
import { getNodeOffset, getParentNodePosition } from '../helpers/AutoPosition'

interface Props {
	node: SVGElement
}

const Line = ({ node }: Props) => {
	const offset = getNodeOffset(node)
	const parent = getParentNodePosition(node)
	const angle = (Math.atan2(offset.x - parent.x, offset.y - parent.y) * 180) / Math.PI
	// const textAngle = angle >= 0 && angle <= 45 ? angle : angle > 45 && angle <= 255 ? angle - 45 : 0
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
	// console.log(angle)
	return (
		<Container>
			<text
				x={offset.x}
				y={offset.y}
				textAnchor="middle"
				dominantBaseline="central"
				transform={`rotate(${textAngle}, ${offset.x}, ${offset.y})`}
				fillOpacity={0}>
				Welcome
			</text>

			<path
				d={`M${parent.x} ${parent.y} L${offset.x} ${offset.y}`}
				stroke={`hsl(${Math.random() * 360}, 50%, 50%)`}
				strokeWidth={1}
				strokeDasharray={4}
				fill="none"
			/>
		</Container>
	)
}

const Container = styled.g`
	& > text {
		user-select: none;
	}
`
export default Line
