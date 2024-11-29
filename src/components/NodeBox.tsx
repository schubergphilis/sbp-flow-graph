import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AutoPosition } from '../helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '../hooks/ReduxStore'
import NodeModel from '../models/NodeModel'
import PositionModel from '../models/PositionModel'
import { ProcessModel } from '../models/ProcessModel'
import {
	getPanPositionState,
	getPositionListState,
	getZoomLevelState,
	setPositionListState
} from '../store/SettingsSlice'
import FlowNode from './FlowNode'

interface Props {
	data: ProcessModel[]
}

const NodeBox = ({ data }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const positionList = useAppSelector<NodeModel[] | undefined>(getPositionListState)

	const [isTriggered, setIsTriggered] = useState<boolean>(false)
	const [nodeList, setNodeList] = useState<NodeModel[]>([])

	const timerRef = useRef<NodeJS.Timeout>()

	console.log(positionList)

	useEffect(() => {
		if (isTriggered) return
		timerRef.current = setTimeout(() => {
			const list = AutoPosition(positionList, panPosition, zoomLevel, 50)
			setNodeList(list)
		}, 1)
		setIsTriggered(true)
	}, [isTriggered, panPosition, positionList, zoomLevel])

	useEffect(() => {
		if (nodeList.length === 0) return
		dispatch(setPositionListState(nodeList))
	}, [dispatch, nodeList])

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
