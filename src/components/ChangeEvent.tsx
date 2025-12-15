import { useAppSelector } from '@hooks/ReduxStore'
import debounce from 'lodash.debounce'
import { useEffect, useMemo } from 'react'

interface Props {
	onChange?: VoidFunction
}
const ChangeEvent = ({ onChange }: Props) => {
	const isChanged = useAppSelector((state) => state)

	const debouncedOnChange = useMemo(() => debounce(onChange ?? (() => {}), 1000), [onChange])

	useEffect(() => {
		if (typeof onChange === 'function') debouncedOnChange()
	}, [isChanged, debouncedOnChange, onChange])

	return null
}

export default ChangeEvent
