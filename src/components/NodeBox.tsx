import styled from 'styled-components'
import { ProcessModel } from '../models/ProcessModel'
import FlowNode from './FlowNode'

interface Props {
	data: ProcessModel[]
}

const NodeBox = ({ data }: Props) => {
	return (
		<Container data-node-group>
			{data
				//.slice(0, 2)
				//.reverse()
				.map((node, index) => (
					<FlowNode key={index} data={node} />
				))}
		</Container>
	)
}

const Container = styled.g``

export default NodeBox
