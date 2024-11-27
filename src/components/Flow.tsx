import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { AutoPosition } from '../helpers/AutoPosition'
import { ProcessModel } from '../models/ProcessModel'
import Debug from './Debug'
import Drag from './Drag'
import LineBox from './LineBox'
import NodeBox from './NodeBox'
import Pan from './Pan'
import Provider from './Provider'
import ZoomTools from './ZoomTools'

interface Props {
	data: ProcessModel[]
}
const Flow = ({ data }: Props) => {
	const timerRef = useRef<NodeJS.Timeout>()

	useEffect(() => {
		timerRef.current = setTimeout(AutoPosition, 1)
	}, [])

	return (
		<Provider>
			<Pan>
				<Drag>
					<SvgCanvast>
						<LineBox />
						<NodeBox data={data} />
						<Debug isDebug={true} />
					</SvgCanvast>
				</Drag>
			</Pan>
			<ZoomTools />
		</Provider>
	)
}

const SvgCanvast = styled.svg`
	width: 100%;
	height: 100%;
	overflow: visible;
`
export default Flow
