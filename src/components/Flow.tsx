import styled from 'styled-components'
import { ProcessModel } from '../models/ProcessModel'
import Debug from './Debug'
import Drag from './Drag'
import LineBox from './LineBox'
import NodeBox from './NodeBox'
import Pan from './Pan'
import StateProvider from './StateProvider'
import SVGMarker from './SVGMarker'
import SVGShadow from './SVGShadow'
import ZoomTools from './ZoomTools'

interface Props {
	data: ProcessModel[]
}
const Flow = ({ data }: Props) => {
	return (
		<StateProvider>
			<Pan>
				<Drag>
					<SvgCanvast>
						<SVGShadow />
						<SVGMarker />
						<LineBox />
						<NodeBox data={data} />
						<Debug isDebug={false} />
					</SvgCanvast>
				</Drag>
			</Pan>
			<ZoomTools />
		</StateProvider>
	)
}

const SvgCanvast = styled.svg`
	width: 100%;
	height: 100%;
	overflow: visible;
`
export default Flow
