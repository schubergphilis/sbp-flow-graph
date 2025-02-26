import { store } from '@store/Store'
import { Provider } from 'react-redux'
import styled from 'styled-components'

interface Props {
	children: JSX.Element | JSX.Element[]
	isDebug?: boolean
}

export const StateProvider = ({ children, isDebug = false }: Props) => {
	return (
		<Provider store={store}>
			<Container data-container $isDebug={isDebug}>
				{children}
			</Container>
		</Provider>
	)
}

const Container = styled.div<{ $isDebug: boolean }>`
	position: relative;
	height: 100%;
	overflow: hidden;
	cursor: grab;

	& * {
		pointer-events: none;
	}

	${({ $isDebug }) =>
		$isDebug &&
		`
			&::before {
				content: '';
				width: 0.5em;
				height: 0.5em;
				position: absolute;
				left: 50vw;
				top: 50vh;
				background-color: red;
				border-radius: 50%;
			}
		`}
`

export default StateProvider
