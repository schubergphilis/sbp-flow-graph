import DragPositionModel from '@models/DragPositionModel'
import NodeModel from '@models/NodeModel'
import PositionModel from '@models/PositionModel'
import ProcessModel from '@models/ProcessModel'
import { PayloadAction, createSlice, current } from '@reduxjs/toolkit'
import { AppState } from '@store/Store'

// Type for our state
export interface SettingsState {
	selectedElement?: string
	dragElement?: string
	isClusterDrag?: boolean
	zoomLevel: number
	panPosition?: PositionModel
	pageOffset: PositionModel
	positionList?: NodeModel[]
	visibilityList?: string[]
	dataList?: ProcessModel[]
	processedDataList?: ProcessModel[]
	showInfo: boolean
	update?: number
	loaded?: number
	graphId?: string
}

// Initial state
const initialState: SettingsState = {
	zoomLevel: 1,
	showInfo: false,
	pageOffset: { x: 0, y: 0 }
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
		setPageOffsetState(state, { payload }: PayloadAction<PositionModel>) {
			state.pageOffset = payload
		},
		setShowInfoState(state, { payload }: PayloadAction<boolean>) {
			state.showInfo = payload
		},
		setPositionListState(state, { payload }: PayloadAction<NodeModel[]>) {
			const positionList: NodeModel[] = [...(state.positionList ?? [])]

			const list = positionList.map((item) => {
				const changedItem = payload.find(({ id }) => id === item.id)
				return changedItem ? changedItem : { ...item, isVisible: false }
			})

			// Add new nodes to the positionList
			const newNodes = payload.filter((item) => !list.some(({ id }) => item.id === id))

			const all = [...list, ...newNodes]
			state.positionList = all.length > 0 ? all : payload
		},
		setPositionState(state, { payload }: PayloadAction<DragPositionModel>) {
			const positionList: NodeModel[] = [...current(state.positionList ?? [])]
			const dataList: ProcessModel[] = state.dataList ? [...current(state.dataList)] : []

			// List To Affected Nodes
			const items: string[] = payload.isFocused
				? [payload.id]
				: [...getVisibilityNodes(dataList, false, payload.id), payload.id]
			const idSet = new Set(items)

			const affectedPositionList = positionList.filter(({ id }) => idSet.has(id))

			const newPositionList = affectedPositionList.map<NodeModel>((item) => {
				const index = positionList.findIndex(({ id }) => id === item.id)

				if (index >= 0) positionList.splice(index, 1)

				return { ...item, x: item.x + payload.x, y: item.y + payload.y }
			})

			state.positionList = [...positionList, ...newPositionList]
		},
		setInitialVisibleState(state, { payload }: PayloadAction<string>) {
			const list: string[] = state.visibilityList ? [...current(state.visibilityList)] : []
			const dataList: ProcessModel[] = state.dataList ? [...current(state.dataList)] : []

			// Only save initial if list is empty
			if (list.length > 0) return
			// List To Affected Nodes
			const items = getVisibilityNodes(dataList, true, payload)
			state.visibilityList = [payload, ...items]
		},
		setVisibleState(state, { payload }: PayloadAction<string>) {
			const id = payload.match(/(?<=_)([\w-]+)/gim)?.[0] ?? ''
			const list: string[] = state.visibilityList ? [...current(state.visibilityList)] : []
			const dataList: ProcessModel[] = state.dataList ? [...current(state.dataList)] : []

			const child = dataList.find(({ parent }) => parent === id)

			if (!child) {
				console.warn('settingsSlice', 'setVisibleState', 'No visible children found', id)
				return
			}

			const showNodes = !list.includes(child?.id)

			// List To Affected Nodes
			const items = getVisibilityNodes(dataList, showNodes, id)

			if (showNodes) {
				state.visibilityList = [...list, ...items]
			} else {
				const removeSet = new Set(items)
				const result = list.filter((item) => !removeSet.has(item))
				state.visibilityList = result
			}

			state.selectedElement = showNodes ? id : undefined

			state.update = (state.update || 0) + 1
		},
		setDataListState(state, { payload }: PayloadAction<ProcessModel[]>) {
			state.dataList = payload
		},
		setProcessedDataListState(state, { payload }: PayloadAction<ProcessModel[]>) {
			state.processedDataList = payload
		},
		setGraphIdState(state, { payload }: PayloadAction<string>) {
			state.graphId = payload
		},
		setUpdateState(state) {
			state.update = (state.update || 0) + 1
		},
		setLoadedState(state) {
			state.loaded = (state.loaded || 0) + 1
		},
		deleteSelectedElementState(state) {
			state.selectedElement = undefined
		}
	}
})

const getVisibilityNodes = (list: ProcessModel[], showNodes: boolean, id: string): string[] => {
	return list
		.filter(({ parent }) => parent === id)
		.flatMap<string>(({ id, hasChildren }) => {
			let childList: string[] = []
			if (hasChildren && !showNodes) {
				const nodes = getVisibilityNodes(list, showNodes, id)
				childList = [...childList, ...nodes]
			}
			childList.push(id)
			return childList
		})
}

export const getDragElementState = (state: AppState): string | undefined => state.settings.dragElement

export const isClusterDragState = (state: AppState): boolean => state.settings.isClusterDrag || false

export const getZoomLevelState = (state: AppState): number => state.settings.zoomLevel

export const getPanPositionState = (state: AppState): PositionModel | undefined => state.settings.panPosition

export const getPageOffsetState = (state: AppState): PositionModel => state.settings.pageOffset

export const getPositionListState = (state: AppState): NodeModel[] | undefined => state.settings.positionList

export const getVisibilityListState = (state: AppState): string[] | undefined => state.settings.visibilityList

export const getDataListState = (state: AppState): ProcessModel[] | undefined => state.settings.dataList

export const getProcessedDataListState = (state: AppState): ProcessModel[] | undefined =>
	state.settings.processedDataList

export const getUpdateState = (state: AppState): number => state.settings.update

export const getLoadedState = (state: AppState): number => state.settings.loaded

export const getShowInfoState = (state: AppState): boolean => state.settings.showInfo

export const getGraphIdState = (state: AppState): string => state.settings.graphId ?? 'flowGraph'

export const getSelectedElementState = (state: AppState): string | undefined => state.settings.selectedElement

export const {
	setDragElementState,
	setClusterDragState,
	setZoomLevelState,
	setPanPositionState,
	setPositionListState,
	setPositionState,
	setPageOffsetState,
	setDataListState,
	setProcessedDataListState,
	setVisibleState,
	setInitialVisibleState,
	setShowInfoState,
	setGraphIdState,
	setUpdateState,
	setLoadedState,
	deleteSelectedElementState
} = settingsSlice.actions

export default settingsSlice.reducer
