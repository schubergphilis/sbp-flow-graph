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

	const updateChildNodeVisible = useCallback((id: string, element: SVGElement) => {
		const isVisible = document.querySelector(`[data-node-parent=${id}][data-node-visible=true]`) !== null
		element.setAttribute('data-node-children-visible', `${isVisible}`)
	}, [])

	const handleClick = useCallback(
		(ev: MouseEvent) => {
			const target = ev.target as SVGElement
			const element = target.closest('[data-node-id]') as SVGElement
			const isRoot = element?.hasAttribute('data-node-root')
			const hasChildren = element?.hasAttribute('data-node-children')

			if (!element || dragElement || isRoot || !hasChildren) return

			ev.stopPropagation()
			ev.preventDefault()

			const id = element.getAttribute('data-node-id') as string

			if (clickTimeout.current) clearTimeout(clickTimeout.current)

			clickTimeout.current = setTimeout(() => {
				dispatch(setVisibleState(id))
				setTimeout(() => updateChildNodeVisible(id, element), 1)
			}, 300)
		},
		[dispatch, dragElement, updateChildNodeVisible]
	)

	const handeDoubleClick = useCallback(
		(ev: MouseEvent) => {
			if (clickTimeout.current) clearTimeout(clickTimeout.current) // Cancel single-click action

			const target = ev.target as SVGElement
			const element = target.closest('[data-node-id]')

			if (!element || dragElement) return

			const referenceId = element.getAttribute('data-node-reference')?.replace(/^X/gim, '') as string

			if (onNodeClick) onNodeClick(referenceId ?? '')

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
