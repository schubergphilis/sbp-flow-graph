import { useAppDispatch } from '@hooks/ReduxStore'
import { setGraphIdState } from '@store/SettingsSlice'

import { memo, useLayoutEffect } from 'react'

interface Props {
	id: string
}
const GraphId = memo(({ id }: Props) => {
	const dispatch = useAppDispatch()

	useLayoutEffect(() => {
		dispatch(setGraphIdState(id))
	}, [dispatch, id])

	return null
})

export default GraphId
