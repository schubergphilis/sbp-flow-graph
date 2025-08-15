import { createAppStore } from '@store/Store'
import { useMemo } from 'react'
import { Provider } from 'react-redux'

interface Props {
	id: string
	children: JSX.Element | JSX.Element[]
}

export const StateProvider = ({ children, id }: Props) => {
	const store = useMemo(() => createAppStore(id), [id])

	return <Provider store={store}>{children}</Provider>
}

export default StateProvider
