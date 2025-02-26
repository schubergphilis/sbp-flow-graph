import Flow from '@components/Flow'
import { CloudStyle } from '@gmtdi/frontend-shared-components'
import ProcessModel from '@models/ProcessModel'
import { GlobalStyles, lightTheme } from '@styles/ThemeConfig'
import * as data from './flowdata.json'

const App = () => {
	return (
		<CloudStyle lightStyle={lightTheme}>
			<GlobalStyles />
			<Flow data={data.data as ProcessModel[]} />
		</CloudStyle>
	)
}

export default App
