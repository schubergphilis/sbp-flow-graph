import { DefaultFonts, DefaultStyleWithCustomVars, createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
    html,
    body,
    #root,
    .App {
        height: 100%;
    }

`

export const customFonts: DefaultFonts = {
	fontRegular: 'TT Interphases Regular',
	fontBold: 'TT Interphases Bold',
	headerReqular: 'TT Interphases Bold',
	code: 'TT Interphases Mono Regular'
}

export const lightStyle: DefaultStyleWithCustomVars = {
	radius: 8,
	fontSize: 16,
	shadow: 'rgba(2, 12, 23, 0.25)',
	colorBg: 'rgb(255, 255, 255)', // 'rgb(232, 242, 253)',
	fontColor: 'rgb(2, 12, 23)',
	colorPrimary: 'rgb(30, 128, 237)',
	colorSecondary: 'rgb(30, 232, 237)',
	colorCta: 'inherit',
	colorActive: 'rgb(30, 128, 237)',
	colorZebra: 'rgba(0, 0, 0, 0.05)',
	borderColor: 'rgba(22, 12, 23, .15)',
	buttonColor: 'rgb(255, 255, 255)',
	buttonPrimaryColor: 'rgb(255, 255, 255)',
	buttonSecondaryColor: 'rgb(2, 12, 23)',
	buttonActiveColor: 'rgba(22, 12, 23, .75)',
	buttonDisabledColor: 'rgb(255, 255, 255)',
	buttonDisabledColorBg: 'rgba(22, 12, 23, .75)',
	buttonDragColor: 'inherit',
	buttonDragColorBg: 'rgb(255, 255, 255)',
	notificationInfoColor: 'rgb(255, 255, 255)',
	notificationInfoColorBg: 'rgb(52, 152, 219)',
	notificationWarningColor: 'rgb(2, 12, 23)',
	notificationWarningColorBg: 'rgb(255, 204, 0)',
	notificationSuccessColor: 'rgb(255, 255, 255)',
	notificationSuccessColorBg: 'rgb(7, 188, 12)',
	notificationErrorColor: 'rgb(255, 255, 255)',
	notificationErrorColorBg: 'rgb(231, 76, 60)',
	notificationUnknownColor: 'rgb(255, 255, 255)',
	notificationUnknownColorBg: 'rgb(142, 142, 142)',
	cardColorBg: 'rgba(232, 242, 253, .90)',
	inputColorActive: 'rgb(30, 128, 237)',
	inputColorBg: 'rgb(255, 255, 255)',
	inputPlaceholder: 'rgba(22, 12, 23, .5)',
	navigationColorBg: 'rgba(232, 242, 253, .90)'
}
