import { useAppDispatch } from '@hooks/ReduxStore'
import { setGraphIdState } from '@store/SettingsSlice'

import { useLayoutEffect } from 'react'

interface Props {
	id: string
	children: JSX.Element | JSX.Element[]
}
const GraphId = ({ children, id }: Props) => {
	const dispatch = useAppDispatch()

	useLayoutEffect(() => {
		dispatch(setGraphIdState(id))
	}, [dispatch, id])

	return <>{children}</>
}

export default GraphId
