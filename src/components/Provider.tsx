import { createContext, useState } from 'react'
import styled from 'styled-components'
import GlobalStateModel from '../models/GlobalStateModel'
import StateModel from '../models/StateModel'

interface Props {
	children: JSX.Element | JSX.Element[]
}

// Create the Context
export const GlobalState = createContext<GlobalStateModel>({} as GlobalStateModel)

export const Provider = ({ children }: Props) => {
	const [state, setState] = useState<StateModel>({})

	return (
		<GlobalState.Provider value={{ state, setState }}>
			<Container data-container>{children}</Container>
		</GlobalState.Provider>
	)
}

const Container = styled.div`
	position: relative;
	height: 100%;
	overflow: hidden;
	cursor: grab;

	& * {
		pointer-events: none !important;
	}
`

export default Provider
