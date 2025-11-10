import { AutoPosition } from '@helpers/AutoPosition'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { useDidMountEffect } from '@hooks/UseDidMountEffect'
import ProcessModel from '@models/ProcessModel'
import {
	deleteSelectedElementState,
	getDataListState,
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getPositionListState,
	getSelectedElementState,
	getUpdateState,
	getZoomLevelState,
	setDataListState,
	setLoadedState,
	setPositionListState
} from '@store/SettingsSlice'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual } from 'react-redux'
import styled from 'styled-components'
import FlowNode from './FlowNode'

interface Props {
	data?: ProcessModel[]
	iconSelector?: (name: string) => JSX.Element
	spacing?: number
}

const NodeBox = memo(
	({ data, iconSelector, spacing }: Props) => {
		const dispatch = useAppDispatch()

		// Memoize selectors to prevent unnecessary re-renders
		const { zoomLevel, panPosition, positionList, pageOffset, graphId, dataList, update, selectedElement } =
			useAppSelector(
				(state) => ({
					zoomLevel: getZoomLevelState(state),
					panPosition: getPanPositionState(state),
					positionList: getPositionListState(state),
					pageOffset: getPageOffsetState(state),
					graphId: getGraphIdState(state),
					dataList: getDataListState(state),
					update: getUpdateState(state),
					selectedElement: getSelectedElementState(state)
				}),
				shallowEqual // Shallow comparison for better performance
			)

		const [isPositioned, setIsPositioned] = useState<boolean>(false)

		const positioningRef = useRef<boolean>(false)

		// Memoize data processing with better dependency tracking
		const processedDataList = useMemo(() => {
			if (!dataList) return []

			const rootId = dataList.find(({ root }) => root)?.id ?? ''

			return dataList.map((item) => {
				const position = positionList?.find(({ id }) => id === item.id)

				const child = dataList.find(({ parent }) => parent && parent === item.parent)
				const isChildrenVisible = positionList?.find(({ id }) => id === child?.id)?.isVisible

				const isVisible = position?.isVisible ?? isChildrenVisible ?? (item.id === rootId || item.parent === rootId)
				const hasChildren = dataList.some(({ parent }) => parent === item.id)
				const childStatus = dataList.find(
					({ parent, status }) => parent === item.id && status !== 'Success' && status !== 'Unknown'
				)?.status

				return {
					...item,
					isVisible,
					hasChildren: hasChildren || undefined,
					childStatus
				}
			})
		}, [dataList, positionList])

		// Optimized data creation with reduced complexity
		const createOptimizedDataList = useCallback((inputData?: ProcessModel[]) => {
			if (!inputData || !inputData?.length) return []

			const root = inputData.find(({ root }) => root)
			const parentMap = new Map<string, ProcessModel[]>()

			// Build parent-child relationships efficiently
			inputData.forEach((item) => {
				if (item.parent) {
					if (!parentMap.has(item.parent)) {
						parentMap.set(item.parent, [])
					}
					parentMap.get(item.parent)!.push(item)
				}
			})

			return inputData.map((item) => {
				const children = parentMap.get(item.id) || []
				const hasChildren = children.length > 0
				const childStatus = children.find(({ status }) => status !== 'Success' && status !== 'Unknown')?.status

				const isVisible = item.id === root?.id || item.parent === root?.id

				return {
					...item,
					hasChildren: hasChildren || undefined,
					childStatus,
					isVisible
				}
			})
		}, [])

		// Debounced data list update
		useEffect(() => {
			const timeoutId = setTimeout(() => {
				const list = createOptimizedDataList(data)
				dispatch(setDataListState(list))
			}, 0) // Use 0 for next tick, avoiding blocking

			return () => clearTimeout(timeoutId)
		}, [data, createOptimizedDataList, dispatch])

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
			positioningRef.current = false
			dispatch(setLoadedState())
		}, [
			dispatch,
			panPosition,
			graphId,
			pageOffset,
			positionList,
			processedDataList,
			selectedElement,
			spacing,
			zoomLevel
		])

		// Optimized positioning with better scheduling
		useEffect(() => {
			if (isPositioned || !processedDataList?.length || positioningRef.current) return

			positioningRef.current = true

			schedulePositioning()
		}, [isPositioned, processedDataList?.length, schedulePositioning])

		// Reset positioning state efficiently
		useDidMountEffect(() => {
			setIsPositioned(false)
			positioningRef.current = false
		}, [update, data])

		useDidMountEffect(() => {
			dispatch(deleteSelectedElementState())
		}, [data])

		return (
			<Container data-node-group>
				{processedDataList.map((node) => (
					<FlowNode key={`node_${graphId}_${node.id}`} data={node} iconSelector={iconSelector} />
				))}
			</Container>
		)
	},
	(prevProps, nextProps) => {
		// Custom comparison for better memoization
		return (
			prevProps.data === nextProps.data &&
			prevProps.spacing === nextProps.spacing &&
			prevProps.iconSelector === nextProps.iconSelector
		)
	}
)

const Container = styled.g``

export default NodeBox
