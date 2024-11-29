import { Provider } from 'react-redux'
import styled from 'styled-components'
import { store } from '../store/Store'

interface Props {
	children: JSX.Element | JSX.Element[]
}

export const StateProvider = ({ children }: Props) => {
	return (
		<Provider store={store}>
			<Container data-container>{children}</Container>
		</Provider>
	)
}

const Container = styled.div`
	position: relative;
	height: 100%;
	overflow: hidden;
	cursor: grab;

	& * {
		pointer-events: none;
	}
`

export default StateProvider
