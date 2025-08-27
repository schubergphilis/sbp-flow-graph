import { CustomMiddlewareAPI, localStorageMiddleware, reHydrateStore } from '@middleware/LocalStorageMiddleware'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { settingsSlice } from '@store/SettingsSlice'

export const reducers = combineReducers({
	[settingsSlice.name]: settingsSlice.reducer
})

export const createAppStore = (storeId: string) => {
	const blockList = [
		'settings/dragElement',
		'settings/isClusterDrag',
		'settings/dataList',
		'settings/update',
		'settings/selectedElement'
		// 'settings/positionList'
	]

	return configureStore({
		reducer: reducers,
		devTools: process.env.NODE_ENV !== 'production',
		preloadedState: reHydrateStore(storeId),
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat((x: CustomMiddlewareAPI) => {
				x.blockList = blockList
				x.id = storeId
				return localStorageMiddleware(x)
			})
	})
}

// Infer the `AppState` and `AppDispatch` types from the store itself
export type AppState = ReturnType<typeof createAppStore.prototype.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof createAppStore.prototype.dispatch
