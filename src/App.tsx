import Flow from '@components/Flow'
import AppleIcon from '@components/icons/AppleIcon'
import RemoveIcon from '@components/icons/RemoveIcon'
import { CloudStyle } from '@gmtdi/frontend-shared-components'
import ProcessModel from '@models/ProcessModel'
import { customFonts, GlobalStyles, lightStyle } from '@styles/ThemeConfig'
import { useCallback, useEffect, useState } from 'react'
import * as flowdata from './flowdata.json'

const App = () => {
	const [data, setData] = useState<ProcessModel[]>()

	useEffect(() => {
		setTimeout(() => {
			setData(flowdata.data as ProcessModel[])
		}, 1000)
	}, [])

	const selectIcon = useCallback((name: string): JSX.Element => {
		switch (name) {
			case 'xx':
				return <RemoveIcon />
			default:
				return <AppleIcon />
		}
	}, [])

	return (
		<CloudStyle lightStyle={lightStyle} fonts={customFonts}>
			<GlobalStyles />
			<Flow
				data={data}
				onNodeClick={() => {
					console.log('test')
				}}
				iconSelector={selectIcon}
				spacing={50}
			/>
		</CloudStyle>
	)
}

export default App
