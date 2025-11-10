interface Props {
	name?: string
	tooltip?: string
	boxHeight: number
	boxWidth: number
	minSize?: number
}
const FlowNodeName = ({ name, boxWidth, boxHeight, minSize = 100, tooltip }: Props) => {
	const cleanName = name?.replace(/[\s\W]/gim, '')
	const lineList = name?.replace(/(?<=(.){20})\s/gim, '||').split('||') ?? [name ?? '']

	const longest = lineList?.reduce((longest, current) => (current.length > longest.length ? current : longest))
	const textLength = Math.max((longest?.length || 1) * 9, minSize)
	const textHeight = Math.max((lineList?.length || 1) * 22, 30)
	return (
		<g transform={`translate(${boxWidth / 2}, 0)`}>
			<g transform={`translate(0, ${boxHeight + 30})`}>
				<rect
					data-node-tooltip={tooltip ?? undefined}
					width={textLength}
					height={textHeight}
					fill="#fff"
					x={-textLength / 2}
					y={-16}
					rx="15"
					ry="15"
					style={{ filter: 'url(#dropshadow)' }}
				/>
				<text dominantBaseline="middle" textAnchor="middle">
					{lineList?.map((line, index) => (
						<tspan x="0" dy={index === 0 ? '0' : '1.2em'} key={`nodename_${cleanName}_${index})}`}>
							{line}
						</tspan>
					))}
				</text>
			</g>
		</g>
	)
}

export default FlowNodeName
