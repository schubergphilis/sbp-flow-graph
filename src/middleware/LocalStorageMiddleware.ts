import { Dispatch, Middleware, MiddlewareAPI, isAction } from '@reduxjs/toolkit'

export interface CustomMiddlewareAPI extends MiddlewareAPI {
	blockList?: string[]
	id?: string
}

export const localStorageMiddleware: Middleware<Dispatch> =
	({ getState, blockList = [], id }: CustomMiddlewareAPI) =>
	(next) =>
	(action) => {
		const storeId = `${id}State`
		const result = next(action)

		if (!isAction(action)) return result

		const isBlocked = blockList.find((item) => action.type.startsWith(item))

		if (isBlocked !== undefined) return result

		const tempState = { ...getState() }

		for (let i = 0; i < blockList.length; i++) {
			const block = blockList[i]
			if (!block.includes('/')) {
				delete tempState[block]
				continue
			}

			const items = block.split('/')

			if (tempState[items[0]][items[1]] === null) continue

			const { [items[1]]: _, ...other } = tempState[items[0]]

			tempState[items[0]] = other
			continue
		}

		localStorage.setItem(storeId, JSON.stringify(tempState))
	}

export const reHydrateStore = (id: string) => {
	const storeId = `${id}State`

	if (typeof window === 'undefined' || window.localStorage.getItem(storeId) === null) return

	return JSON.parse(localStorage.getItem(storeId) ?? '') // re-hydrate the store
}
