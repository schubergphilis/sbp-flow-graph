import { useAppDispatch, useAppSelector } from '@hooks/ReduxStore'
import { getDragElementState, getGraphIdState, setVisibleState } from '@store/SettingsSlice'
import { useCallback, useLayoutEffect, useRef } from 'react'

interface Props {
	children: JSX.Element
	onNodeClick?: (id: string) => void
}

const Click = ({ children, onNodeClick }: Props) => {
	const clickTimeout = useRef<NodeJS.Timeout>(undefined)

	const dispatch = useAppDispatch()
	const dragElement = useAppSelector<string | undefined>(getDragElementState)
	const graphId = useAppSelector<string>(getGraphIdState)

	const ref = useRef<HTMLDivElement>(null)

	const updateChildNodeVisible = useCallback(
		(id: string, element: SVGElement) => {
			const isVisible =
				document.getElementById(graphId)!.querySelector(`[data-node-parent=${id}][data-node-visible]`) !== null

			if (isVisible) {
				element.removeAttribute('data-node-children-visible')
			} else {
				element.setAttribute('data-node-children-visible', 'true')
			}
		},
		[graphId]
	)

	const handleClick = useCallback(
		(ev: MouseEvent) => {
			const target = ev.target as SVGElement
			const element = target.closest('[data-node]') as SVGElement
			const isRoot = element?.hasAttribute('data-node-root')
			const hasChildren = element?.hasAttribute('data-node-children')

			if (!element || dragElement || isRoot || !hasChildren) return

			ev.stopPropagation()
			ev.preventDefault()

			const id = element.id as string

			if (clickTimeout.current) clearTimeout(clickTimeout.current)

			clickTimeout.current = setTimeout(() => {
				dispatch(setVisibleState(id))
				updateChildNodeVisible(id, element)
			}, 300)
		},
		[dispatch, dragElement, updateChildNodeVisible]
	)

	const handeDoubleClick = useCallback(
		(ev: MouseEvent) => {
			if (clickTimeout.current) clearTimeout(clickTimeout.current) // Cancel single-click action

			const target = ev.target as SVGElement
			const element = target.closest('[data-node]')

			if (!element || dragElement) return

			const referenceId = element.getAttribute('data-node-reference')?.match(/(?<=_)([\w-]+)/gim)?.[0] as string

			if (onNodeClick) onNodeClick(referenceId ?? '')

			ev.stopPropagation()
			ev.preventDefault()
		},
		[dragElement, onNodeClick]
	)

	useLayoutEffect(() => {
		ref.current = document.getElementById(graphId) as HTMLDivElement

		ref.current?.addEventListener('dblclick', handeDoubleClick)
		ref.current?.addEventListener('mouseup', handleClick)

		return () => {
			ref.current?.removeEventListener('dblclick', handeDoubleClick)
			ref.current?.removeEventListener('mouseup', handleClick)
		}
	}, [handleClick, handeDoubleClick, graphId])

	return <>{children}</>
}

export default Click
