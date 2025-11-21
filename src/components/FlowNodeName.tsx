import { useAppSelector } from '@hooks/ReduxStore'
import { getShowResponsiveTextState, getZoomLevelState } from '@store/SettingsSlice'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

interface Props {
	name?: string
	tooltip?: string
	boxHeight: number
	boxWidth: number
	minSize?: number
}
const FlowNodeName = ({ name, boxWidth, boxHeight, minSize = 100, tooltip }: Props) => {
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const showResponsiveText = useAppSelector<boolean>(getShowResponsiveTextState)

	const cleanName = useMemo(() => name?.replace(/[\s\W]/gim, ''), [name])
	const lineList = useMemo(() => name?.replace(/(?<=(.){20})\s/gim, '||').split('||') ?? [name ?? ''], [name])
	const minZoomLevel = useMemo(() => {
		return showResponsiveText ? Math.min(zoomLevel, 1) : 1
	}, [zoomLevel, showResponsiveText])

	const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

	useEffect(() => {
		const longest = lineList?.reduce((longest, current) => (current.length > longest.length ? current : longest))
		const width = Math.max((longest?.length || 1) * 9, minSize) * (1 / minZoomLevel)
		const height = Math.max((lineList?.length || 1) * 22, 30) * (1 / minZoomLevel)

		setSize({ width: width, height: height })
	}, [lineList, minSize, name, minZoomLevel])

	return (
		<g transform={`translate(${boxWidth / 2}, ${boxHeight + 24 * (1 / minZoomLevel)})`}>
			<rect
				data-node-tooltip={tooltip ?? undefined}
				width={size.width}
				height={size.height}
				fill="#fff"
				x={-size.width / 2}
				y={`-${1 / minZoomLevel}em`}
				rx={`${1 / minZoomLevel}em`}
				ry={`${1 / minZoomLevel}em`}
				style={{ filter: 'url(#dropshadow)' }}
			/>
			<Text dominantBaseline="middle" textAnchor="middle" $zoomLevel={minZoomLevel}>
				{lineList?.map((line, index) => (
					<tspan x="0" dy={index === 0 ? '0em' : '1.2em'} key={`nodename_${cleanName}_${index})}`}>
						{line}
					</tspan>
				))}
			</Text>
		</g>
	)
}

const Text = styled.text<{ $zoomLevel: number }>`
	font-size: ${({ $zoomLevel }) => 1 / $zoomLevel}em;
`
export default FlowNodeName
