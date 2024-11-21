import styled from 'styled-components'

interface Props {
	children: JSX.Element | JSX.Element[]
}

const Zoom = ({ children }: Props) => {
	return <Container>{children}</Container>
}

const Container = styled.div`
	position: relative;
	overflow: visible;
	width: 100%;
	height: 100%;
`

export default Zoom
