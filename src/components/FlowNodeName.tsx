interface Props {
	name?: string
	value: number
}
const FlowNodeName = ({ name, value }: Props) => {
	const textLength = Math.max((name?.length || 1) * 11, 75)

	return (
		<g transform={`translate(${value / 2}, ${value + 30})`}>
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
	)
}

export default FlowNodeName
