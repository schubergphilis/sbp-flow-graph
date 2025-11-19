import { StatusType } from '@datatypes/StatusType'
import { getNodePosition, getParentNode, getParentNodePosition } from '@helpers/AutoPosition'
import { useAppSelector } from '@hooks/ReduxStore'
import { useDidMountEffect } from '@hooks/UseDidMountEffect'
import LineModel from '@models/LineModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import {
	getGraphIdState,
	getPageOffsetState,
	getPanPositionState,
	getProcessedDataListState,
	getZoomLevelState
} from '@store/SettingsSlice'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Line from './Line'

const LineBox = () => {
	const graphId = useAppSelector<string>(getGraphIdState)
	const processedDataList = useAppSelector<ProcessModel[] | undefined>(getProcessedDataListState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const pageOffset = useAppSelector<PositionModel>(getPageOffsetState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)

	const [lines, setLines] = useState<LineModel[]>()
	const [isPositioned, setIsPositioned] = useState<boolean>(false)

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

				const element = node.querySelector('[data-node-status]') as SVGElement

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

			setIsPositioned(true)

			return lineList
		},
		[graphId, pageOffset.x, pageOffset.y, panPosition?.x, panPosition?.y, zoomLevel]
	)

	const setStaticLines = useCallback(() => {
		if (!processedDataList) return
		const list = getDataList(processedDataList?.map(({ id }) => id) ?? [])
		setLines(list)
	}, [getDataList, processedDataList])

	useDidMountEffect(() => {
		if (!processedDataList) return
		setIsPositioned(false)
	}, [processedDataList])

	useEffect(() => {
		if (isPositioned) return
		setTimeout(setStaticLines, 1)
	}, [isPositioned, setStaticLines])

	return (
		<Container>
			{lines?.map((data) => (
				<Line key={`line_${graphId}_${data.id}`} data={data} />
			))}
		</Container>
	)
}

const Container = styled.g``

export default LineBox
