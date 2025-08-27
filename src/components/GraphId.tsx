import { useAppDispatch } from '@hooks/ReduxStore'
import { setGraphIdState } from '@store/SettingsSlice'

import { memo, useLayoutEffect } from 'react'

interface Props {
	id: string
	children: JSX.Element | JSX.Element[]
}
const GraphId = memo(({ children, id }: Props) => {
	const dispatch = useAppDispatch()

	useLayoutEffect(() => {
		dispatch(setGraphIdState(id))
	}, [dispatch, id])

	return <>{children}</>
})

export default GraphId
