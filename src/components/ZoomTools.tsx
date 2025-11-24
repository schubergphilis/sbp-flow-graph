import { closestNumber, generateSteps } from '@helpers/Helpers'
import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { CssColorType } from '@schubergphilis/sbp-frontend-style'
import {
	getGraphIdState,
	getShowInfoState,
	getShowResponsiveTextState,
	getZoomLevelState,
	setShowInfoState,
	setShowResponsiveTextState,
	setZoomLevelState
} from '@store/SettingsSlice'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ActionButton } from './ActionButton'
import CenterTool from './CenterTool'
import AddIcon from './icons/AddIcon'
import FormatSizeIcon from './icons/FormatSizeIcon'
import InfoIcon from './icons/InfoIcon'
import RemoveIcon from './icons/RemoveIcon'

interface Props {
	autoCenter?: boolean
	zoomSmall?: boolean
	zoomColor?: CssColorType
}
const ZoomTools = ({ autoCenter, zoomSmall = false, zoomColor }: Props) => {
	const minZoom: number = 0.2
	const maxZoom: number = 3
	const step: number = 0.2
	const zoomLevels: number[] = generateSteps(minZoom, maxZoom, step)

	const dispatch = useAppDispatch()

	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const showInfo = useAppSelector<boolean>(getShowInfoState)
	const showResponsiveText = useAppSelector<boolean>(getShowResponsiveTextState)
	const graphId = useAppSelector<string>(getGraphIdState)

	const handelTextSize = useCallback(() => {
		dispatch(setShowResponsiveTextState(!showResponsiveText))
	}, [dispatch, showResponsiveText])

	const handleZoomLevel = useCallback(
		(level: number, delta: number) => {
			const newLevel = delta < 0 ? Math.max(minZoom, level) : Math.min(maxZoom, level)

			dispatch(setZoomLevelState(Math.round(newLevel * 100) / 100))
		},
		[dispatch]
	)

	const setZoom = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement>, delta: number) => {
			ev.preventDefault()
			ev.stopPropagation()

			const level = zoomLevel + step * delta
			const closest = closestNumber(zoomLevels, level)
			handleZoomLevel(closest, delta)
		},
		[handleZoomLevel, zoomLevel, zoomLevels]
	)

	const handleScroll = useCallback(
		(ev: WheelEvent) => {
			if (!ev.metaKey) return

			const delta = ev.deltaY
			const level = zoomLevel + delta / 100
			const newLevel = delta < 0 ? Math.max(minZoom, level) : Math.min(maxZoom, level)
			handleZoomLevel(newLevel, delta)
		},
		[handleZoomLevel, zoomLevel]
	)

	const handleShowInfo = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement>) => {
			if (ev.altKey || ev.shiftKey) {
				localStorage.removeItem(`${graphId}State`)
				location.reload()
				return
			}

			dispatch(setShowInfoState(!showInfo))
		},
		[dispatch, showInfo, graphId]
	)

	useEffect(() => {
		document.getElementById(graphId)?.addEventListener('wheel', handleScroll)

		return () => {
			document.getElementById(graphId)?.removeEventListener('wheel', handleScroll)
		}
	}, [handleScroll, graphId])

	return (
		<Container $zoomSmall={zoomSmall}>
			<Level>
				<span>{Math.round(zoomLevel * 100) / 100}</span>
			</Level>

			<ZoomInButton
				disabled={maxZoom === zoomLevel}
				title="Zoom in"
				type="button"
				onClick={(ev) => setZoom(ev, 1)}
				$color={zoomColor}>
				<AddIcon />
			</ZoomInButton>
			<CenterTool autoCenter={autoCenter} color={zoomColor} />
			<ZoomOutButton
				disabled={minZoom === zoomLevel}
				type="button"
				title="Zoom out"
				onClick={(ev) => setZoom(ev, -1)}
				$color={zoomColor}>
				<RemoveIcon />
			</ZoomOutButton>

			<InfoButton $isSelected={showInfo} onClick={handleShowInfo} title="Show importance weights" $color={zoomColor}>
				<InfoIcon />
			</InfoButton>

			<ResponsiveButton
				$isSelected={showResponsiveText}
				onClick={handelTextSize}
				title="Toggle text sizes"
				$color={zoomColor}>
				<FormatSizeIcon />
			</ResponsiveButton>
		</Container>
	)
}

const Container = styled.div<{ $zoomSmall: boolean }>`
	position: absolute;
	bottom: 0;
	right: 0;
	margin: 0em;
	z-index: 10;
	font-size: ${({ $zoomSmall }) => ($zoomSmall ? '0.75em' : '1em')};

	color: ${({ theme }) => theme.style.zoomToolColor};
	background: radial-gradient(${({ theme }) => theme.style.colorBg} 30%, transparent 75%);
	transform: scale3d(0.5, 0.5, 0.5);
	transition: 0.3s transform ease-in-out 1s;
	transform-origin: bottom right;

	&:hover {
		transform: scale3d(1, 1, 1);

		transition: 0.3s transform ease-in-out;
	}

	display: grid;
	grid-template-rows: repeat(3, minMax(4em, 1fr));
	grid-template-columns: repeat(3, minMax(4em, 1fr));
	grid-template-areas:
		'nothing selector info'
		'zoomOut level zoomIn'
		'fff responsive center';

	pointer-events: all !important;
`

const Level = styled.div`
	grid-area: level;
	justify-self: center;
	align-self: center;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 4em;
	height: 4em;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.style.colorSecondary};

	z-index: 1;

	padding: 0.5em;
	pointer-events: none;
	cursor: default;
`

const ZoomInButton = styled(ActionButton)`
	grid-area: zoomIn;
	font-size: 0.75em;
	border-radius: 50%;
	justify-self: center;
	align-self: center;
`
const ZoomOutButton = styled(ActionButton)`
	grid-area: zoomOut;
	font-size: 0.75em;
	border-radius: 50%;
	justify-self: center;
	align-self: center;
`
const InfoButton = styled(ActionButton)`
	grid-area: info;
	font-size: 0.75em;
	border-radius: 50%;
	justify-self: start;
	align-self: end;
`
const ResponsiveButton = styled(ActionButton)`
	grid-area: responsive;
	font-size: 0.75em;
	border-radius: 50%;
	justify-self: center;
	align-self: center;
`
export default ZoomTools
