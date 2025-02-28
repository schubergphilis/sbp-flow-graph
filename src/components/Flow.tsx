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

interface Props {
	data: ProcessModel[]
	isDebug?: boolean
}

const Flow = ({ data, isDebug = false }: Props) => {
	return (
		<StateProvider isDebug={isDebug}>
			<Pan>
				<Drag>
					<Click>
						<SvgCanvast $isDebug={isDebug}>
							<SVGShadow />
							<SVGMarker />
							<LineBox />
							<NodeBox data={data} />
							<Debug isDebug={isDebug} />
						</SvgCanvast>
					</Click>
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
