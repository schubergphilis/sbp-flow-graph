import { Dispatch, Middleware, MiddlewareAPI, isAction } from '@reduxjs/toolkit'

export interface CustomMiddlewareAPI extends MiddlewareAPI {
	blockList?: string[]
}

export const localStorageMiddleware: Middleware<Dispatch> =
	({ getState, blockList = [] }: CustomMiddlewareAPI) =>
	(next) =>
	(action) => {
		const result = next(action)

		if (!isAction(action)) return result

		const isBlocked = blockList.find((item) => action.type.startsWith(item))

		if (isBlocked !== undefined) return result

		const tempState = { ...getState() }

		blockList.forEach((block) => {
			if (!block.includes('/')) {
				delete tempState[block]
				return
			}

			const items = block.split('/')

			if (tempState[items[0]][items[1]] === null) return

			const { [items[1]]: _, ...other } = tempState[items[0]]

			tempState[items[0]] = other
			return
		})

		localStorage.setItem('applicationState', JSON.stringify(tempState))
	}

export const reHydrateStore = () => {
	if (typeof window === 'undefined' || window.localStorage.getItem('applicationState') === null) return

	return JSON.parse(localStorage.getItem('applicationState') ?? '') // re-hydrate the store
}
