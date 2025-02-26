import { useEffect, useRef } from 'react'

export const useDidMountEffect = (func: VoidFunction, deps: any[]) => {
	const didMount = useRef<boolean>(false)

	useEffect(() => {
		if (didMount.current || deps.some((x) => typeof x === 'boolean' && x === true)) func()
		else didMount.current = true
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)
}
