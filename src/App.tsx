import Flow from '@components/Flow'
import ProcessModel from '@models/ProcessModel'
import { GlobalStyles, lightTheme } from '@styles/ThemeConfig'
import { ThemeProvider } from 'styled-components'
import * as data from './flowdata.json'

const App = () => {
	return (
		<ThemeProvider theme={lightTheme}>
			<GlobalStyles />
			<Flow data={data.data as ProcessModel[]} />
		</ThemeProvider>
	)
}

export default App
