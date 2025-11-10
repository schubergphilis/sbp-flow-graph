import styled from 'styled-components'

interface Props {
	badge: number
	nodeSize: number
	boxWidth: number
}

const FlowNodeBadge = ({ badge, nodeSize, boxWidth }: Props) => {
	const badgeSize: number = 20

	return (
		<g transform={`translate(${boxWidth / 2 + nodeSize / 2 - badgeSize / 2},0)`} style={{ filter: 'url(#dropshadow)' }}>
			<Badge r={badgeSize} cx="0" cy="0" style={{ filter: 'url(#dropshadow)' }} />
			<Text dominantBaseline="middle" textAnchor="middle">
				{badge}
			</Text>
		</g>
	)
}

const Badge = styled.circle`
	fill: ${({ theme }) => theme.style.badgeColorBg};
`
const Text = styled.text`
	fill: ${({ theme }) => theme.style.badgeColor};
`

export default FlowNodeBadge
