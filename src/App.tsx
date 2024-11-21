import { ThemeProvider } from 'styled-components'
import Flow from './components/Flow'
import * as data from './flowdata.json'
import { ProcessModel } from './models/ProcessModel'
import { GlobalStyles, lightTheme } from './styles/ThemeConfig'

const App = () => {
	return (
		<ThemeProvider theme={lightTheme}>
			<GlobalStyles />
			<Flow data={data.data as ProcessModel[]} />
		</ThemeProvider>
	)
}

export default App
