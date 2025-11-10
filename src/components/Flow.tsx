import Click from '@components/Click'
import Debug from '@components/Debug'
import Drag from '@components/Drag'
import NodeBox from '@components/NodeBox'
import Pan from '@components/Pan'
import StateProvider from '@components/StateProvider'
import SVGMarker from '@components/SVGMarker'
import SVGShadow from '@components/SVGShadow'
import ZoomTools from '@components/ZoomTools'

import ProcessModel from '@models/ProcessModel'
import { CssColorType } from '@schubergphilis/sbp-frontend-style'
import styled from 'styled-components'
import GraphId from './GraphId'
import LineBox from './LineBox'
import SVGInnerShadow from './SVGInnerShadow'
import SVGStripes from './SVGStripes'
import Tooltip from './Tooltip'

interface Props {
	data?: ProcessModel[]
	isDebug?: boolean
	spacing?: number
	onNodeClick?: (id: string) => void
	iconSelector?: (name: string) => JSX.Element
	refresh?: number
	autoCenter?: boolean
	zoomSmall?: boolean
	zoomColor?: CssColorType
	id?: string
}

const Flow = ({
	data,
	isDebug = false,
	spacing,
	onNodeClick,
	iconSelector,
	refresh,
	id = 'flowGraph',
	autoCenter = false,
	zoomSmall = false,
	zoomColor,
	...props
}: Props) => {
	return (
		<Container id={id} data-container $isDebug={isDebug} {...props}>
			<StateProvider id={id}>
				<GraphId id={id}>
					<Pan refresh={refresh}>
						<Drag>
							<Tooltip>
								<Click onNodeClick={onNodeClick}>
									<SvgCanvast $isDebug={isDebug}>
										<SVGShadow />
										<SVGMarker />
										<SVGInnerShadow />
										<SVGStripes />
										<LineBox />
										<NodeBox data={data} iconSelector={iconSelector} spacing={spacing} />
										{isDebug && <Debug />}
									</SvgCanvast>
								</Click>
							</Tooltip>
						</Drag>
					</Pan>
					<ZoomTools autoCenter={autoCenter} zoomSmall={zoomSmall} zoomColor={zoomColor} />
				</GraphId>
			</StateProvider>
		</Container>
	)
}

const Container = styled.div<{ $isDebug: boolean }>`
	position: relative;
	height: 100%;
	overflow: hidden;
	cursor: grab;

	& * {
		pointer-events: none;
	}

	${({ $isDebug }) =>
		$isDebug &&
		`
			&::before {
				content: '';
				width: 0.5em;
				height: 0.5em;
				position: absolute;
				z-index: 1;
				top: calc(50% - 0.25em);
				left: calc(50% - 0.25em);
				background-color: red;
				border-radius: 50%;
			}
		`}
`

const SvgCanvast = styled.svg<{ $isDebug: boolean }>`
	width: 100%;
	height: 100%;
	overflow: visible;
	${({ $isDebug }) => $isDebug && 'background-color: #ff000040;'}

	/* Optimize text rendering */
	text-rendering: optimizeSpeed;

	/* Optimize shape rendering */
	shape-rendering: optimizeSpeed;

	/* Disable image smoothing for crisp edges */
	image-rendering: pixelated;
`
export default Flow
