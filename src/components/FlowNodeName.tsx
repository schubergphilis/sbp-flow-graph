import { useEffect, useMemo, useState } from 'react'

interface Props {
	name?: string
	tooltip?: string
	boxHeight: number
	boxWidth: number
	minSize?: number
}
const FlowNodeName = ({ name, boxWidth, boxHeight, minSize = 100, tooltip }: Props) => {
	const cleanName = name?.replace(/[\s\W]/gim, '')
	const lineList = useMemo(() => name?.replace(/(?<=(.){20})\s/gim, '||').split('||') ?? [name ?? ''], [name])

	const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
	// if (name === 'AFAS') console.log('---', tooltip, textLength, textHeight)
	useEffect(() => {
		const longest = lineList?.reduce((longest, current) => (current.length > longest.length ? current : longest))
		const width = Math.max((longest?.length || 1) * 9, minSize)
		const height = Math.max((lineList?.length || 1) * 22, 30)

		setSize({ width, height })
	}, [lineList, minSize, name])

	return (
		<g transform={`translate(${boxWidth / 2}, ${boxHeight + 26})`}>
			<rect
				data-node-tooltip={tooltip ?? undefined}
				width={size.width}
				height={size.height}
				fill="#fff"
				x={-size.width / 2}
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
	)
}

export default FlowNodeName
