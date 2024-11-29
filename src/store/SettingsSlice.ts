import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import NodeModel from '../models/NodeModel'
import PositionModel from '../models/PositionModel'
import { AppState } from '../store/Store'

// Type for our state
export interface SettingsState {
	dragElement?: string
	isClusterDrag?: boolean
	zoomLevel: number
	panPosition?: PositionModel
	positionList?: NodeModel[]
}

// Initial state
const initialState: SettingsState = {
	zoomLevel: 1
}

// Actual Slice
export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setDragElementState(state, { payload }: PayloadAction<string | undefined>) {
			state.dragElement = payload
		},
		setClusterDragState(state, { payload }: PayloadAction<boolean>) {
			state.isClusterDrag = payload
		},
		setZoomLevelState(state, { payload }: PayloadAction<number>) {
			state.zoomLevel = payload
		},
		setPanPositionState(state, { payload }: PayloadAction<PositionModel>) {
			state.panPosition = payload
		},
		setPositionListState(state, { payload }: PayloadAction<NodeModel[]>) {
			state.positionList = payload
		},
		setPositionState(state, { payload }: PayloadAction<NodeModel>) {
			const list = [...(state.positionList ?? [])]
			const index = list.findIndex((item) => item.id === payload.id)

			// Remove position when found
			if (index >= 0) list.splice(index, 1)

			state.positionList = [...list, payload]
		}
	}
})

export const getDragElementState = (state: AppState): string | undefined => state.settings.dragElement

export const isClusterDragState = (state: AppState): boolean => state.settings.isClusterDrag || false

export const getZoomLevelState = (state: AppState): number => state.settings.zoomLevel

export const getPanPositionState = (state: AppState): PositionModel | undefined => state.settings.panPosition

export const getPositionListState = (state: AppState): NodeModel[] | undefined => state.settings.positionList

export const {
	setDragElementState,
	setClusterDragState,
	setZoomLevelState,
	setPanPositionState,
	setPositionListState,
	setPositionState
} = settingsSlice.actions

export default settingsSlice.reducer
