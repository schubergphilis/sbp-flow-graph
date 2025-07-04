import { AutoPosition } from '@helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { useDidMountEffect } from '@hooks/UseDidMountEffect'
import NodeModel from '@models/NodeModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import {
	getDataListState,
	getPagetOffsetState,
	getPanPositionState,
	getPositionListState,
	getUpdateState,
	getZoomLevelState,
	setDataListState,
	setPositionListState
} from '@store/SettingsSlice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import FlowNode from './FlowNode'

interface Props {
	data?: ProcessModel[]
	iconSelector?: (name: string) => JSX.Element
	spacing?: number
}

const NodeBox = ({ data, iconSelector, spacing }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const positionList = useAppSelector<NodeModel[] | undefined>(getPositionListState)
	const pageOffset = useAppSelector<PositionModel>(getPagetOffsetState)

	const dataList = useAppSelector<ProcessModel[] | undefined>(getDataListState)
	const update = useAppSelector<number>(getUpdateState)

	const [isTriggered, setIsTriggered] = useState<boolean>(false)
	const [isPositioned, setIsPositioned] = useState<boolean>(false)

	const timerRef = useRef<NodeJS.Timeout>(undefined)

	const getDataList = useMemo(() => {
		return dataList?.filter((item) => positionList?.find(({ id }) => id === item.id))
	}, [dataList, positionList])

	const getInitialPositionList = useCallback((): NodeModel[] | undefined => {
		const root = data?.find(({ root }) => root)

		return data?.map(({ id, parent }) => ({
			id: id,
			isVisible: id === root?.id || parent === root?.id ? true : false,
			x: 0,
			y: 0
		}))
	}, [data])

	const createDataList = useCallback(
		(data: ProcessModel[]) => {
			return data.map((item) => {
				const hasChildren = data.find(({ parent }) => parent === item.id) ? true : undefined
				const childStatus = data.find(
					({ parent, status }) => parent === item.id && status !== 'Success' && status !== 'Unknown'
				)?.status

				const isVisible = positionList?.find(({ id }) => id === item.id)?.isVisible ?? false

				return { ...item, hasChildren: hasChildren, childStatus: childStatus, isVisible: isVisible }
			})
		},
		[positionList]
	)

	useDidMountEffect(() => {
		if (isTriggered || (positionList && positionList.length > 0) || dataList?.length === 0) return

		const list = getInitialPositionList()

		if (!list) return

		dispatch(setPositionListState(list))
		setIsTriggered(true)
	}, [dispatch, getInitialPositionList, isTriggered, positionList])

	useEffect(() => {
		if (!data) return
		const list = createDataList(data)

		dispatch(setDataListState(list))
	}, [dispatch, createDataList, data])

	useEffect(() => {
		const dataList = getDataList

		if (isPositioned || !dataList) return

		const offset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

		timerRef.current = setTimeout(() => {
			const list = AutoPosition(dataList, positionList, offset, zoomLevel, spacing)

			if (list.length > 0) {
				dispatch(setPositionListState(list))
				console.log('--- auto position ---')
			}

			setIsPositioned(true)
		}, 1)
	}, [dispatch, getDataList, isPositioned, panPosition, positionList, spacing, zoomLevel, pageOffset])

	useDidMountEffect(() => {
		setIsPositioned(false)
	}, [update])

	return (
		<Container data-node-group>
			{getDataList?.map((node) => <FlowNode key={`node_${node.id}`} data={node} iconSelector={iconSelector} />)}
		</Container>
	)
}

const Container = styled.g``

export default NodeBox
