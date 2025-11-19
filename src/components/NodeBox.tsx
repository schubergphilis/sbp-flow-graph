import { useAppSelector } from '@hooks/ReduxStore'
import ProcessModel from '@models/ProcessModel'
import { getGraphIdState, getProcessedDataListState } from '@store/SettingsSlice'
import { memo } from 'react'
import styled from 'styled-components'
import FlowNode from './FlowNode'

interface Props {
	iconSelector?: (name: string) => JSX.Element
}

const NodeBox = memo(
	({ iconSelector }: Props) => {
		const graphId = useAppSelector<string>(getGraphIdState)
		const processedDataList = useAppSelector<ProcessModel[] | undefined>(getProcessedDataListState)

		return (
			<Container data-node-group>
				{processedDataList?.map((node) => (
					<FlowNode key={`node_${graphId}_${node.id}`} data={node} iconSelector={iconSelector} />
				))}
			</Container>
		)
	},
	(prevProps, nextProps) => {
		// Custom comparison for better memoization
		return prevProps.iconSelector === nextProps.iconSelector
	}
)

const Container = styled.g``

export default NodeBox
