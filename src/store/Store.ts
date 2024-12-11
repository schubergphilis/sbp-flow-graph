import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { CustomMiddlewareAPI, localStorageMiddleware, reHydrateStore } from '../middleware/LocalStorageMiddleware'
import { settingsSlice } from '../store/SettingsSlice'

export const reducers = combineReducers({
	[settingsSlice.name]: settingsSlice.reducer
})

const blockList = ['settings/dragElement', 'settings/isClusterDrag', 'settings/dataList', 'settings/update']

export const store = configureStore({
	reducer: reducers,
	devTools: process.env.NODE_ENV !== 'production',
	preloadedState: reHydrateStore(),
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat((x: CustomMiddlewareAPI) => {
			x.blockList = blockList
			return localStorageMiddleware(x)
		})
})

// Infer the `AppState` and `AppDispatch` types from the store itself
export type AppState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
