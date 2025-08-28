import { elementGroupCenter } from '@helpers/Helpers'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { CssColorType } from '@schubergphilis/sbp-frontend-style'
import { getGraphIdState, getLoadedState, getZoomLevelState, setPanPositionState } from '@store/SettingsSlice'
import { useCallback, useEffect } from 'react'
import CenterIcon from './icons/CenterIcon'
import { ActionButton } from './ZoomTools'

interface Props {
	autoCenter?: boolean
	color?: CssColorType
}

const CenterTool = ({ autoCenter, color }: Props) => {
	const dispatch = useAppDispatch()
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const graphId = useAppSelector<string>(getGraphIdState)
	const loaded = useAppSelector<number | undefined>(getLoadedState)

	const handleClick = useCallback(() => {
		const target = document.getElementById(graphId)?.querySelector<HTMLDivElement>('[data-pan]')

		const group = Array.from(
			document.getElementById(graphId)?.querySelectorAll<SVGElement>('[data-node-group] [data-node-visible]') ?? []
		)

		if (group.length === 0) return

		const tar = target?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 }

		const tarX = Math.round(tar.x)
		const tarY = Math.round(tar.y)
		const tarWidth = Math.round(tar.width / zoomLevel)
		const tarHeight = Math.round(tar.height / zoomLevel)

		const pos = elementGroupCenter(group)

		const posX = Math.round(pos.x - tarX)
		const posY = Math.round(pos.y - tarY)

		const centerX = Math.round(tarWidth / 2 - posX - pos.width / 2)
		const centerY = Math.round(tarHeight / 2 - posY - pos.height / 2)

		// console.table([
		// 	{ type: 'pos', x: posX, y: posY, width: pos.width, height: pos.height },
		// 	{ type: 'tar', x: tarX, y: tarY, width: tar.width, height: tar.height }
		// ])

		dispatch(setPanPositionState({ x: centerX, y: centerY }))

		target?.setAttribute('style', `transform: translate3d(${centerX}px, ${centerY}px, 0) scale(${zoomLevel})`)
	}, [graphId, zoomLevel, dispatch])

	useEffect(() => {
		if (!loaded || !autoCenter) return
		setTimeout(handleClick, 1)
	}, [loaded, autoCenter, handleClick])

	return (
		<ActionButton onClick={handleClick} title="Center canvas" $color={color}>
			<CenterIcon />
		</ActionButton>
	)
}

export default CenterTool
