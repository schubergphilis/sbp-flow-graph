import { StatusType } from '@datatypes/StatusType'
import { getNodePosition, getParentNode, getParentNodePosition } from '@helpers/AutoPosition'
import { useAppSelector } from '@hooks/ReduxStore'
import LineModel from '@models/LineModel'
import PositionModel from '@models/PositionModel'
import {
	getDataListState,
	getDragElementState,
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getPositionListState,
	getUpdateState,
	getZoomLevelState
} from '@store/SettingsSlice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual } from 'react-redux'
import styled from 'styled-components'
import Line from './Line'

const LineBox = () => {
	// Memoize selectors to prevent unnecessary re-renders
	const { zoomLevel, panPosition, pageOffset, positionList, graphId, dataList, dragElement, update } = useAppSelector(
		(state) => ({
			zoomLevel: getZoomLevelState(state),
			panPosition: getPanPositionState(state),
			pageOffset: getPageOffsetState(state),
			positionList: getPositionListState(state),
			graphId: getGraphIdState(state),
			dataList: getDataListState(state),
			dragElement: getDragElementState(state),
			update: getUpdateState(state)
		}),
		shallowEqual // Shallow comparison for better performance
	)

	const [staticNodes, setStaticNodes] = useState<string[]>([])
	const [dynamicNodes, setDynamicNodes] = useState<string[]>([])
	const [dynamicLines, setDynamicLines] = useState<LineModel[]>([])

	const timerRef = useRef<NodeJS.Timeout>(undefined)
	const updateRef = useRef<NodeJS.Timeout>(undefined)
	const rafRef = useRef<number | null>(null)

	const getDataList = useCallback(
		(list: string[]): LineModel[] => {
			const lineList: LineModel[] = []

			const offset: PositionModel = {
				x: (panPosition?.x ?? 0) + pageOffset.x,
				y: (panPosition?.y ?? 0) + pageOffset.y
			}

			for (let i = 0; i < list.length; i++) {
				const id = list[i]
				const node = document.getElementById(`X${graphId}_${id}`) as SVGGElement | null

				if (!node || node.hasAttribute('data-node-root')) continue

				const element = node.querySelector('circle, rect, polygon') as SVGElement

				lineList.push({
					start: getNodePosition(element, offset, zoomLevel),
					end: getParentNodePosition(node, offset, zoomLevel),
					id: node.id as string,
					parentId: node.getAttribute('data-node-parent') as string,
					info: node.getAttribute('data-node-info') as string,
					tooltip: node.getAttribute('data-node-info-tooltip') as string,
					startSize: Number(node.getAttribute('data-node-size') ?? 0),
					endSize: Number(getParentNode(node)?.getAttribute('data-node-size') ?? 0),
					status: `${element?.getAttribute('data-node-status') as StatusType}`
				})
			}

			return lineList
		},
		[graphId, pageOffset, panPosition, zoomLevel]
	)

	const updateAllLines = useCallback(() => {
		const rootId = dataList?.find(({ root }) => root)?.id ?? ''
		const visibleNodes =
			dataList
				?.filter((item) => positionList?.find(({ id }) => id === item.id && id !== rootId)?.isVisible)
				.map(({ id }) => id) ?? []

		setStaticNodes(visibleNodes)
	}, [dataList, positionList])

	const setSelectedLines = useCallback(() => {
		const selectedNodes =
			dataList
				?.filter(
					({ id, parent }) =>
						positionList?.find((item) => id === item.id)?.isVisible && (parent === dragElement || id === dragElement)
				)
				.map(({ id }) => id) ?? []

		setDynamicNodes(selectedNodes)
	}, [dataList, dragElement, positionList])

	const updateDynamicLines = useCallback(() => {
		if (!dragElement) return
		if (rafRef.current) cancelAnimationFrame(rafRef.current)

		rafRef.current = requestAnimationFrame(() => {
			const lines = getDataList(dynamicNodes)
			setDynamicLines(lines)
		})
	}, [dragElement, dynamicNodes, getDataList])

	const staticLines = useMemo(() => {
		const list = staticNodes.filter((id) => !dynamicNodes.includes(id))
		return getDataList(list)
	}, [staticNodes, dynamicNodes, getDataList])

	useEffect(() => {
		if (dragElement) return
		timerRef.current = setTimeout(updateAllLines, 20)
	}, [dragElement, zoomLevel, update, updateAllLines])

	useEffect(() => {
		if (!dragElement) return

		updateRef.current = setInterval(updateDynamicLines, 20)

		return () => {
			clearInterval(updateRef.current)
		}
	}, [dragElement, updateDynamicLines])

	useEffect(() => {
		if (!dragElement) return
		setSelectedLines()
	}, [dragElement, setSelectedLines])

	useEffect(() => {
		if (dragElement) return

		clearInterval(updateRef.current)
		cancelAnimationFrame(rafRef.current ?? 0)
		setDynamicNodes([])
		setDynamicLines([])
	}, [dragElement, updateAllLines])

	return (
		<Container>
			{staticLines.map((data) => (
				<Line key={`line_${graphId}_${data.id}`} data={data} />
			))}
			{dynamicLines?.map((data) => (
				<Line key={`line_dragged_${graphId}_${data.id}`} data={data} dragged />
			))}
		</Container>
	)
}

const Container = styled.g`
	/* Enable GPU acceleration */
	transform: translateZ(0);

	/* Optimize compositing */
	isolation: isolate;
`

export default LineBox
