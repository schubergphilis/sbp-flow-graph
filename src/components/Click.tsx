import { useCallback, useLayoutEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/ReduxStore'
import { getDragElementState, setVisibleState } from '../store/SettingsSlice'

interface Props {
	children: JSX.Element
}

const Click = ({ children }: Props) => {
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
			console.log('---- Node Click ----', element.getAttribute('data-node-id'))

			dispatch(setVisibleState(id))
		},
		[dispatch, dragElement]
	)

	useLayoutEffect(() => {
		document.addEventListener('mouseup', handleClick)

		return () => {
			document.removeEventListener('mouseup', handleClick)
		}
	}, [handleClick])

	return <>{children}</>
}

export default Click
