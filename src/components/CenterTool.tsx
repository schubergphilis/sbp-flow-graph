import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { getDataListState, getGraphIdState, getZoomLevelState, setPanPositionState } from '@store/SettingsSlice'
import { ProcessModel } from 'build'
import { useCallback, useEffect } from 'react'
import CenterIcon from './icons/CenterIcon'
import { ActionButton } from './ZoomTools'

interface Props {
	autoCenter?: boolean
}

const CenterTool = ({ autoCenter }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const graphId = useAppSelector<string>(getGraphIdState)
	const dataList = useAppSelector<ProcessModel[] | undefined>(getDataListState)

	const handleClick = useCallback(() => {
		const group = document.getElementById(graphId)?.querySelector<SVGElement>('[data-node-group]')
		const target = document.getElementById(graphId)?.querySelector<HTMLDivElement>('[data-pan]')

		const tar = target?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 }
		const tarX = Math.round(tar.x)
		const tarY = Math.round(tar.y)
		const tarWidth = Math.round(tar.width / zoomLevel)
		const tarHeight = Math.round(tar.height / zoomLevel)

		const pos = group?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 }
		const posX = Math.round(pos.x - tarX)
		const posY = Math.round(pos.y - tarY)

		const centerX = Math.round(tarWidth / 2 - posX - pos.width / 2)
		const centerY = Math.round(tarHeight / 2 - posY - pos.height / 2)

		// console.table([
		// 	{ type: 'pos', x: posX, y: posY, width: pos.width, height: pos.height },
		// 	{ type: 'tar', x: tarX, y: tarY, width: tar.width, height: tar.height }
		// ])

		dispatch(setPanPositionState({ x: centerX, y: centerY }))

		target?.setAttribute('style', `transform: translate(${centerX}px, ${centerY}px) scale(${zoomLevel})`)
	}, [dispatch, zoomLevel, graphId])

	useEffect(() => {
		if (!dataList || !autoCenter) return
		handleClick()
	}, [dataList, autoCenter, handleClick])

	return (
		<ActionButton onClick={handleClick} title="Center canvas">
			<CenterIcon />
		</ActionButton>
	)
}

export default CenterTool
