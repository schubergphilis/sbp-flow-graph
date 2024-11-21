import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { AutoPosition } from '../helpers/AutoPosition'
import { ProcessModel } from '../models/ProcessModel'
import Debug from './Debug'
import FlowNode from './FlowNode'
import LineBox from './LineBox'
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
		<Container>
			<Zoom>
				<SvgCanvast>
					{data
						//.slice(0, 2)
						//.reverse()
						.map((node, index) => (
							<FlowNode key={index} data={node} />
						))}

					<LineBox />
					<Debug isDebug={false} />
				</SvgCanvast>
			</Zoom>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	height: 100%;
	overflow: visible;
`
const SvgCanvast = styled.svg`
	width: 100%;
	height: 100%;
`
export default Flow
