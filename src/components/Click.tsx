import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { getDragElementState, setVisibleState } from '@store/SettingsSlice'
import { useCallback, useLayoutEffect, useRef } from 'react'

interface Props {
	children: JSX.Element
	onNodeClick?: (id: string) => void
}

const Click = ({ children, onNodeClick }: Props) => {
	const clickTimeout = useRef<NodeJS.Timeout>(undefined)

	const dispatch = useAppDispatch()
	const dragElement = useAppSelector<string | undefined>(getDragElementState)

	const handleClick = useCallback(
		(ev: MouseEvent) => {
			const target = ev.target as SVGElement
			const element = target.closest('[data-node-id]')
			const isRoot = element?.hasAttribute('data-node-root')
			const hasChildren = element?.hasAttribute('data-node-children')

			if (!element || dragElement || isRoot || !hasChildren) return

			ev.stopPropagation()
			ev.preventDefault()

			const id = element.getAttribute('data-node-id') as string

			if (clickTimeout.current) clearTimeout(clickTimeout.current)

			clickTimeout.current = setTimeout(() => {
				dispatch(setVisibleState(id))
			}, 500)
		},
		[dispatch, dragElement]
	)

	const handeDoubleClick = useCallback(
		(ev: MouseEvent) => {
			if (clickTimeout.current) clearTimeout(clickTimeout.current) // Cancel single-click action

			const target = ev.target as SVGElement
			const element = target.closest('[data-node-id]')

			if (!element || dragElement) return

			const id = element.getAttribute('data-node-id') as string

			if (onNodeClick) onNodeClick(id.replace(/^X/gim, ''))

			ev.stopPropagation()
			ev.preventDefault()
		},
		[dragElement, onNodeClick]
	)

	useLayoutEffect(() => {
		document.addEventListener('dblclick', handeDoubleClick)
		document.addEventListener('mouseup', handleClick)

		return () => {
			document.removeEventListener('dblclick', handeDoubleClick)
			document.removeEventListener('mouseup', handleClick)
		}
	}, [handleClick, handeDoubleClick])

	return <>{children}</>
}

export default Click
