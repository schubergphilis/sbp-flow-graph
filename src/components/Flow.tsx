import Click from '@components/Click'
import Debug from '@components/Debug'
import Drag from '@components/Drag'
import LineBox from '@components/LineBox'
import NodeBox from '@components/NodeBox'
import Pan from '@components/Pan'
import StateProvider from '@components/StateProvider'
import SVGMarker from '@components/SVGMarker'
import SVGShadow from '@components/SVGShadow'
import ZoomTools from '@components/ZoomTools'

import ProcessModel from '@models/ProcessModel'
import styled from 'styled-components'
import SVGInnerShadow from './SVGInnerShadow'
import Tooltip from './Tooltip'

interface Props {
	data?: ProcessModel[]
	isDebug?: boolean
	spacing?: number
	onNodeClick?: (id: string) => void
	iconSelector?: (name: string) => JSX.Element
}

const Flow = ({ data, isDebug = false, spacing, onNodeClick, iconSelector }: Props) => {
	return (
		<StateProvider isDebug={isDebug}>
			<Pan>
				<Drag>
					<Tooltip>
						<Click onNodeClick={onNodeClick}>
							<SvgCanvast $isDebug={isDebug}>
								<SVGShadow />
								<SVGMarker />
								<SVGInnerShadow />
								<LineBox />
								<NodeBox data={data} iconSelector={iconSelector} spacing={spacing} />
								<Debug isDebug={isDebug} />
							</SvgCanvast>
						</Click>
					</Tooltip>
				</Drag>
			</Pan>
			<ZoomTools />
		</StateProvider>
	)
}

const SvgCanvast = styled.svg<{ $isDebug: boolean }>`
	width: 100%;
	height: 100%;
	overflow: visible;
	${({ $isDebug }) => $isDebug && 'background-color: #ff000040'}
`
export default Flow
