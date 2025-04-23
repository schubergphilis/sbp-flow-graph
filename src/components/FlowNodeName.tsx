interface Props {
	name?: string
	boxHeight: number
	boxWidth: number
	minSize?: number
}
const FlowNodeName = ({ name, boxWidth, boxHeight, minSize = 75 }: Props) => {
	const textLength = Math.max((name?.length || 1) * 11, minSize)

	return (
		<g transform={`translate(${boxWidth / 2}, 0)`}>
			<g transform={`translate(${0}, ${boxHeight + 30})`}>
				<rect
					width={textLength}
					height="30"
					fill="#fff"
					x={-textLength / 2}
					y={-16}
					rx="15"
					ry="15"
					style={{ filter: 'url(#dropshadow)' }}
				/>
				<text dominantBaseline="middle" textAnchor="middle">
					{name}
				</text>
			</g>
		</g>
	)
}

export default FlowNodeName
