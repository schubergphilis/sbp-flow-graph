import { CssColorType } from '../datatypes/CssColorType'

declare module 'styled-components' {
	export interface DefaultFonts {
		fontRegular: string
		fontBold: string
		fontItalic?: string
		fontLight?: string
		headerReqular: string
		headerLight?: string
		code?: string
	}

	export interface DefaultStyle {
		radius?: number
		fontSize?: number
		shadow?: CssColorType
		fontColor?: CssColorType
		colorBg?: CssColorType
		colorPrimary?: CssColorType
		colorSecondary?: CssColorType
		colorCta?: CssColorType
		colorActive?: CssColorType
		colorZebra?: CssColorType
		borderColor?: CssColorType
		buttonColor?: CssColorType
		buttonPrimaryColor?: CssColorType
		buttonSecondaryColor?: CssColorType
		buttonActiveColor?: CssColorType
		buttonDisabledColor?: CssColorType
		buttonDisabledColorBg?: CssColorType
		buttonDragColor?: CssColorType
		buttonDragColorBg?: CssColorType
		notificationInfoColor?: CssColorType
		notificationInfoColorBg?: CssColorType
		notificationWarningColor?: CssColorType
		notificationWarningColorBg?: CssColorType
		notificationSuccessColor?: CssColorType
		notificationSuccessColorBg?: CssColorType
		notificationErrorColor?: CssColorType
		notificationErrorColorBg?: CssColorType
		cardColorBg?: CssColorType
		inputColorActive?: CssColorType
		inputColorBg?: CssColorType
		inputPlaceholder?: CssColorType
		navigationColorBg?: CssColorType
	}

	export interface DefaultTheme {
		style: DefaultStyle
		fonts: DefaultFonts
	}
}

export {}
