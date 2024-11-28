import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AutoPosition } from '../helpers/AutoPosition'
import { useAppSelector } from '../hooks/ReduxStore'
import PositionModel from '../models/PositionModel'
import { ProcessModel } from '../models/ProcessModel'
import { getPanPositionState, getZoomLevelState } from '../store/SettingsSlice'
import FlowNode from './FlowNode'

interface Props {
	data: ProcessModel[]
}

const NodeBox = ({ data }: Props) => {
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)

	const [isTriggered, setIsTriggered] = useState<boolean>(false)

	const timerRef = useRef<NodeJS.Timeout>()

	useEffect(() => {
		if (isTriggered) return
		timerRef.current = setTimeout(() => AutoPosition(panPosition, zoomLevel, 50), 1)
		setIsTriggered(true)
	}, [isTriggered, panPosition, zoomLevel])

	return (
		<Container data-node-group>
			{data
				// .slice(0, 2)
				// .reverse()
				.map((node, index) => (
					<FlowNode key={index} data={node} />
				))}
		</Container>
	)
}

const Container = styled.g``

export default NodeBox
