import { DefaultFonts, DefaultStyle, createGlobalStyle } from 'styled-components'
import { DefaultTheme } from 'styled-components/dist/types'

export const GlobalStyles = createGlobalStyle`
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        text-decoration: none;
        outline: none;
        list-style: none;
        border: none;
        background: none;
        font-size: inherit;
        font-family: inherit;
        line-height: inherit;
        color: inherit;
    }

    html {
        scrollbar-gutter: stable;
    }

    body {
        margin: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        background-color: ${({ theme }) => theme.style.colorBg};
        font-family: ${({ theme }) => theme.fonts.fontRegular}, Arial, sans-serif;
                    
        font-size: ${({ theme }) => theme.style.fontSize}px;
        color: ${({ theme }) => theme.style.fontColor};
        line-height: 1.5em;
    }

    html,
    body,
    #root,
    .App {
        height: 100%;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        font-family: ${({ theme }) => theme.fonts.headerReqular}, Arial, sans-serif;
        line-height: 1.25em;
        letter-spacing: -.04em;
    }

    h1 {
        font-weight: 800;
        font-size: 2.5em;
    }
    
    h2, h3, h4 {
        color: inherit;
        font-size: 1.625em;
    }

    h3 {
        font-size: 1.5em;
    }
    
    h4 {
        font-size: 1.25em;
    }

    a {
        border-bottom: 1px solid ${({ theme }) => theme.style.colorPrimary};
        &:hover {
            color: ${({ theme }) => theme.style.colorPrimary};
            border-bottom: 1px solid ${({ theme }) => theme.style.colorPrimary};
        }
    }

    sup,
    sub {
        font-size: 0.75em;
    }

    code {
        font-family: ${({ theme }) =>
					theme.fonts.code}, source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    }

    svg {
        display: inline-block;
        vertical-align: middle;
    }

	@keyframes rotating {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
`

const customFonts: DefaultFonts = {
	fontRegular: 'TT Interphases Regular',
	fontBold: 'TT Interphases Bold',
	headerReqular: 'TT Interphases Bold',
	code: 'TT Interphases Mono Regular'
}

const customLightStyle: DefaultStyle = {
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
	cardColorBg: 'rgba(232, 242, 253, .90)',
	inputColorActive: 'rgb(30, 128, 237)',
	inputColorBg: 'rgb(255, 255, 255)',
	inputPlaceholder: 'rgba(22, 12, 23, .5)',
	navigationColorBg: 'rgba(232, 242, 253, .90)'
}

export const lightTheme: DefaultTheme = {
	style: customLightStyle,
	fonts: customFonts
}
