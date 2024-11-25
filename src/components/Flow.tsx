import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { AutoPosition } from '../helpers/AutoPosition'
import { ProcessModel } from '../models/ProcessModel'
import Debug from './Debug'
import Drag from './Drag'
import FlowNode from './FlowNode'
import LineBox from './LineBox'
import Pan from './Pan'
import Provider from './Provider'
import Zoom from './Zoom'

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
				<Zoom>
					<Drag>
						<SvgCanvast>
							<LineBox />
							{data
								//.slice(0, 2)
								//.reverse()
								.map((node, index) => (
									<FlowNode key={index} data={node} />
								))}
							<Debug isDebug={true} />
						</SvgCanvast>
					</Drag>
				</Zoom>
			</Pan>
		</Provider>
	)
}

const SvgCanvast = styled.svg`
	width: 100%;
	height: 100%;
	overflow: visible;
`
export default Flow
