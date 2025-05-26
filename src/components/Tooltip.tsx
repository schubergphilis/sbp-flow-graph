import { parser } from '@gmtdi/frontend-shared-components'
import { getNodePosition } from '@helpers/AutoPosition'
import { useAppSelector } from '@hooks/ReduxStore'
import PositionModel from '@models/PositionModel'
import { getDragElementState, getPagetOffsetState, getPanPositionState, getZoomLevelState } from '@store/SettingsSlice'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
	children: JSX.Element
}

const Tooltip = ({ children }: Props) => {
	const tooltipRef = useRef<HTMLDivElement>(null)

	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const zoomLevel = useAppSelector<number>(getZoomLevelState)
	const panPosition = useAppSelector<PositionModel | undefined>(getPanPositionState)
	const pageOffset = useAppSelector<PositionModel>(getPagetOffsetState)

	const [tooltip, setTooltip] = useState<string | null>(null)
	const [position, setPosition] = useState<PositionModel>({ x: 0, y: 0 })
	const [element, setElement] = useState<SVGElement | null>(null)

	const handleMove = useCallback(
		(ev: MouseEvent) => {
			const element = ev.target as SVGElement
			const hasTooltip = element.hasAttribute('data-node-tooltip')

			if (!hasTooltip) {
				setTooltip(null)
				setElement(null)
				return
			}

			if (tooltip) {
				return
			}

			setTooltip(element.getAttribute('data-node-tooltip'))
			setElement(element)

			ev.stopPropagation()
			ev.preventDefault()
		},
		[tooltip]
	)

	useEffect(() => {
		if (!element) return

		const xoffset = { x: (panPosition?.x ?? 0) + pageOffset.x, y: (panPosition?.y ?? 0) + pageOffset.y }

		const offset = getNodePosition(element, xoffset, zoomLevel)
		const size = getNodePosition(tooltipRef.current, xoffset, zoomLevel)

		setPosition({ x: offset.x - size.width / 2, y: offset.y - offset.height - size.height / 1.25 })
	}, [element, panPosition, zoomLevel, pageOffset])

	useEffect(() => {
		if (dragElement) {
			setTooltip(null)
			setElement(null)
			return
		}

		document.addEventListener('mousemove', handleMove)

		return () => {
			document.removeEventListener('mousemove', handleMove)
		}
	}, [dragElement, handleMove])

	return (
		<>
			<TooltipBox
				data-tooltip
				ref={tooltipRef}
				style={{ top: position.y, left: position.x }}
				$isActive={tooltip !== null}>
				{parser((tooltip ?? '').replace(/\\r\\n/gim, '<br/>'))}
			</TooltipBox>
			{children}
		</>
	)
}

const TooltipBox = styled.div<{ $isActive: boolean }>`
	position: absolute;
	z-index: 2;
	padding: 1em;
	border-radius: ${({ theme }) => theme.style.radius}px;
	color: ${({ theme }) => theme.style.tooltipColor};
	background-color: ${({ theme }) => theme.style.tooltipColorBg};
	white-space: nowrap;
	opacity: 0;
	transition: none;

	&::before {
		content: '';
		display: block;

		pointer-events: none;
		position: absolute;
		border: 0.5rem solid;
		border-color: ${({ theme }) => theme.style.tooltipColorBg} transparent transparent transparent;

		height: 0;
		width: 0;
		left: calc(50% - 0.5rem);
		top: 100%;
	}

	${({ $isActive }) =>
		$isActive &&
		`
		transition: opacity 0.5s ease-in-out 0.25s;
		opacity: 1;
	`}
`
export default Tooltip
