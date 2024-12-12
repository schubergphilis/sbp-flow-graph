import { PayloadAction, createSlice, current } from '@reduxjs/toolkit'
import NodeModel from '../models/NodeModel'
import PositionModel from '../models/PositionModel'
import { ProcessModel } from '../models/ProcessModel'
import { AppState } from '../store/Store'

// Type for our state
export interface SettingsState {
	dragElement?: string
	isClusterDrag?: boolean
	zoomLevel: number
	panPosition?: PositionModel
	positionList?: NodeModel[]
	dataList?: ProcessModel[]
	update: number
}

// Initial state
const initialState: SettingsState = {
	zoomLevel: 1,
	update: 1
}

// Actual Slice
export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setUpdateState(state) {
			state.update = (state.update || 0) + 1
		},
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
			const positionList: NodeModel[] = [...(state.positionList ?? [])]

			const list = positionList.map((item) => {
				const changedItem = payload.find(({ id }) => id === item.id)
				return changedItem ? changedItem : { ...item, isVisible: false }
			})

			state.positionList = list.length > 0 ? list : payload
		},
		setPositionState(state, { payload }: PayloadAction<NodeModel>) {
			const positionList: NodeModel[] = [...current(state.positionList ?? [])]
			const dataList: ProcessModel[] = [...(state.dataList ?? [])]

			// List To Remove
			const items = dataList
				.filter(({ parent }) => parent === payload.id)
				.map<NodeModel>(({ id }) => ({ id: id, isVisible: true, x: 0, y: 0 }))

			// List of found positions
			const removeList = items
				.flatMap(({ id }) => positionList.find((item) => item.id === id && item.isVisible === false))
				.filter((item) => item !== undefined)

			const newPositionList = positionList.filter((item) => {
				const index = removeList.findIndex(({ id }) => item.id === id)
				return index >= 0 ? false : true
			})

			const index = newPositionList.findIndex(({ id }) => id === payload.id)

			// Remove position when found
			if (index >= 0) newPositionList.splice(index, 1)

			state.positionList = [...newPositionList, payload]
		},
		setVisibleState(state, { payload }: PayloadAction<string>) {
			const id = payload.replace(/^X/gim, '')
			let positionList: NodeModel[] = [...current(state.positionList ?? [])]
			const dataList: ProcessModel[] = [...(state.dataList ?? [])]

			const child = dataList.find(({ parent }) => parent === id)

			if (!child) return

			const showNodes = !(positionList.find(({ id }) => id === child.id)?.isVisible ?? false)

			// List To Affected Nodes
			let items = getVisibilityNodes(dataList, showNodes, id)

			console.log(showNodes, items)

			// List of found positions
			const visibleList = items
				.map(({ id }) => positionList.find((item) => item.id === id))
				.filter((item) => item !== undefined)

			// Change Visibility on found positions
			if (!showNodes) {
				positionList = positionList.map<NodeModel>((item) => {
					const index = visibleList.findIndex(({ id }) => item.id === id && item.isVisible === !showNodes)

					return { ...item, isVisible: index >= 0 ? false : item.isVisible }
				})
				items = []
			}

			state.positionList = [...positionList, ...items]
			state.update = (state.update || 0) + 1
		},
		setDataListState(state, { payload }: PayloadAction<ProcessModel[]>) {
			state.dataList = payload
		}
	}
})

const getVisibilityNodes = (list: ProcessModel[], showNodes: boolean, id: string): NodeModel[] => {
	const items = list
		.filter(({ parent }) => parent === id)
		.flatMap<NodeModel>(({ id, hasChildren }) => {
			let childList: NodeModel[] = []
			if (hasChildren && !showNodes) {
				const nodes = getVisibilityNodes(list, showNodes, id)
				childList = [...childList, ...nodes]
			}
			childList.push({ id: id, isVisible: true, x: 0, y: 0 })
			return childList
		})

	return items
}

export const getDragElementState = (state: AppState): string | undefined => state.settings.dragElement

export const isClusterDragState = (state: AppState): boolean => state.settings.isClusterDrag || false

export const getZoomLevelState = (state: AppState): number => state.settings.zoomLevel

export const getPanPositionState = (state: AppState): PositionModel | undefined => state.settings.panPosition

export const getPositionListState = (state: AppState): NodeModel[] | undefined => state.settings.positionList

export const getDataListState = (state: AppState): ProcessModel[] | undefined => state.settings.dataList

export const getUpdateState = (state: AppState): number => state.settings.update

export const {
	setDragElementState,
	setClusterDragState,
	setZoomLevelState,
	setPanPositionState,
	setPositionListState,
	setPositionState,
	setDataListState,
	setVisibleState,
	setUpdateState
} = settingsSlice.actions

export default settingsSlice.reducer
