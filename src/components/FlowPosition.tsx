import { AutoPosition } from '@helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { useDidMountEffect } from '@hooks/UseDidMountEffect'
import NodeModel from '@models/NodeModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import {
	deleteSelectedElementState,
	getDataListState,
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getPositionListState,
	getProcessedDataListState,
	getSelectedElementState,
	getVisibilityListState,
	getZoomLevelState,
	setDataListState,
	setInitialVisibleState,
	setLoadedState,
	setPositionListState,
	setProcessedDataListState
} from '@store/SettingsSlice'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Props {
	data?: ProcessModel[]
	children: JSX.Element | ReactNode
	spacing?: number
}

const FlowPosition = ({ data, children, spacing }: Props) => {
	const rootId = data?.find(({ root }) => root)?.id ?? ''

	const dispatch = useAppDispatch()

	const graphId = useAppSelector<string>(getGraphIdState)
	const dataList = useAppSelector<ProcessModel[] | undefined>(getDataListState)
	const processedDataList = useAppSelector<ProcessModel[] | undefined>(getProcessedDataListState)
	const positionList = useAppSelector<NodeModel[] | undefined>(getPositionListState)
	const visibilityList = useAppSelector<string[] | undefined>(getVisibilityListState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const selectedElement = useAppSelector<string | undefined>(getSelectedElementState)

	const [isPositioned, setIsPositioned] = useState<boolean>(false)

	const prevDataListRef = useRef<ProcessModel[] | undefined>(undefined)

	const createOptimizedDataList = useCallback(
		(data: ProcessModel[]) => {
			const parentMap = new Map<string, ProcessModel[]>()
			// Build parent-child relationships efficiently
			data.forEach((item) => {
				if (item.parent) {
					if (!parentMap.has(item.parent)) {
						parentMap.set(item.parent, [])
					}
					parentMap.get(item.parent)!.push(item)
				}
			})

			const result = data.map<ProcessModel>((item) => {
				const children = parentMap.get(item.id) || []
				const hasChildren = children.length > 0
				const childStatus = children.find(({ status }) => status !== 'Success' && status !== 'Unknown')?.status

				const isNewNode = prevDataListRef.current ? !prevDataListRef.current.find(({ id }) => id === item.id) : false
				const isChildrenVisible = visibilityList?.includes(children[0]?.id ?? '')
				const isParentVisible = item.parent ? visibilityList?.includes(item.parent) : false
				const isSelfVisible = visibilityList?.includes(item.id)
				const isVisible =
					isSelfVisible ||
					isChildrenVisible ||
					(isParentVisible && isNewNode) ||
					item.id === rootId ||
					item.parent === rootId

				return {
					...item,
					hasChildren: hasChildren || undefined,
					childStatus,
					isVisible
				}
			})

			return result
		},
		[visibilityList, rootId]
	)

	// Memoize data processing with better dependency tracking
	const getProcessedDataList = useMemo((): ProcessModel[] => {
		if (!dataList) return []
		prevDataListRef.current = dataList
		return dataList.filter(({ isVisible }) => isVisible)
	}, [dataList])

	const schedulePositioning = useCallback(() => {
		const offset = {
			x: (panPosition?.x ?? 0) + pageOffset.x,
			y: (panPosition?.y ?? 0) + pageOffset.y
		}

		const list = AutoPosition(graphId, selectedElement, processedDataList, positionList, offset, zoomLevel, spacing)

		if (list.length > 0) {
			dispatch(setPositionListState(list))
		}

		setIsPositioned(true)
		dispatch(setLoadedState())
	}, [
		dispatch,
		graphId,
		pageOffset.x,
		pageOffset.y,
		panPosition?.x,
		panPosition?.y,
		positionList,
		processedDataList,
		selectedElement,
		spacing,
		zoomLevel
	])

	// Optimized positioning with better scheduling
	useEffect(() => {
		if (isPositioned || !processedDataList?.length) return
		schedulePositioning()
	}, [isPositioned, processedDataList, schedulePositioning])

	useEffect(() => {
		if (getProcessedDataList.length === 0) return
		dispatch(setProcessedDataListState(getProcessedDataList))
	}, [dispatch, getProcessedDataList])

	useEffect(() => {
		if (!data) return

		const list = createOptimizedDataList(data)

		dispatch(setDataListState(list))
		dispatch(setInitialVisibleState(rootId))
	}, [data, createOptimizedDataList, dispatch, rootId])

	useDidMountEffect(() => {
		if (!data) return
		dispatch(deleteSelectedElementState())
	}, [data])

	useEffect(() => {
		setIsPositioned(false)
	}, [data, processedDataList])

	return <>{children}</>
}

export default FlowPosition
