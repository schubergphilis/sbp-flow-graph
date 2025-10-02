import { CssColorType } from '@schubergphilis/sbp-frontend-style'
import styled from 'styled-components'

export const ActionButton = styled.button<{ $isSelected?: boolean; $color?: CssColorType }>`
	border-radius: 0.5em;
	color: ${({ theme }) => theme.style.zoomToolColor};
	background-color: ${({ $isSelected, $color, theme }) =>
		$isSelected ? theme.style.colorPrimary : $color ? $color : theme.style.colorSecondary};
	height: 3em;
	width: 3em;
	border: 1px solid ${({ theme }) => theme.style.borderColor};
	cursor: pointer;
	pointer-events: all !important;

	&:hover {
		filter: hue-rotate(2deg) brightness(95%);
	}

	&:active {
		filter: hue-rotate(4deg) brightness(90%);
	}

	& svg {
		width: 50%;
		height: 50%;
	}
`
